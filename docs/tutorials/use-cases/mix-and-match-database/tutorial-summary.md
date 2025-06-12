---
title: Summary
order: -1
---


This tutorial shows you how to convert KurrentDB event streams into responsive read models that stay in sync across Postgres, Redis, and a live web interface, all inside a single GitHub Codespace.

Key takeaways: 

* **Launch the workspace quickly** 
You open a pre-built Codespace that already contains KurrentDB, Postgres, Redis, and helper scripts 

* **Load sample e-commerce events**
You run ./scripts/1-init-data.sh, which starts KurrentDB in Docker and appends shopping-cart events. You then browse the $ce-cart category stream in the Admin UI to verify the data 

* **Project events to Postgres**
You start the projection app with ./scripts/2-start-projections.sh. The app subscribes from the last checkpoint, writes to the carts and cart_items tables, and stores the next checkpoint in the same transaction for exactly-once processing . You confirm the rows with psql 

* **Project events to Redis**
A second app listens to the same stream, updates hourly sorted sets, and maintains a product-names hash to power a “Top 10 products” leaderboard. It commits the changes and the updated checkpoint in a single Redis transaction . You inspect the keys with redis-cli 

* **Follow a reusable projection blueprint**
Each projection retrieves the last checkpoint, subscribes from that position, processes each event, and commits both the read-model change and the new checkpoint in one atomic action. You can apply this pattern to any target datastore .

* **Visualize data in real time**
You start a demo web page that reads from Postgres and Redis and updates instantly as events arrive 

* **Generate live traffic**
You run ./scripts/4-start-live-data-gen.sh to pump continuous cart activity into KurrentDB and watch the Admin UI, Postgres tables, Redis leaderboard, and web dashboard update together 

By following these steps, you seed KurrentDB, build projection services for Postgres and Redis, and deliver real-time insights through a web interface while keeping every component synchronized.