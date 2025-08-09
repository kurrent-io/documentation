---
title: The Kurrent Ecosystem
---

The Kurrent ecosystem is made up of the core database (which can run standalone or in the cloud), client SDKs and APIs, connectors, and management user interfaces:

### KurrentDB

At the heart of Kurrent’s platform is KurrentDB, the core database engine (formerly EventStoreDB). KurrentDB is an immutable, append-only event store designed for event-sourced architectures. Data is organized into streams – essentially sequences of events – and the engine supports billions of independent streams while maintaining consistent ordering of events within each stream. Every write appends a new event to a stream (no in-place updates), preserving a durable history of changes. An integrated indexing mechanism allows fast retrieval of events by stream or globally, and the database can handle real-time event ingestion at scale without compromising on write/read performance.

### Kurrent Cloud

Kurrent Cloud is the fully managed cloud offering of the Kurrent platform, aimed at eliminating the operational overhead of running KurrentDB clusters. It allows one-click (or API-driven) deployment of managed KurrentDB clusters on all major cloud providers – Amazon Web Services, Microsoft Azure, and Google Cloud Platform. With Kurrent Cloud, developers can spin up a KurrentDB cluster in minutes through a web console, without having to manually provision VMs or containers.

### Kurrent Clients and APIs

Kurrent offers a range of client SDKs for multiple languages and environments, including .NET (C#), Java (and other JVM languages), JavaScript/TypeScript (Node.js), Python, Rust, and Go. 

KurrentDB also exposes a straightforward HTTP API. This allows any application that can speak HTTP to read and write events or perform administrative operations over REST, enabling integration from scripts or systems where a custom SDK might not be available. 

### Connectors

Connectors make it easy to integrate data from KurrentDB into other systems. Each connector runs on the server-side and uses a catch-up subscription to receive events, filter or transform them, and push them to an external system.

### Projections

Projections in KurrentDB let you continuously query event streams to detect patterns over time—ideal for scenarios like tracking sequences of medical events or analyzing user behavior in real time.

### Management Interfaces

Kurrent provides both command line and graphical user interfaces for managing your KurrentDB installation. 