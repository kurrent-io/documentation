---
title: Part 2 - Initialize KurrentDB with Sample Orders for Sales Report
---

# Part 2: Initialize KurrentDB with Sample Orders for Sales Report

In this part, you will start a KurrentDB instance and initialize it with a few hundred order events. These orders will be used to construct sales reports in part 3.

## Step 2: Start Databases and Append OrderPlaced Event to KurrentDB

1. Once your Codespace is loaded, run this command in the terminal to start KurrentDB, and append sample events to it:

   ```sh
   ./scripts/1-start-dbs-and-generate-data.sh
   ```

   This can take a minute or so.

2. After a while, you will see the following message printed in the terminal:

   ```
   KurrentDB has started.
   Seeding data to KurrentDB... this may take a while.
   17:44:00 info: edb-commerce[0] Executing command 'seed-data-set' with settings {"InputPath":"/workspaces/edu-samples/time-travel/data/data.few-hundred-orders.json","ConnectionString":"esdb://localhost:2113?tls=false"}

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

2. Under `Recently Changed Streams`, click the `$et-order-placed` link.

   ::: tip
   You may have noticed other streams and events in KurrentDB. You can safely ignore them for the purpose of this tutorial. 
   :::

   ::: info Understanding Event Type System Projection
   The `$et-order-placed` system stream contains all `order-placed` events across all streams in KurrentDB. This uses KurrentDB's "by event type" system projection stream feature. For more information, see [System Projections](https://docs.kurrent.io/server/v25.0/features/projections/system.html#by-event-type).
   :::

3. You should see a sequenced list of the appended `order-placed` events associated to a few hundred orders.

4. Click on one of the events to see the order details.

   ::: note Sample detail of an `OrderPlaced` event

   ```json
   {
      "orderId": "order-defeb24c5f314600a92e33a26e414d49",
      "customerId": "customer-189867765",
      "checkoutOfCart": "cart-be7c5d744ba7490a9888d21a5b484095@5",
      "store": {
         "url": "https://www.amazon.pl",
         "countryCode": "POL",
         "geographicRegion": "Europe"
      },
      "lineItems": [
         {
            "productId": "8142578988976",
            "productName": "SAURA LIFE SCIENCE Adivasi Ayurvedic Neelgiri Hair growth Hair Oil-250ML (2)",
            "category": "Beauty",
            "quantity": 2,
            "pricePerUnit": "USD579.17",
            "taxRate": 0.21
         },
         {
            "productId": "3811624999109",
            "productName": "PULOTE 100PCS Pink Plastic Plates - Heavy Duty Pink Disposable Plates - Pink and Gold Plastic Plates Include 50PCS Pink Dinner Plates, 50PCS Pink Dessert Plates for Party\u0026Wedding",
            "category": "Health \u0026 Household",
            "quantity": 3,
            "pricePerUnit": "USD421.82",
            "taxRate": 0.21
         }
      ],
      "shipping": {
         "recipient": {
            "title": "Miss",
            "fullName": "Dwayne Romaguera",
            "emailAddress": "Dwayne.Romaguera28@yahoo.com",
            "phoneNumber": "(385) 893-8263"
         },
         "address": {
            "country": "IE",
            "lines": [
               "Prudence Land 1777",
               "25151-4282 Lake Kathryn",
               "Borders"
            ]
         },
         "instructions": "",
         "method": "standard"
      },
      "billing": {
         "recipient": {
            "title": "Miss",
            "fullName": "Dwayne Romaguera",
            "emailAddress": "Dwayne.Romaguera28@yahoo.com",
            "phoneNumber": "(385) 893-8263"
         },
         "address": {
            "country": "IE",
            "lines": [
               "Prudence Land 1777",
               "25151-4282 Lake Kathryn",
               "Borders"
            ]
         },
         "paymentMethod": "wireTransfer"
      },
      "at": "2025-01-01T01:41:54.0643996\u002B00:00"
   }				
   ```
   :::

   ::: info Key Fields in `OrderPlaced` Event

   | Field                   | Description                                                                                   |
   |-------------------------|-----------------------------------------------------------------------------------------------|
   | `orderId`               | Unique identifier for the order (e.g., "order-defeb24c5f314600a92e33a26e414d49")              |
   | `store`                 | Object containing store information such as URL and country code                              |
   | `store.geographicRegion`| Geographic region where the store is located (e.g., "Europe").                                |
   | `lineItems`             | Array of products in the order, each with details like ID, name, quantity, and price          |
   | `lineItems.category`    | Product category classification (e.g., "Beauty", "Health & Household")                        |
   | `shipping`              | Object containing shipping details, recipient info, address, and shipping method              |
   | `billing`               | Object containing billing information, recipient details, address, and payment method         |
   | `at`                    | Timestamp indicating when the order was placed                                                |

   :::