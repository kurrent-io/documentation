---
order: 1
---

# Getting started

Get started by connecting your application to KurrentDB. 

## Connecting to KurrentDB

For your application to start communicating with KurrentDB, you need to instantiate the client and configure it accordingly. Below are instructions for supported SDKs.

::: tip Insecure clusters
All our GRPC clients are secure by default and must be configured to connect to an insecure server via [a connection string](#connection-string) or the client's configuration.
:::

### Required packages

Install the client SDK package to your project.

#### Python

Install the `kurrentdbclient` package from PyPI or use Poetry:

::: tabs
@tab pip
```bash
pip install kurrentdbclient
```
@tab Poetry
```bash
poetry add kurrentdbclient
```
:::

#### NodeJS

Install the `@kurrent/kurrentdb-client` package using NPM, Yarn or PNPM:

::: tabs
@tab npm
```bash
npm install --save @kurrent/kurrentdb-client
```
@tab yarn
```bash
yarn add @kurrent/kurrentdb-client
```
@tab pnpm
```bash
pnpm add @kurrent/kurrentdb-client
```
:::

TypeScript Declarations are included in the package.

#### Java

Add the `kurrentdb-client` dependency to your Maven or Gradle project. 

::: tabs
@tab Maven
```xml
<dependency>
  <groupId>io.kurrent</groupId>
  <artifactId>kurrentdb-client</artifactId>
  <version>1.0.0</version>
</dependency>
```

@tab Gradle
```groovy
implementation 'io.kurrent:kurrentdb-client:1.0.0'
```

For the most recent version of the KurrentDB client package, see [Maven Central](https://mvnrepository.com/artifact/io.kurrent/kurrentdb-client).
:::

#### .NET

Add the `KurrentDB.Client` package to your project:

```bash
dotnet add package KurrentDB.Client
```

#### Go

Install the `kurrentdb` package using Go modules:

```bash
go get github.com/kurrent-io/KurrentDB-Client-Go/kurrentdb
```

#### Rust

No additional configuration is needed having Rust installed. Go check [https://rustup.rs](https://rustup.rs).

### Connection string

Each SDK has its own way of configuring the client, but the connection string can always be used. 
The KurrentDB connection string supports two schemas: `kurrentdb://` for connecting to a single-node server, and `kurrentdb+discover://` for connecting to a multi-node cluster. The difference between the two schemas is that when using `kurrentdb://`, the client will connect directly to the node; with `kurrentdb+discover://` schema the client will use the gossip protocol to retrieve the cluster information and choose the right node to connect to.
Since version 22.10, ESDB supports gossip on single-node deployments, so `kurrentdb+discover://` schema can be used for connecting to any topology.

The connection string has the following format:

```
kurrentdb+discover://admin:changeit@cluster.dns.name:2113
```

There, `cluster.dns.name` is the name of a DNS `A` record that points to all the cluster nodes. Alternatively, you can list cluster nodes separated by comma instead of the cluster DNS name:

```
kurrentdb+discover://admin:changeit@node1.dns.name:2113,node2.dns.name:2113,node3.dns.name:2113
```

There are a number of query parameters that can be used in the connection string to instruct the cluster how and where the connection should be established. All query parameters are optional.

| Parameter             | Accepted values                                   | Default  | Description                                                                                                                                    |
|-----------------------|---------------------------------------------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------|
| `tls`                 | `true`, `false`                                   | `true`   | Use secure connection, set to `false` when connecting to a non-secure server or cluster.                                                       |
| `connectionName`      | Any string                                        | None     | Connection name                                                                                                                                |
| `maxDiscoverAttempts` | Number                                            | `10`     | Number of attempts to discover the cluster.                                                                                                    |
| `discoveryInterval`   | Number                                            | `100`    | Cluster discovery polling interval in milliseconds.                                                                                            |
| `gossipTimeout`       | Number                                            | `5`      | Gossip timeout in seconds, when the gossip call times out, it will be retried.                                                                 |
| `nodePreference`      | `leader`, `follower`, `random`, `readOnlyReplica` | `leader` | Preferred node role. When creating a client for write operations, always use `leader`.                                                         |
| `tlsVerifyCert`       | `true`, `false`                                   | `true`   | In secure mode, set to `true` when using an untrusted connection to the node if you don't have the CA file available. Don't use in production. |
| `tlsCaFile`           | String, file path                                 | None     | Path to the CA file when connecting to a secure cluster with a certificate that's not signed by a trusted CA.                                  |
| `defaultDeadline`     | Number                                            | None     | Default timeout for client operations, in milliseconds. Most clients allow overriding the deadline per operation.                              |
| `keepAliveInterval`   | Number                                            | `10`     | Interval between keep-alive ping calls, in seconds.                                                                                            |
| `keepAliveTimeout`    | Number                                            | `10`     | Keep-alive ping call timeout, in seconds.                                                                                                      |
| `userCertFile`        | String, file path                                 | None     | User certificate file for X.509 authentication.                                                                                                |
| `userKeyFile`         | String, file path                                 | None     | Key file for the user certificate used for X.509 authentication.                                                                               |

When connecting to an insecure instance, specify `tls=false` parameter. For example, for a node running locally use `kurrentdb://localhost:2113?tls=false`. Note that usernames and passwords aren't provided there because insecure deployments don't support authentication and authorisation.

### Creating a client

First, create a client and get it connected to the database.

@[code{createClient}](@grpc:quickstart.py;get-started.js;get-started.ts;quick_start/QuickStart.java;quick-start/Program.cs;quickstart.go;quickstart.rs)

The client instance can be used as a singleton across the whole application. It doesn't need to open or close the connection.

### Creating an event

You can write anything to KurrentDB as events. The client needs a byte array as the event payload. Normally, you'd use a serialized object, and it's up to you to choose the serialization method.

::: tip Server-side projections
User-defined server-side projections require events to be serialized in JSON format.

We use JSON for serialization in the documentation examples.
:::

The code snippet below creates an event object instance, serializes it, and adds it as a payload to the `EventData` structure, which the client can then write to the database.

@[code{createEvent}](@grpc:quickstart.py;get-started.js;get-started.ts;quick_start/QuickStart.java;quick-start/Program.cs;quickstart.go;quickstart.rs)

### Appending events

Each event in the database has its own unique identifier (UUID). The database uses it to ensure idempotent writes, but it only works if you specify the stream revision when appending events to the stream.

In the snippet below, we append the event to the stream `some-stream`.

@[code{appendEvents}](@grpc:quickstart.py;get-started.js;get-started.ts;quick_start/QuickStart.java;quick-start/Program.cs;quickstart.go;quickstart.rs)

Here we are appending events without checking if the stream exists or if the stream version matches the expected event version. See more advanced scenarios in [appending events documentation](./appending-events.md).

### Reading events

Finally, we can read events back from the `some-stream` stream.

@[code{readStream}](@grpc:quickstart.py;get-started.js;get-started.ts;quick_start/QuickStart.java;quick-start/Program.cs;quickstart.go;quickstart.rs)

When you read events from the stream, you get a collection of `ResolvedEvent` structures. The event payload is returned as a byte array and needs to be deserialized. See more advanced scenarios in [reading events documentation](./reading-events.md).

