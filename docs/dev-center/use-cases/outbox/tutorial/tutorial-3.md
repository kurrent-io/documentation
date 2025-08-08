---
title: Part 3 - Write to a External Data Store with Persistent Subscription
---

# Part 3: Write to a External Data Store with Persistent Subscription

Now that the event that triggers multiple writes is appended to KurrentDB, you will learn how to handle this event to update a external data store (Postgres) in an eventually consistent way.

In this tutorial you will achieve this by running the order processor application. 

This is a sample application within the order fulfillment system that listens for `OrderPlaced` events with a KurrentDB persistent subscription. Whenever it receives an event, it will kickstart an order fulfillment process simulated by inserting a record in a PostgreSQL table.

## Step 4: Create a KurrentDB Persistent Subscription Consumer Group

A persistent subscription consumer group is created on KurrentDB to handle the triggering event. This allows client applications to subscribe to events from KurrentDB.

::: info Persistent Subscription and Consumer Group
Persistent subscriptions in KurrentDB are maintained by the server rather than the client. Keeping their position (checkpoint) on the server side, allows them to continue from where they left off if the connection is closed or interrupted.

Consumer groups are a concept used with persistent subscriptions that enable the competing consumers pattern, where each clients belonging to a single consumer group receive a portion of events, allowing for load balancing and parallel processing. Multiple consumer groups can be created for the same stream, each operating independently with its own checkpoint position maintained by the server.

[Click here](https://docs.kurrent.io/server/v25.0/features/persistent-subscriptions.html) for more information about persistent subscription and consumer groups.
:::

1. Run this command in the terminal to create the persistent subscription:

   ```sh
   curl -X PUT -d $'{ "minCheckPointCount": 0, "maxCheckPointCount": 0, "resolveLinktos": true, "maxRetryCount": 100 }' \
    http://localhost:2113/subscriptions/%24ce-order/fulfillment \
    -H "Content-Type: application/json"
   ```

   You will see the following message:

   ```json
   {
      "correlationId": "f7aac1a3-b5ea-415c-9e3d-d54c0b465d29",
      "reason": "",
      "result": "Success",
      "label": "ClientMessageCompleted"
   }
   ```

   This creates a consumer group called `fulfillment` that subscribes to the `$ce-order` stream you reviewed in the previous step.

   :::: warning Review and adjust these settings before applying to production
   The checkpoint and retry configuration values above are for demonstration only and may not be suitable for a production use. To avoid performance bottlenecks or unexpected behavior, be sure to test and tune them based on your expected workload.

   ::: details Checkpoint and Retry Configurations Explained
   The configurations above determine how your consumer group processes events and manages checkpoints:

   | Configuration Option           | Explanation            |
   |--------------------------------|----------------------|
   | `minCheckPointCount`           | The minimum number of messages that must be processed before a checkpoint may be written   |
   | `maxCheckPointCount`           | The maximum number of messages not checkpointed before forcing a checkpoint, preventing excessive event reprocessing after failures |
   | `maxRetryCount`                | The maximum number of retries (due to timeout) before a message is considered to be parked, preventing infinite retry loops for problematic events |
   :::

   [Click here](https://docs.kurrent.io/server/v25.0/features/persistent-subscriptions.html#checkpointing) for more information about checkpoints.

   [Click here](https://docs.kurrent.io/server/v25.0/features/persistent-subscriptions.html#acknowledging-messages) for more information about retries.
   ::::


## Step 5. Review the Consumer Group from the KurrentDB Admin UI

1. Navigate to the KurrentDB Admin.

   ::: tip
   If you are unsure what its URL is, you can execute the following script in your codespaces terminal to find out:

   ```sh
   ./scripts/get-kurrentdb-ui-url.sh
   ```
   :::

2. Click the `Persistent Subscriptions` link from the top navigation bar.

3. Click on `$ce-order` directly below the `Stream/Group(s)` column header in the dashboard. The `fulfillment` consumer group should be listed under `$ce-order`.

## Step 6. Start the Order Processor Application

When the order processor application is started, it will connect to the `fulfillment` subscription created during the previous step and begin to process any events in the `$ce-order` stream.

1. Run this command in the terminal to start the order processor application:
   
   ```sh
   ./scripts/start-app.sh
   ```

   You will receive a message, like below, printed in the terminal:

   ```
   All apps are running.
   ```

2. Run this command in the terminal to view the application log of the order processor application in follow mode:

   ```sh
   docker compose --profile app logs -f
   ```

   Within a few seconds, you should see messages that indicate two order fulfillment processes have been started:

   ```
   orderprocessor  | OrderProcessor started
   orderprocessor  | Subscribing events from stream
   orderprocessor  | Received event #0 in $ce-order stream
   orderprocessor  | Order fulfillment for order-b0d1a15a21d24ffa97785ce7b345a87e started.
   orderprocessor  | Received event #1 in $ce-order stream
   orderprocessor  | Order fulfillment for order-f16847c9a2e44b23bdacc5c92b6dbb25 started.
   ```

3. Press `ctrl + c` to exit follow mode.

4. Run this command in the terminal to start PostgreSQL CLI:

   ```sh
   docker exec -it postgres psql -U postgres
   ```

   You will receive a message, like below, printed in the terminal:

   ```
   psql (16.8 (Debian 16.8-1.pgdg120+1))
   Type "help" for help.

   postgres=#
   ```

5. Run this command in Postgres CLI to list the orders that have started the order fulfillment process:

   ```sql
   select orderid from OrderFulfillment;
   ``` 

   You should see two orders in the table that match the orders listed in the application log.

   ::: tip
   If you're stuck with the output and can't exit, press `q` to exit. You're likely in paging mode because the output has overflowed.
   :::

6. Exit Postgres CLI by running the command:

   ```
   exit
   ```
   
::: info Alternative Ways to Kickstart the Order Fulfillment Process
Inserting a record into a relational database is just one of the many ways to kickstart the order fulfillment process. Alternatively, the order processor could have also triggered this by:

- Making a REST call to the order fulfillment API
- Publishing a message to a message broker
- Sending an email to a the fulfillment department to manually kickstart the process
- Appending an event to a OrderFufillment stream in KurrentDB
- etc.
  
For demonstration purposes in this tutorial, an insert into a table would suffice.
:::

## Step 7. Examine the Order Processor Application Codebase

1. Run this command in the terminal to open the main program for the order processor application:

   ```sql
   code ./OrderProcessor/Program.cs
   ```

   Most of the code snippets leveraged in this step can be found within this file.

2. Locate and examine the code that subscribes to stream:

   ```cs
   await using var subscription = kurrentdb.SubscribeToStream(                     // Subscribe to the $ce-order stream in KurrentDB
         "$ce-order",
         "fulfillment");
   ```

   A subscription is created that subscribes to events from the `$ce-order` stream via the `fulfillment` consumer group.


   ::: info Different Types of Subscriptions
   This sample uses persistent subscriptions to subscribe to events. You can also use catch-up subscriptions or connectors to achieve a similar result. 

   [Click here](https://docs.kurrent.io/clients/subscriptions.html) for more information about catch-up subscriptions

   [Click here](https://docs.kurrent.io/server/v25.0/features/connectors/) for more information about connectors
   :::

3. Locate and examine the code that processes each event:

   ```cs
   await foreach (var message in subscription.Messages)                            // Iterate through the messages in the subscription
   {
      if (message is PersistentSubscriptionMessage.NotFound)                       // Skip this message if the subscription is not found
      {
         Console.WriteLine("Persistent subscription consumer group not found." +
               "Please recreate it.");
         continue;
      }

      if (message is not PersistentSubscriptionMessage.Event(var e, _))            // Skip this message if it is not an event 
               continue;                                                   

      try
      {
         Console.WriteLine($"Received event #{e.Link.EventNumber} in " +           // Log the event number of the event in the $ce-order stream
                           $"{e.Link.EventStreamId} stream");             
        if (EventEncoder.Decode(e.Event.Data, "order-placed")                      // Try to deserialize the event to an OrderPlaced event
               is not OrderPlaced orderPlaced)                                     // Skip this message if it is not an OrderPlaced event
               continue;

         repository.StartOrderFulfillment(orderPlaced.orderId);                    // Process the OrderPlaced event by inserting an order fulfillment record into Postgres

         await subscription.Ack(e);                                                // Send an acknowledge message to the consumer group so that it will send the next event
      }
   ```

   The code shows a key part of an event processing pipeline that:

   - Processes subscription messages from KurrentDB event store's `$ce-order` stream

   - Performs filtering by:
      - Skipping non-event messages
      - Skipping messages where the subscription isn't found
      - Only processing "order-placed" events
   
   - Handles order events by:
      - Deserializing the event data into an `OrderPlaced` object
      - Starting order fulfillment by calling `repository.StartOrderFulfillment()`
   
   - Acknowledges successful processing with `subscription.Ack()` to tell the consumer group to send the next event

   ::: info
   It is important to send an acknowledge message to the consumer group via `subscription.Ack()` after the event is processed successfully. Otherwise KurrentDB will assume the consumer has not received it yet and will retry.
   :::

4. Run this command in the terminal to open the OrderFulfillmentRepository class used to insert an order fulfillment record in PostgreSQL:

   ```sql
   code ./OrderProcessor/OrderFulfillmentRepository.cs
   ```

5. Locate and examine the code that processes each event:

   ```cs
   public void StartOrderFulfillment(string? orderId)
   {
      if (string.IsNullOrEmpty(orderId))
            throw new ArgumentException("Order ID cannot be null or empty",
               nameof(orderId));

      var sql = @"
            INSERT INTO OrderFulfillment (OrderId, Status)
            VALUES (@OrderId, 'Started')";
      
      try
      {
            _dataAccess.Execute(sql, new { OrderId = orderId });
            Console.WriteLine($"Order fulfillment for {orderId} started.");

      }
      catch (PostgresException ex) when (ex.SqlState == "23505")              // If the error is a unique violation (duplicate key)..
      {                                                                       // then it means the order fulfillment already exists.
            Console.WriteLine($"Order fulfillment for {orderId} " +           // Ignore the error and log a message
               "already started. Start request ignored.");
      }
   }
   ```

   This method inserts a new fulfillment record with 'Started' status into the database and handles duplicates by catching and ignoring PostgreSQL unique constraint violations.

   ::: warning Ensuring Idempotency in Persistent Subscriptions
   Functions used within persistent subscription processing loops must be idempotent to prevent data duplication.

   Persistent subscriptions in KurrentDB provide at-least-once delivery guarantees, which means:

   - Events may be delivered and processed multiple times
   - The same event might be retried after failures or connection issues
   - Your processing logic must handle duplicate events gracefully
   
   For example, the `StartOrderFulfillment()` function demonstrates proper idempotent design because:
   - It attempts to insert a record with a unique orderId constraint
   - If the same event is processed again, the database rejects the duplicate
   - The function gracefully handles this case without error or side effects
   
   This approach ensures that the same order fulfillment record is not inserted multiple times, even when the same `OrderPlaced` event is processed repeatedly.
   :::

## Step 8. Process New Events in Real-Time

In this step, you will learn how persistent subscriptions can process new events in real time. 

1. Run this command in the terminal to append 2 more new `OrderPlaced` events in KurrentDB:
   
   ```sh
   ./scripts/2-generate-data-to-test-real-time.sh
   ```

   You will receive a message, like below, printed in the terminal:

   ```
   Appended data to KurrentDB
   ```

2. Run this command in the terminal to view the application log of the order processor application in follow mode:

   ```sh
   docker compose --profile app logs -f
   ```

   Within a few seconds, you should see messages that indicate four order fulfillment processes have been started:

   ```
   orderprocessor  | OrderProcessor started
   orderprocessor  | Subscribing events from stream
   orderprocessor  | Received event #0 in $ce-order stream
   orderprocessor  | Order fulfillment for order-b0d1a15a21d24ffa97785ce7b345a87e started.
   orderprocessor  | Received event #1 in $ce-order stream
   orderprocessor  | Order fulfillment for order-f16847c9a2e44b23bdacc5c92b6dbb25 started.
   orderprocessor  | Received event #2 in $ce-order stream
   orderprocessor  | Order fulfillment for order-44c1c762ca1d440bb2e03a2655ba7edb started.
   orderprocessor  | Received event #3 in $ce-order stream
   orderprocessor  | Order fulfillment for order-c49064f930344a72bd6173db57e43f78 started.
   ```

3. Press `ctrl + c` to exit follow mode.

4. Run this command in the terminal to start PostgreSQL CLI:

   ```sh
   docker exec -it postgres psql -U postgres
   ```

5. Run this command in Postgres CLI to list the orders that have started the order fulfillment process:

   ```sql
   select orderid from OrderFulfillment;
   ``` 

   You should see four orders in the table that should match those listed in the application log.

   ::: tip Built-in Real-time Processing with Persistent Subscription
   Persistent subscriptions deliver events in real-time to subscribers after catching up with historical events.
   :::

5. Exit Postgres CLI by running the command:

   ```
   exit
   ```