---
order: 1
dir:
  text: "Getting started"
  link: true
  order: 1
---

<CloudBanner />

---
Welcome to the **KurrentDB Kubernetes Operator** guide. In this guide, we’ll refer to the KurrentDB Kubernetes Operator simply as “the Operator.” Use the Operator to simplify backup, scaling, and upgrades of KurrentDB clusters on Kubernetes.

:::important
The Operator is an Enterprise-only feature, please [contact us](https://www.kurrent.io/contact) for more information.
:::

## Why run KurrentDB on Kubernetes?

Kubernetes is the modern enterprise standard for deploying containerized applications at scale. The Operator streamlines deployment and management of KurrentDB clusters.

## Features

* Deploy single-node or multi-node clusters
* Back up and restore clusters
* Automate backups with a schedule and retention policies
* Perform rolling upgrades and update configurations

### New in 1.4.0

* Support configurable traffic strategies for each of server-server and client-server traffic.  This
  enables the use of LetsEncrypt certificates without creating Ingresses, for example.  See
  [Traffic Strategies][ts] for details.
* Support backup scheduling and retention policies.  There is a new [KurrentDBBackupSchedule][bs]
  CRD with a CronJob-like syntax.  There are also two mechanisms for configuring retention policies:
  a `.keep` count on `KurrentDBBackupSchedule`, and a new `.ttl` on `KurrentDBBackup`.
* Support standalone read-only replicas pointed at a remote cluster.  This enables advanced
  topologies like a having your quorum nodes in one region and a read-only replica in a distant
  region.  See [Deploying Standalone Read-Only Replicas][ror] for an example.
* Support template strings in some extra metadata for child resources of the `KurrentDB` object.
  This allows, for example, to annotate each of the automatically created LoadBalancers with unique
  external-dns annotations.  See [KurrentDBExtraMetadataSpec][em] for details.

[ts]: ../operations/advanced-networking.md#traffic-strategy-options
[bs]: resource-types.md#kurrentdbbackupschedulespec
[ror]: ../operations/database-deployment.md#deploying-standalone-read-only-replicas
[em]: resource-types.md#kurrentdbextrametadataspec

### New in 1.4.1

* Fix rolling restarts to be quorum-aware for extra data safety.
* Add quorum-aware full restarts for changes that must be applied to all nodes at once, like adding
  TLS.
* Fix the `internodeTrafficStrategy: SplitDNS` setting to run correctly on more container runtimes.
* Fix a hang caused adding to pod labels in `extraMetadata` after a KurrentDB was deployed.
* Correctly enforce the immutability of the `sourceBackup` setting to prevent confusing behavior.
* Fix the helm chart to prevent allowing two operator instances to briefly conflict during upgrades.

### New in 1.4.2

* Fix bug where deleting KurrentDBs with LoadBalancers enabled could leave dangling cloud resources.
* Automatically grow PVC requested storage size to match the `restoreSize` of a VolumeSnapshot, when
  starting new nodes from VolumeSnapshots.  This could happen when a user had SourceBackup set or
  when adding new quorum nodes or read-only replicas to an existing cluster.
* Allow extra metadata for resources deployed by the Helm chart.  See `values.yaml` in the Helm
  chart for details.

### New in 1.4.3

* Officially support running in RedHat OpenShift clusters.
* Support deploying through the Operator Lifecycle Manager (OLM) in addition to Helm.  OLM is the
  recommended mechanism for deploying operators in OpenShift.

## Supported KurrentDB Versions

The Operator supports running the following major versions of KurrentDB:
- v25.x
- v24.x
- v23.10+

## Supported Hardware Architectures

The Operator is packaged for the following hardware architectures:
- x86\_64
- arm64

## Technical Support

For support questions, please [contact us](https://www.kurrent.io/contact).

## First Steps

Ready to install? Head over to the [installation](installation.md) section.
