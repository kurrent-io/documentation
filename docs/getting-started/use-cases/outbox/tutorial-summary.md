---
title: Summary
---

In this tutorial, you’ve explored how KurrentDB offers a powerful, event-driven approach to address the dual write problem — a core challenge in distributed systems where writes to multiple data stores risk inconsistency due to the lack of atomicity. Through practical exercises, you learned how to reliably propagate changes from KurrentDB to external systems like PostgreSQL without needing distributed transactions.

Here are the key takeaways:

* **Understand the Dual Write Problem**
  Traditional systems risk inconsistencies when writing to multiple data stores (e.g., a database and a message queue) because partial failures can leave data out of sync.

* **Leverage KurrentDB’s Native Event Model**
  KurrentDB simplifies this pattern by treating event streams as a hybrid between a database and a message queue:

  * Atomic and durable like a database
  * Subscribable and reactive like a queue

* **Implement Persistent Subscriptions**
  You set up a consumer group to process `OrderPlaced` events and write to PostgreSQL, achieving eventual consistency with real-time responsiveness.

* **Ensure Idempotent Event Handling**
  Your handler gracefully handles duplicates and out-of-order messages, using unique constraints and error catching to ensure safe, repeatable operations.

* **Recover from Application Outages with Checkpoints**
Persistent subscriptions track the last successfully processed event using server-side checkpoints. On restart, the application resumes from the checkpoint, avoiding unnecessary reprocessing and data duplication.

* **Retry Transient Errors Automatically**
Temporary issues like database downtime or network glitches are automatically retried. By identifying transient exceptions and sending a Nack with a retry flag, your application remains fault-tolerant without human intervention.

* **Gracefully Skip Permanent Errors**
For unrecoverable issues (e.g., corrupted or malformed events), you used the Nack method with a skip action. This prevents one bad event from blocking the entire stream, allowing processing to continue smoothly.

By using KurrentDB as your **"outbox out of the box"**, you’ve implemented a clean, scalable, and fault-tolerant system that avoids the traditional pitfalls of dual writes.