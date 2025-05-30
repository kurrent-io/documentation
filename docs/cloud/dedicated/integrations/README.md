---
dir:
  link: true
  order: 7
---

# Integrations

Kurrent Cloud offers integrations between internal sources such as cluster health, issue detection, notifications events, KurrentDB logs, KurrentDB metrics and sinks which include external services such as Slack and Amazon CloudWatch.

## Integration sources

"Sources" are driven by events or other mechanism inside the Kurrent Cloud.

Currently, supported sources include:

* Issues - issues represent a potentially problematic condition detected inside a cluster or other Kurrent Cloud resource. Issues consist of multiple "open" events and a single "closed" event and have different levels of severity.

* Logs - these are the logs generated by the DB itself.

* Metrics - these are the metrics generated by both Kurrent Cloud issue detection processes running on each cluster node and KurrentDB itself.

* Notifications - notifications are noteworthy events detected within Kurrent Cloud resources or the backend. For example notifications may be emitted when a cluster fails to provision.

## Issues

Issues represent possibly problematic states detected within the Kurrent Cloud. Below, you can find several issue examples.

::: note
These examples are a subset of issues created by the system. The exact details of why issues are created are subject to change, but the cause of the issue and steps to resolve it will be clear in the messages associated with the related events.
:::

### Core load count

For each node of a cluster, the core load average is measured and divided by the number of physical cores on the node. If the result exceeds 2.0 an issue is opened. This issue is closed when the result consistently dips under 2.0.

If this happens consider increasing the size of the instance type for the cluster.

### Disk usage

For each node of a cluster, the disk usage is measured several times a minute. If it starts to consistently exceed 80% an issue is opened. The issue is closed when the usage drops below 80%.

If this happens consider either removing data, running scavenge or increasing the disk size for the cluster.

### Memory usage

For each node of a cluster, the memory usage is measured several times a minute. If it exceeds 90% an issue is opened. The issue is closed when memory usage consistently drops below 90%.

If this happens consider increasing the size of the instance type for the cluster.

### Cluster consensus

Every node on a cluster has it's gossip status queried twice each minute. An issue is opened if either the query fails or if the reported gossip state for each node is not identical on a multi-node cluster.

The issue closes when the gossip status again returns expected values.

## Notifications

Notifications represent noteworthy events which occur within the Kurrent Cloud. Below you can find notifications examples.

::: note
The following represent a subset of events which can lead to notifications.
:::

### Cluster provisioning failure

If, for some reason, the instances backing a cluster fail to provision the resource is marked as defunct by the API and a notification is sent with the message `Cluster instances failed to provision`.

### Volume expansion failure

If the volume fails to expand while expanding an instances size a notification event is created with the message `Cluster volumes failed to provision`.

## Logs and metrics - BETA

KurrentDB logs are sent in the form of JSON objects. Each object's `message` field contains the original KurrentDB log message.

Metrics are name / value pairs from the KurrentDB service, as well as system level metrics such as core load average, memory, and disk usage.

::: note Beta features
Logs and metrics are currently in beta. The data provided and/or structure of the output may change before these features are fully released for production.
:::

## Integration sinks

"Sinks" are services outside the Kurrent Cloud which events from sources can be forwarded to.

* [AwsCloudWatchLogs](cloudwatch.md#logs-sink) - **BETA** Amazon CloudWatch allows you to track metrics, display them with create custom dashboards, and create alarms from them.

* [AwsCloudWatchMetrics](cloudwatch.md#metrics-sink) - **BETA** Amazon CloudWatch allows for logs to be uploaded, viewed and searched, and consumed by other AWS services.

* [Opsgenie](opsgenie.md) - Opsgenie is an alerting and incidence response tool. It is possible to set up integrations to create Opsgenie alerts when cluster health issues are detected.

* [Slack](slack.md) - Slack is a communication platform. It is possible to set up integrations which send Slack messages when issues and notifications are created or updated.
