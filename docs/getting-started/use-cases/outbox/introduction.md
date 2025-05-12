---
title: Introduction
next: ./tutorial-intro.md
---

## Outbox Out-of-the-Box

### Dual Write Problem
Without distributed transactions, operations that write to multiple resources are not atomic, potentially leading to inconsistencies in the system. This issue is commonly known as the dual write problem.

Although named "Dual Write," this pattern can involve writing to more than two resources. A common use case is updating a relational database and simultaneously sending a notification message via a message queue to another system. 

![Dual Write Problem](./images/dual-write-problem.png#light)

![Dual Write Problem](./images/dual-write-problem-dark.png#dark)

Failure to write to one resource introduces inconsistency with the other. For instance, if the database update succeeds but message delivery fails, downstream systems remain uninformed.

![Out of sync when database updated but messaging failed](./images/dual-write-problem-failed-messaging.png#light)

![Out of sync when database updated but messaging failed](./images/dual-write-problem-failed-messaging-dark.png#dark)

Conversely, a failed database update paired with a successful message dispatch leads to downstream systems acting on non-existent data.

### Transactional Outbox Pattern
The transactional outbox pattern ensures consistency by writing business data and outgoing messages atomically within the same database transaction. A separate process later dispatches these messages to downstream systems, mitigating the dual write problem.

The outbox pattern promotes reducing the number of resources we write to, preferably to just one, and technically, to one transaction. This 
implies that the effect on the other resources gets deferred.

Practically, the outbox acts as a persistent queue holding messages until they're dispatched asynchronously. This trades immediate consistency for eventual consistency, reducing complexity and the risk associated with simultaneous writes.
There are several common implementation approaches to this pattern.

#### Using a Relational Outbox Table

![Outbox with relational table](./images/outbox-with-database-table.png#light)

![Outbox with relational table](./images/outbox-with-database-table-dark.png#dark)

In a relational database, the outbox could manifest itself as one or more tables that keep track of how the other resources need to be affected. In the canonical example, the outbox would be a table containing messages to be sent to the other system. 

The salient point is to atomically commit regular database changes and outbox messages as part of a single transaction. A separate process (outbox relay) can now pick up the messages from the outbox and send them out. Once a message has been sent, it can be marked as sent or removed from the outbox, whichever option is preferred.

While straightforward and intuitive, this approach introduces latency because messages are delivered via periodic polling rather than immediate notification. Additionally, the outbox pattern inherently depends on the database’s scalability, meaning throughput and performance are constrained by database capacity and resource contention.

#### Using Change Data Capture (CDC)

![Outbox with change data capture](./images/outbox-with-cdc.png#light)

![Outbox with change data capture](./images/outbox-with-cdc-dark.png#dark)

Instead of directly managing an outbox table, another implementation of the outbox pattern involves generating a CDC feed from the affected data table and transforming these changes into messages for external systems. Streaming platforms commonly favor this method.

This approach avoids polling overhead and propagates updates with significantly lower latency. However, it relies on additional CDC tooling, increasing complexity if such tools aren't already part of the existing infrastructure. It also risks exposing the internal data model of the source tables, potentially creating undesirable coupling with other systems.

### Outbox Out-of-the-Box with KurrentDB

![Outbox with KurrentDB](./images/outbox-with-kurrentdb.png#light)

![Outbox with KurrentDB](./images/outbox-with-kurrentdb-dark.png#dark)

When working with streams and events, an important shift tends to happen. That is, the events written to a stream turn out to be triggers for the messages we want to send to the other system with minimal translation. 

This occurs because when KurrentDB is used as an event store for event sourcing, an event stream behaves like a hybrid between a database table and a message queue.

Like a database table, the stream provides atomic, durable, and immediately consistent operations. And like a message queue, it offers subscription mechanisms to propagate updates to multiple systems in an eventually consistent way.
In effect, the stream is the outbox, out of the box.

The native subscription capabilities, such as persistent and catch-up subscriptions and connectors, act as cheap mechanisms for writing the glue code that sends messages to the other system.

### How to Approach the Dual Write Problem with KurrentDB
1. Record each business change as an event and append it to a stream in KurrentDB, using the stream as the definitive source of truth.
2. Do not update other systems or read models directly as part of the same append operation.
3. Set up subscriptions to listen for new events in the stream.
4. Process these events asynchronously by triggering actions on external systems.
