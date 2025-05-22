---
title: Introduction
next: ./tutorial-intro.md
---

# Introduction

# Time Traveling with KurrentDB: A Modern Approach to Historical Data

## What is Time Traveling?
Time traveling in data systems means being able to query or reconstruct your data as it existed at any point in the past. This is useful for many scenarios, such as auditing, debugging, compliance, and analytics.

| Technical Use Case                   | Example |
|--------------------------------------|---------|
| Business process reconstruction | See the full lifecycle of a loan application, including every approval, rejection, and amendment, to resolve disputes or meet regulations |
| Point-in-time state diffing | Show exactly what changed in a customer’s profile or account settings between two points in time for support or compliance reviews |
| Simulation and what-if analysis | Simulate the impact of a pricing change or business rule adjustment by replaying all related product and sales events to see how outcomes would differ |
| Business event tracing | Audit the sequence of business events for a transaction (order placed, payment received, shipment sent, delivery confirmed) to verify SLAs or investigate complaints |
| Timeline-Based State Inspection | Let users view a timeline of how their account or order changed, with each step tied to a business event (like address updated, item added, return requested) |
| Temporal aggregate calculation | Track how total sales for a product changed over time by calculating monthly sales at the end of each month |

::: info Beyond Querying: Changing and Correcting History
Time travel isn’t just about querying the past—it can also help you change it when needed. With undo/redo, rollback, and the ability to issue compensating or corrective events, you can fix mistakes or recover lost data. For example, you might replay events to rebuild a lost read model or restore system state after an incident.

This article and the accompanying tutorial focuses on querying and reconstructing historical state, but time travel features can also support making changes to history when required.
:::

## Time Traveling with Traditional Approaches
Traditional databases struggle with historical queries because they are designed to store only the current state. Retrieving or reconstructing previous versions often requires extra mechanisms like audit logs, snapshots, or CDC with time-partitioned data lakes. These approaches add complexity, slow down queries, and may not always provide a complete or reliable view of historical data.

### Audit Logs
Audit logs are a common approach in traditional databases for tracking changes. They record each modification as a new entry in a separate log table, typically including details such as who made the change, when it occurred, and what operation was performed.

**Advantages:**  
- Provide a chronological record of changes for auditing and compliance.
- Can answer questions about who changed what and when.
- Useful for meeting regulatory requirements for tracking changes.

**Limitations:**  
- Audit logs are usually separate from main data, risking inconsistencies if not managed atomically.
- Often capture only high-level operations, making full state reconstruction difficult.
- Schema changes or multi-table updates complicate interpretation.
- Gaps or missed events undermine trust in the historical record.

### Snapshots
Snapshots are another traditional method for preserving historical data. A snapshot captures the entire state of a table or dataset at a specific point in time, often on a scheduled basis (e.g., nightly or weekly), and stores it as a separate copy.

**Advantages:**  
- Provide a complete view of data as it existed at the time of the snapshot.
- Useful for restoring data after accidental changes or corruption.
- Can simplify point-in-time recovery for disaster recovery scenarios.
- Easy to implement without major changes to existing applications.

**Limitations:**  
- Snapshots are typically taken infrequently, so changes between snapshots are not captured in detail.
- Storage requirements can be high, especially for large datasets or frequent snapshots.
- Snapshots may not capture related changes across multiple tables in a consistent way.
- Snapshots do not provide a detailed audit trail of individual changes.

### Change Data Capture (CDC) and Data Lake
Change Data Capture (CDC) is a technique that tracks and records changes (inserts, updates, deletes) in source databases and delivers them to downstream systems, often storing them in time-partitioned data lakes for analytics and historical queries.

**Advantages:**  
- Captures detailed change events, enabling near real-time replication and analytics.
- Supports integration with data warehouses and lakes for large-scale historical analysis.
- Can be used to build audit trails and reconstruct state changes over time.
- Scales well for high-volume transactional systems.

**Limitations:**  
- CDC pipelines add operational complexity, require many moving parts, and can be costly.
- Often do not persist the actual change from the source, so lost events mean state can't be reliably reconstructed.
- Captured CDC changes are usually low-level and technical, making business intent unclear.
- Can distort the original intent of changes, reducing historical accuracy.
- Replaying large CDC logs to reconstruct state is slow and costly, since streams are not indexed for fast retrieval.

## Time Traveling with KurrentDB

KurrentDB makes time travel simple by recording every change as an immutable, ordered event. This lets you accurately reconstruct any previous state, making historical queries, audits, and analysis straightforward without complex workarounds.

How does KurrentDB make this possible?

- Stores every change as an immutable event, preserving a complete and accurate history.
- Allows event streams to be replayed at any time for simulation, testing, and debugging—even far into the future.
- The historical event log is naturally suited for regulatory and compliance needs, making audits and reporting straightforward.
- Outbox pattern is built-in, ensuring reliable delivery of historical events to downstream systems.
- Events are modeled around business intent, providing clear context for historical queries.
- Events are small and focused, making them efficient to store and process.
- KurrentDB handles storage, indexing, and pushing events natively, reducing the need for extra components in your time travel solution.

## How to Time Travel with KurrentDB

Time travel in KurrentDB is achieved by leveraging its event-sourced architecture. Every change to your data is recorded as an immutable event in an ordered stream, allowing you to reconstruct the state of any business object at any point in time.

To perform time travel:

- **Store events in ordered streams:** Each entity or aggregate has its own event stream. All changes are appended in order, preserving the full history.
- **Reconstruct state on-demand:** To view the state at a specific time, replay the event stream up to the desired timestamp or version. This enables you to audit, debug, or analyze historical states as needed.
- **Compare points in time:** By replaying events up to two different points, you can easily see what changed between them.
- **Use pre-computed read models for efficiency:** For objects with long histories or frequent queries, you can periodically store snapshots of state. This reduces the number of events that need to be replayed for common queries.
- **Combine approaches:** Use on-demand event replay for ad-hoc queries and pre-computed read models for fast access to frequently needed historical states.

KurrentDB’s approach makes time travel queries reliable, flexible, and efficient, supporting both detailed investigations and high-performance analytics.
