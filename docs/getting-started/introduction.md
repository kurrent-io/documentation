---
title: Welcome to Kurrent
---

## What is KurrentDB?

KurrentDB is an event-native database designed specifically to store, process, and deliver application state changes, known as events.

Each event captures a specific change in the state. Examples include when an order is placed, a payment is processed, or an item is shipped. By capturing all these incremental updates, KurrentDB captures temporal context and provides a complete audit trail of a business process.

KurrentDB offers the following features:

| Feature | Description                                                                                                               |
|---------|---------------------------------------------------------------------------------------------------------------------------|
| [Append-only Event Log](./concepts.md#event-log) | A durable, sequential, and immutable log that captures events in a consistent order.                                      |
| [Streams](./concepts.md#event-stream) | Groups and indexes events to organize and speed up retrieval.                                                             |
| [Subscriptions](@server/features/persistent-subscriptions.md) and [Connectors](@server/features/connectors/README.md) | Delivers events to external systems through push or pull options.                                                         |
| [Projection](@server/features/projections/README.md) | Transforms and filters events into different streams or state.                                                            |
| [Multiple Hosting Options](https://kurrent.io/downloads) | Fully managed with [Kurrent Cloud](/cloud/introduction.md), or self-managed on Linux, Windows, macOS, or with Docker. |
| [Client SDK](@clients/grpc/getting-started.md) | Available in Python, Java, .NET, Node.js, Go, and Rust.                                                                   |




