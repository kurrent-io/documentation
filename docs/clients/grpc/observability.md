---
order: 8
---

# Observability

The KurrentDB gRPC clients are designed with observability in mind, offering
support for OpenTelemetry. This integration provides a set of distributed
traces, enabling developers to gain deeper insights into their system.

::: warning
Currently, OpenTelemetry observability support is not available for all
clients. Moreover, instrumentation is only provided for append and
subscribe operations, which includes both 'Catchup' and 'Persistent' modes.
:::

You can click on the links below to view the full code for each client:

- [NodeJS](https://github.com/kurrent-io/KurrentDB-Client-NodeJS/blob/master/packages/test/src/samples/opentelemetry.ts)
- [Java](https://github.com/kurrent-io/KurrentDBDB-Client-Java/blob/trunk/src/test/java/io/kurrent/dbclient/samples/opentelemetry/Instrumentation.java)
- [C#](https://github.com/kurrent-io/KurrentDB-Client-Dotnet/blob/master/samples/diagnostics/Program.cs)

## Required packages

OpenTelemetry support is included to the KurrentDB Java client by default. For other clients, you need to install the dedicated package to enable OpenTelemetry support. 

### NodeJS

Install the `@kurrent/opentelemetry` package using your package manager of choice. TypeScript type declarations are included in the package.

::: tabs
@tab npm
```bash
npm install --save @kurrent/opentelemetry
```
@tab yarn
```bash
yarn add @kurrent/opentelemetry
```
@tab pnpm
```bash
pnpm add @kurrent/opentelemetry
```
:::

## Instrumentation

To emit trace data, you must first install and use the dedicated package, as instructed in the
[Required Packages](./observability.md#required-packages) section, if provided. This package
includes the necessary instrumentation that needs to be registered with the client.

@[code{register-instrumentation}](@grpc:opentelemetry.js;opentelemetry.ts;opentelemetry/Instrumentation.java;diagnostics/Program.cs)

## Traces

Traces provide a clear picture of how operations are carried out in a
distributed system, making it easier to maintain and enhance the system over
time. Traces from the clients can be exported to any compatible collector that
supports the OpenTelemetry protocol (OTLP).

In order for the client to emit traces, you need to need to enable
instrumentation as described in
[Instrumentation](./observability.md#instrumentation).

For more guidance on setting up and utilizing tracing, refer to the
[OpenTelemetry](https://opentelemetry.io/) documentation.

An example of a trace is shown below:

```bash
Activity.TraceId:            8da04787239dbb85c1f9c6fba1b1f0d6
Activity.SpanId:             4352ec4a66a20b95
Activity.TraceFlags:         Recorded
Activity.ActivitySourceName: kurrentdb
Activity.DisplayName:        streams.append
Activity.Kind:               Client
Activity.StartTime:          2024-05-29T06:50:41.2519016Z
Activity.Duration:           00:00:00.1500707
Activity.Tags:
    db.kurrentdb.stream: d7caa2a5-1e19-4108-9541-58d5fba02d42
    server.address: localhost
    server.port: 2113
    db.system: kurrentdb
    db.operation: streams.append
StatusCode: Ok
Resource associated with Activity:
    service.name: sample
    service.instance.id: 7316ef20-c354-4e64-97da-c1b99c2c28b0
    telemetry.sdk.name: opentelemetry
    telemetry.sdk.language: dotnet
    telemetry.sdk.version: 1.8.1
```

In this case, the trace is for an append operation on a stream. The trace
includes the trace ID, span ID, trace flags, activity source name, display name,
kind, start time, duration, tags, status code, and resource associated with the
activity.

::: note
The structure of the trace may vary depending on the client and the operation
being performed but will generally include the same information.
:::

## Exporting traces

You can set up various exporters to send traces to different destinations.
Additionally, you have the option to export these traces to a collector of your
choice, such as [Jaeger](https://www.jaegertracing.io/) or [Seq](https://datalust.co/seq).

For instance, if you choose to use Jaeger as your backend of choice, you can
view your traces in the Jaeger UI, which provides a powerful interface for
querying and visualizing your trace data.

The code snippets below demonstrate how to set up one or more exporters for each
client:

@[code{setup-exporter}](@grpc:opentelemetry.js;opentelemetry.ts;opentelemetry/Instrumentation.java;diagnostics/Program.cs)

For more details on configuring exporters for specific programming languages,
refer to the [OpenTelemetry](https://opentelemetry.io/docs/languages/)
documentation.
