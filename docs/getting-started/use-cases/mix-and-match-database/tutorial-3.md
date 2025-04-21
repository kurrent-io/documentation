---
title: Section 3 - Project KurrentDB Events to Redis
---

# Section 3: Project KurrentDB Events to Redis

#### Introducing the Redis Projection Application
This application projects KurrentDB events to Redis sorted sets to calculate the top 10 products across all carts over the past 24 hours.

To do this, it subscribes to the shopping cart events. Each item added or removed event the application receives will increment/decrement the product's quantity in a Redis sorted set for the current hour.

## Step 7: Review the Projected Read Models in Redis

In this step, you will review the top 10 products that were recorded in Redis from executing the applications in a previous step:

1. Run the following command in the terminal to start Redis CLI:
   
   ```sh
   docker exec -it redis redis-cli
   ```

   You will see a message, like below, printed in the terminal:

   ```
   127.0.0.1:6379>
   ```

2. Run the following command in the Redis CLI to list all keys in Redis:

   ```
   KEYS *
   ``` 

   You will see a list that is similar to this:

   ```
   1) "checkpoint"
   2) "product-names"
   3) "top-10-products:2025041508"
   ```

3. Run the following command in the Redis CLI to list the most popular products added to a cart. Replace top-10-product:YYYYMMDDHH with the actual top-10-products key listed in the previous step.

   ```
   ZREVRANGE ***REPLACES THIS WITH top-10-products:YYYYMMDDHH KEY FOUND ABOVE*** 0 9 WITHSCORES
   ```

   You will see a list that is similar to this:

   ```   
   1) "5449310139799"
   2) "9"
   3) "4291118428480"
   4) "6"
   5) "0563658703704"
   6) "4"
   7) "2256276792349"
   8) "1"
   ```

   The 13-digit number is the product ID, followed by its quantity across all shopping carts. In this case, `5449310139799` is the most popular product with 9 of them across all carts.

   ::: info Quick Quiz
   Given that the quantity for a product above is the total added minus the total removed from a cart, pick one of the products above and confirm it matches what the events in step 3 from the previous section indicate.
   :::

4. Exit the Redis CLI by running the command:

   ```
   exit
   ```

## Step 8. Examine the Redis Projection Application Codebase

Similar to step 6, projecting KurrentDB events to read models in another database like Redis can also follow the same pattern:
1. Retrieve the last checkpoint
2. Subscribe to events in a stream from the checkpoint
3. Process each event by updating the read model and checkpoint in the database

You will examine how this pattern is applied to the Redis projection application.

1. Run the following command in the terminal to open the main program for the Postgres projection application:

   ```sql
   code ./RedisProjection/Program.cs
   ```

   Most of the code snippets included in this step can be found in this file.

2. Locate and examine the code that retrieves the last checkpoint:

   ```cs
   var checkpointValue = redis.StringGet("checkpoint");                     // Get the checkpoint value from redis
   var streamPosition = long.TryParse(checkpointValue, out var checkpoint)  // Check if it exists and convertible to long
      ? FromStream.After(StreamPosition.FromInt64(checkpoint))             // If so, set var to subscribe events from stream after checkpoint
      : FromStream.Start;                                                  // Otherwise, set var to subscribe to events from the stream from the start.
   ```

   The `redis.StringGet()` statement can retrieve the checkpoint. If no checkpoint is found or it is the first time the application is executed, we can retrieve the default start position.

3. Locate and examine the code that subscribes to stream:

   ```cs
   await using var subscription = esdb.SubscribeToStream(                   // Subscribe events..
      "$ce-cart",                                                          // from the cart category system projection..        
      streamPosition,                                                      // from this position..
      true);                                                               // with linked events automatically resolved (required for system projections)
   ```

   A catch-up subscription is created that subscribes to events from the `$ce-carts` stream. The subscription will only retrieve events starting from `streamPosition` in the stream (i.e., the checkpoint retrieved from the previous step).

4. Locate and examine the code that processes each event:

   ```cs
   await foreach (var message in subscription.Messages)                     // Iterate through the messages in the subscription
   {                                                                       
      if (message is not StreamMessage.Event(var e)) continue;             // Skip if message is not an event

      var txn = redis.CreateTransaction();                                 // Create a transaction for Redis

      if (!CartProjection.TryProject(txn, e)) continue;                    // Project the event into Redis

      txn.StringSetAsync("checkpoint", e.OriginalEventNumber.ToInt64());   // Set the checkpoint to the current event number
      
      txn.Execute();                                                       // Execute the transaction
   }
   ```

   For each event, the projection will:
   - Start a Redis transaction,
   - Save the appropriate key-value pairs in the database,
   - Update the `checkpoint` key in the database,
   - Commit the Redis transaction


   The `CartProjection.TryProject()` function above will try to project the event into the appropriate key-value pair in Redis. 

5. Run the following command in the terminal to open the code that performs the Redis projection:

   ```sql
   code ./RedisProjection/CartProjection.cs
   ```

6. Locate and examine the code that handles the projection for the `ItemGotAdded` event:

   ```cs
   public static void Project(ITransaction txn, ItemGotAdded addedEvent)
   {
      var hourKey = $"top-10-products:{addedEvent.at:yyyyMMddHH}";            // Create a key for the current hour
      var productKey = addedEvent.productId;                                  // Use the product ID as the member in the sorted set
      var productName = addedEvent.productName;                               // Assuming `productName` is part of the event

      txn.SortedSetIncrementAsync(hourKey, productKey, addedEvent.quantity);  // Increment the quantity of the product in the sorted set
      txn.HashSetAsync("product-names", productKey, productName);             // Store product name in a hash;

      Console.WriteLine($"Incremented product {addedEvent.productId} in " +
                        $"{hourKey} by {addedEvent.quantity}");
   }
   ```

   If the event is `ItemGotAdded`, then a Redis sort set is incremented with the product key for that particular hour.

   A hash set is also used to map product IDs to product names (this is used later in the Demo Web Page to construct a table of the top 10 products).


7. Locate and examine the code that handles the projection for the `ItemGotRemoved` event:

   ```cs
   public static void Project(ITransaction txn, ItemGotRemoved removedEvent)
   {
      var hourKey = $"top-10-products:{removedEvent.at:yyyyMMddHH}";          // Create a key for the current hour
      var productKey = removedEvent.productId;                                // Use the product ID as the member in the sorted set

      txn.SortedSetDecrementAsync(hourKey, productKey,                        // Decrement the quantity of the product in the sorted set
         removedEvent.quantity); 

      Console.WriteLine($"Decremented product {removedEvent.productId} in " +
                        $"{hourKey} by {removedEvent.quantity}");
   }
   ```

   If the event is `ItemGotRemoved`, then a Redis sort set is decremented with the product key for that particular hour.