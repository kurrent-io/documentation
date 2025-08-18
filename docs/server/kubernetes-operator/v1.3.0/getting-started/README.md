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
* Perform rolling upgrades and update configurations

### New in 1.3.0

* Fix/improve support for resizing KurrentDB clusters, including explicitly handling data safety,
  minimizing downtime, and allowing the user to cancel a resize operation that is not progressing.
  See [Updating Replica Count](../operations/modify-deployments.md#updating-replica-count) for details.
* Support for custom labels and annotations on all child resources (StatefulSets, Pods,
  LoadBalancers, etc).
* Allow users to use public certificate authorities like LetsEcrypt without having to manually pass
  the publicly trusted cert in a secret.
* Allow manual overrides to the generated ConfigMap that is passed to KurrentDB.  Previously, if a
  user manually altered the ConfigMap it would get immediately overwritten, whereas now it will
  "stick" until the next time the KurrentDB resource is updated.
* Fix a bug affecting the KurrentDBBackup behavior when cluster's fqdnTemplate met certain criteria.
* Fix and clarified the `credentialsSecretName` behavior in the helm chart.  It is not normally
  required at all, but in previous versions, it was generating warning events with the default
  configuration.
* Update helm chart to support the normal `--skip-crds` mechanism.

## Supported KurrentDB Versions

The Operator supports running the following major versions of KurrentDB:
- v25.x
- v24.x
- v23.x

## Supported Hardware Architectures

The Operator is packaged for the following hardware architectures:
- x86_64
- arm64

## Technical Support

For support questions, please [contact us](https://www.kurrent.io/contact).

## First Steps

Ready to install? Head over to the [installation](installation.md) section.
