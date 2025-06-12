---
title: Part 4 - Error Handling for Writes to External Data Stores 
---

# Part 4: Error Handling for Writes to External Data Stores

Writing to multiple data stores consistently is a critical challenge in distributed systems. Without proper handling, your data can become:

- **Lost** - when failures occur during processing
- **Duplicated** - when the same operation is performed multiple times
- **Corrupted** - when partial updates leave data in an inconsistent state

Traditional solutions often rely on distributed transactions, which add complexity and can impact performance. KurrentDB provides built-in features specifically designed to address these challenges more elegantly.

In this section, you'll explore practical failure scenarios that commonly occur when writing to external data stores like PostgreSQL, and how they can be handled with a combination of KurrentDB features and application code.

## Step 9: Handle Application Outage with Checkpoints

Event processing applications like the order processor can sometimes go down while processing historic or live events from a persistent subscription. When this happens, we typically want to avoid reprocessing all previous messages for two main reasons:

- **Data duplication risks**: Reprocessing messages can cause duplicate data in external systems, especially those that don't support idempotency or deduplication (such as email sending operations).

- **Performance concerns**: Reprocessing large volumes of events can significantly impact system performance, particularly when the stream contains many events.

KurrentDB addresses this challenge using checkpoints in persistent subscriptions.

In this step, we'll examine how event processing applications can recover from and outage, and how KurrentDB's checkpoint mechanism minimizes the number of events that need to be reprocessed when it happens.

::: info Checkpoint in Persistent Subscription
Checkpoints in persistent subscriptions are records of the last successfully processed event position, stored as events with in system streams. 

They enable subscriptions to resume from their last position after interruptions (like server restarts or leader changes), though this may result in some events being received multiple times by consumers since checkpoints are written periodically rather than after every event.

[Click here](https://docs.kurrent.io/server/v25.0/features/persistent-subscriptions.html#checkpointing) for more information about checkpoints in persistent subscriptions.
:::

1. Run this command in the terminal to display the current information of the consumer group:

   ```sh
   curl -s http://localhost:2113/subscriptions/%24ce-order/fulfillment/info | \
   jq '{totalItemsProcessed, lastCheckpointedEventPosition, lastKnownEventNumber}'
   ```

   You should see that four items have been processed by the consumer group so far:

   ```
   "totalItemsProcessed": 4,
   ```

   This means the consumer group has four acks - one for each order queried previously.

   You should also see that the last checkpointed event position is 3:

   ```
   "lastCheckpointedEventPosition": "3",
   ```
   
   This means that the consumer group will resume from position 3 even if there is an application outage.

   Finally, you should also see that the last known event number is 3:

   ```
   "lastKnownEventNumber": 3,
   ```

   This is the event number of the last and fourth `OrderPlaced` event in `$ce-order`. ("3" is displayed since event numbers are zero-based).
   
   

2. Run this command in the terminal to stop the order processor application. This simulates an application outage:

   ```sh
   docker compose --profile app stop
   ```

3. Run this command in the terminal to append two more new `OrderPlaced` events in KurrentDB while the application is down:
   
   ```sh
   ./scripts/3-generate-data-during-app-outage.sh
   ```

4. Run this command in the terminal to display the current information of the consumer group:

   ```sh
   curl -s http://localhost:2113/subscriptions/%24ce-order/fulfillment/info | \
   jq '{totalItemsProcessed, lastCheckpointedEventPosition, lastKnownEventNumber}'
   ```

   You should see that the `totalItemsProcessed` is still "4":

   ```
   "totalItemsProcessed": 4,
   ```

   This is expected even though two new `OrderPlaced` events were appended. This is because the application is currently down.

   You should also see that the last checkpointed event position is still 3:

   ```
   "lastCheckpointedEventPosition": "3",
   ```

   This is because no new events have been processed yet, so the checkpoint has not been updated.
   
   However, you should see that the `lastKnownEventNumber` is 5 instead of 3:

   ```
   "lastKnownEventNumber": 5,
   ```
   
   This means the consumer group is aware that two more events were appended.

5.  Run this command in the terminal to stop the order processor application. This simulates an application recovery:

   ```sh
   docker compose --profile app start
   ```

6. Run this command in the terminal to view the application log after the application has restarted:

   ```sh
   docker compose --profile app logs -f
   ```

   Within a few seconds, you should see messages that indicate that the two new events are created:

   ```
   orderprocessor  | OrderProcessor started
   orderprocessor  | Subscribing events from stream
   orderprocessor  | Received event #4 in $ce-order stream
   orderprocessor  | Order fulfillment for order-36bf75fe641e453b906946ba4b5288c5 created.
   orderprocessor  | Received event #5 in $ce-order stream
   orderprocessor  | Order fulfillment for order-babc43583617421a90d4c7d039900142 created.
   ```

   Notice how the processor received events starting from event #4 because of the previously saved checkpoint.

7. Press `ctrl + c` to exit follow mode.

   :::: info How often are Checkpoints Saved?
   The frequency at which checkpoints are saved depends on three key configuration parameters:

   - **minCheckpointCount** - Minimum number of events before a checkpoint may be written
   - **maxCheckpointCount** - Maximum number of events before forcing a checkpoint
   - **checkPointAfterMilliseconds** - Time-based threshold for checkpoint creation
   
   For this tutorial, we've configured these parameters to their minimum values to ensure checkpoints are saved after each processed event. This makes the behavior more predictable and easier to observe.

   ::: warning Performance Note
   While frequent checkpointing provides better recovery guarantees, it's not necessarily the best practice for production environments. Each checkpoint operation triggers a disk write, so excessive checkpointing can introduce significant performance overhead. In production, you should balance recovery needs with performance considerations. 
   
   See [Step 4](/getting-started/use-cases/outbox/tutorial-3.md#step-4-create-a-kurrentdb-persistent-subscription-consumer-group) for more information.
   :::
   
   ::::

8.  Run this command in the terminal to display the current information of the consumer group:

   ```sh
   curl -s http://localhost:2113/subscriptions/%24ce-order/fulfillment/info | \
   jq '{totalItemsProcessed, lastCheckpointedEventPosition, lastKnownEventNumber}'
   ```

   You should see that the `totalItemsProcessed` is now 6 instead of 4:

   ```
   "totalItemsProcessed": 6,
   ```

   And the checkpoint has been updated to 5:
   
   ```
   "lastCheckpointedEventPosition": "5",
   ```
   
   But the `lastKnownEventNumber` is still 5:

   ```
   "lastKnownEventNumber": 5,
   ```
   
9. Run this command in the terminal to start PostgreSQL CLI:

   ```sh
   docker exec -it postgres psql -U postgres
   ```

10. Run this command in Postgres CLI to list the orders that have started the order fulfillment process:

   ```sql
   select orderid from OrderFulfillment;
   ``` 

   You should now see a total of six orders:

   ```
   orderid
   ----------------------------------------
   order-b0d1a15a21d24ffa97785ce7b345a87e
   order-f16847c9a2e44b23bdacc5c92b6dbb25
   order-44c1c762ca1d440bb2e03a2655ba7edb
   order-c49064f930344a72bd6173db57e43f78
   order-36bf75fe641e453b906946ba4b5288c5
   order-babc43583617421a90d4c7d039900142
   ```

11. Exit Postgres CLI by running the command:

   ```
   exit
   ```

## Step 10. Handle Transient Errors by Retrying Events

Transient errors are temporary failures that resolve themselves over time. Examples include database disconnections, network issues, or service restarts. When these errors occur, the best strategy is often to retry processing rather than failing permanently.

For example, if PostgreSQL becomes unavailable while the order processor is running:

- The database connection fails
- The OrderPlaced event processing throws an exception
- Without retry logic, this event would be lost
- With retry logic, processing resumes once the database recovers

Most transient errors resolve within seconds or minutes. KurrentDB's persistent subscriptions provide built-in retry capabilities, helping your system maintain data consistency during temporary outages.

In this step, you'll see how these retries prevent data loss when database connectivity is interrupted.

1. Run this command in the terminal to stop PostgreSQL to simulate a database outage:

   ```sh
   docker compose --profile db stop postgres
   ```

2. Run this command in the terminal to append 2 new `OrderPlaced` events in KurrentDB:

   ```sh
   ./scripts/4-generate-data-during-db-outage.sh
   ```

3. Run this command in the terminal to view the application log in follow mode:

   ```sh
   docker compose --profile app logs -f
   ```

4. Wait for a few seconds and you will start to notice messages that indicate a transient error is detected and the application will retry the event:

   ```
   orderprocessor  | Detected DB transient error Name or service not known. Retrying.
   orderprocessor  | Received event #4 in $ce-order stream
   orderprocessor  | Detected DB transient error Name or service not known. Retrying.
   orderprocessor  | Received event #5 in $ce-order stream
   ```

   Notice that the application retries this continuously for a while.

5. Press `ctrl + c` to exit follow mode.

6. Run this command in the terminal to stop PostgreSQL to simulate database recovery:

   ```sh
   docker compose --profile db start postgres
   ```

7. Run this command in the terminal to view the application log in follow mode again:

   ```sh
   docker compose --profile app logs -f
   ```

   Wait for a while and notice that the event processing that have been retrying continuously has now been processed.

   ```
   orderprocessor  | Received event #6 in $ce-order stream
   orderprocessor  | Order fulfillment for order-3d268df88f9c451eae9cae49d10656d5 created.
   orderprocessor  | Received event #7 in $ce-order stream
   orderprocessor  | Order fulfillment for order-ad53653936ff469ea208cce8726906eb created.
   ```

8. Press `ctrl + c` to exit follow mode.

   ::: warning Use Idempotency to Handle Out-of-Order and Duplicate Events
   Depending on how the persistent subscription is configured and when a transient error is recovered, you may notice events are being retried multiple times and in a different order than you expect.

   Because of this, you should always design your event handling logic to be idempotent. In other words, processing the same event more than once—or receiving it out of order—should not break your application or result in inconsistent data.

   See [Step 7](/getting-started/use-cases/outbox/tutorial-3.md#step-7-examine-the-order-processor-application-codebase) for more information.
   :::

9. Run this command in the terminal to start PostgreSQL CLI:

   ```sh
   docker exec -it postgres psql -U postgres
   ```

10. Run this command in Postgres CLI to list the orders that have started the order fulfillment process:

   ```sql
   select orderid from OrderFulfillment;
   ``` 

   You should now see the eight orders in total:

   ```
   orderid
   ----------------------------------------
   order-b0d1a15a21d24ffa97785ce7b345a87e
   order-f16847c9a2e44b23bdacc5c92b6dbb25
   order-44c1c762ca1d440bb2e03a2655ba7edb
   order-c49064f930344a72bd6173db57e43f78
   order-36bf75fe641e453b906946ba4b5288c5
   order-babc43583617421a90d4c7d039900142
   order-3d268df88f9c451eae9cae49d10656d5
   order-ad53653936ff469ea208cce8726906eb
   ```

11. Exit Postgres CLI by running the command:

   ```
   exit
   ```
## Step 11. Examine How Transient Errors are Handled in the Codebase

1. Run this command in the terminal to open the main program for the order processor application:

   ```sql
   code ./OrderProcessor/Program.cs
   ```

2. Locate and examine the code that handles transient errors:

   ```cs
   catch (Exception ex)
    {
        // ------------------------------------------------------------- //
        // Warning: This is just one example of a transient error check  //
        //          You should to add more checks based on your needs    //
        // ------------------------------------------------------------- //
        var exceptionIsTransient =                                              // Exception is transient if it matches one of the following patterns:
            ex is SocketException ||                                            // SocketException indicating a network error (https://learn.microsoft.com/en-us/dotnet/api/system.net.sockets.socketexception?view=dotnet-plat-ext-7.0)    
            ex is NpgsqlException { IsTransient: true };                        // Postgres exception indicating the error is transient (https://www.npgsql.org/doc/api/Npgsql.NpgsqlException.html#Npgsql_NpgsqlException_IsTransient)

        if (exceptionIsTransient)                                               // If exception is transient..
        {
            Console.WriteLine($"Detected DB transient error {ex.Message}. Retrying.");
            await subscription.Nack(PersistentSubscriptionNakEventAction.Retry, // Send a not acknowledge message to the consumer group and request it to retry
                "Detected DB transient error", e);
            Thread.Sleep(1000);                                                 // Wait for a second before retrying to avoid overwhelming the database
        }
   ```

   To handle transient errors, you can: 
   - Identify a list of errors that are recoverable
   - Catch these errors and call `subscription.Nack()` to send a not acknowledge message to KurrentDB with the `Retry` flag

   With this approach, KurrentDB will re-send the event again for a configured number of time (defined by `maxRetryCount`). If the error is recovered before this, then the processor will successfully handle this error. Otherwise, KurrentDB will park this event.

   ::: warning Customize Transient Error Handling
   The list of transient errors provided in our example is not exhaustive and may not fully reflect the conditions in your environment. You should treat it as a starting point and customize it based on your infrastructure, observed failure modes, and testing.

   Be sure to evaluate and expand this list to include any additional error types that are specific to your setup or likely to occur in your system.
   :::

   ::: info Parking Events in Persistent Subscription
   An event can be saved, or "parked," in a special stream dedicated to persistent subscriptions. This parked event can later be reviewed for debugging or troubleshooting, such as checking if it contains a specific error. If the underlying issue is fixed, the event can also be replayed. This process is commonly referred to as "dead-lettering."

   [Click here](https://docs.kurrent.io/server/v25.0/features/persistent-subscriptions.html#parked-messages) for more information about parking.
   :::

   ::: warning Dangers of Setting a High `maxRetryCount` Configuration
   The `maxRetryCount` configuration of the consumer group sets the number of times it should retry an event when it is instructed. While a high `maxRetryCount` may increase the chance for a transient error to recover while it waits for server to recover, it can also increase the load on the server that may already be under distress with high load, making it more difficult to recover.

   You should ensure that `maxRetryCount` is set appropriately so that it does not potentially overload a recovering server.
   :::

## Step 12. Handle Permanent Errors by Skipping Events

Event processors sometimes encounter permanent errors that cannot be resolved through retries. These unrecoverable errors can sometimes result from say a malformed events with structural or syntactical problems.

When these permanent errors occur, continuous retrying is futile and blocks subsequent events in the stream from being processed.

One solution is to skip the problematic event, allowing the processor to continue with other events in the stream. 

In this step, you will find out how to detect and skip events that trigger permanent errors.


1. Run this command in the terminal to generate an invalid `OrderPlaced` event:

   ```sh
   curl -X POST \
      -H "Content-Type: application/vnd.eventstore.events+json" \
      http://localhost:2113/streams/order-b3f2d72c-e008-44ec-a612-5f7fbe9c9240 \
      -d '
         [
            {
                  "eventId": "fbf4a1a1-b4a3-4dfe-a01f-ec52c34e16e4",
                  "eventType": "order-placed",
                  "data": {
                     "thisEvent": "is invalid"
                  }
            }
         ]'
   ```

2. Run this command in the terminal to view the application log of the order processor application:

   ```sh
   docker compose --profile app logs -f
   ```

   Within a few seconds, you should see a new log message indicating a permanent error has been detected and the event has been skipped.

   ```
   orderprocessor  | Received event #8 in $ce-order stream
   orderprocessor  | Detected permanent error Order ID cannot be null or empty (Parameter 'orderId'). Skipping.
   ```

3. Press `ctrl + c` to exit follow mode.

## Step 13. Examine How Permanent Errors are Handled in the Codebase

1. Run this command in the terminal to open the main program for the order processor application:

   ```sql
   code ./OrderProcessor/Program.cs
   ```

2. Locate and examine the code that handles permanent errors:

   ```cs
   catch (Exception ex)
    {        
        if (exceptionIsTransient)                                               // If exception is transient..
        {
            ...
        }
        else                                                                    // If exception is not transient (i.e. permanent)..
        {
            Console.WriteLine($"Detected permanent error {ex}. Skipping.");
            await subscription.Nack(PersistentSubscriptionNakEventAction.Skip, // Send a not acknowledge message to the consumer group and request it to skip
                "Detected permanent error", e);
        }
   ```

   Errors not classified as transient are considered permanent errors. To handle these unrecoverable situations, call `subscription.Nack()` with the `PersistentSubscriptionNakEventAction.Skip` flag.

   This instructs the consumer group to skip processing the problematic event and deliver the next available event in the stream.