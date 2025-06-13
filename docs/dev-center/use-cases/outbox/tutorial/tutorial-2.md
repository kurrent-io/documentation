---
title: Part 2 - Trigger Writes to External Data Stores
---

# Part 2: Trigger Writes to External Data Stores

With KurrentDB, eventually consistent update to multiple resources often begin with an event that triggers the entire process. Subsequently, each downstream system subscribes to this event and updates its data store on its own without the need for a distributed transaction.

In this tutorial, an `OrderPlaced` event will trigger the start of an order fulfillment process in the fulfillment system. 

For the purpose of this tutorial, how this event is created is not important. For simplicity, it will be created by a data generator based on checkout-related events.

::: note How Triggering Events are Created
In general, just like any event, a triggering event can be created in many ways. For example, a `CouponUsed` event may need transactional mechanisms and patterns such as aggregate and deciders to ensure race condition from multiple actors don't violate business rules (e.g. a coupon can only be used 100 times).

On the other hand, an event like `OrderPlaced` in this tutorial may not require these practices since it is only a summary event that collects information from the relevant shopping cart and checkout events.
:::

## Step 2: Start Databases and Append OrderPlaced Event to KurrentDB

1. Once your Codespace is loaded, run this command in the terminal to start KurrentDB and PostgreSQL, and append sample events to KurrentDB:

   ```sh
   ./scripts/1-start-dbs-and-generate-data.sh
   ```

2. You will see the following message printed in the terminal:

   ```
   Appended data to KurrentDB

   🚀 KurrentDB Server has started!! 🚀

   URL to the KurrentDB Admin UI 👉: https://XXXXXXXXX.XXX
   ```

3. Copy the URL printed in the terminal from the last step.

4. Open a new browser tab. 

5. In the address bar of the new tab, paste the URL and navigate to it.

6. This will display the KurrentDB Admin UI.
   
   ![KurrentDB Admin UI Dashboard](../images/admin-ui.png =300x)

## Step 3: Browse OrderPlaced Events in KurrentDB's Admin UI

1. Click the `Stream Browser` link from the top navigation bar.

2. Under `Recently Changed Streams`, click the `$ce-order` link.

   ::: info Understanding Category System Projection
   The `$ce-order` stream contains events from all the carts in KurrentDB. This uses KurrentDB's "by category" system projection stream feature. For more information, see [System Projections](https://docs.kurrent.io/server/v25.0/features/projections/system.html#by-category).
   :::

3. You should see a sequenced list of the appended events associated with the two distinct orders.

4. Click on one of them to see the details of the order.

   ::: details Sample detail of an `OrderPlaced` event

   ```json
   {
   "orderId": "order-b0d1a15a21d24ffa97785ce7b345a87e",
   "customerId": "customer-185176238",
   "checkoutOfCart": "cart-631dd4d51e6b4f4d9f9e26e55f1cd587@9",
   "lineItems": [
      {
         "productId": "3906362089844",
         "productName": "Glamorise Women's Plus Size MagicLift Natural Shape Bra Wirefree #1210",
         "quantity": 5,
         "pricePerUnit": "USD601.05",
         "taxRate": 0.21
      },
      {
         "productId": "4579864912959",
         "productName": "Simple Designs LT3039-PRP 14.17” Contemporary Mosaic Tiled Glass Genie Standard Table Lamp with Matching Fabric Shade for Home Décor, Bedroom, Living Room, Foyer, Office, Purple",
         "quantity": 3,
         "pricePerUnit": "USD392.81",
         "taxRate": 0.06
      }
   ],
   "shipping": {
      "recipient": {
         "title": "Ms.",
         "fullName": "Beulah Schmidt",
         "emailAddress": "Beulah.Schmidt@yahoo.com",
         "phoneNumber": "1-819-847-8206 x80714"
      },
      "address": {
         "country": "IR",
         "lines": [
         "Clementine Mountain 445",
         "75096-8505 North Chadport",
         "Bedfordshire"
         ]
      },
      "instructions": "",
      "method": "express"
   },
   "billing": {
      "recipient": {
         "title": "Ms.",
         "fullName": "Beulah Schmidt",
         "emailAddress": "Beulah.Schmidt@yahoo.com",
         "phoneNumber": "1-819-847-8206 x80714"
      },
      "address": {
         "country": "IR",
         "lines": [
         "Clementine Mountain 445",
         "75096-8505 North Chadport",
         "Bedfordshire"
         ]
      },
      "paymentMethod": "wireTransfer"
   },
   "at": "2025-01-01T01:11:30.976938+00:00"
   }					
   ```
   :::

   ::: tip
   You may have noticed other streams and events in KurrentDB. You can safetly ignore them for the purpose of this tutorial. 
   :::