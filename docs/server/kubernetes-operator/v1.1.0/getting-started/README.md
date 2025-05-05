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
The Operator is an Enterprise only feature, please [contact us](https://www.kurrent.io/contact) for more information.
:::

## Why run KurrentDB on Kubernetes?

Kubernetes is the modern enterprise standard for deploying containerized applications at scale. The Operator streamlines deployment and management of KurrentDB clusters.

## Features

* Deploy single-node or multi-node clusters
* Back up and restore clusters
* Perform rolling upgrades and update configurations

### New in 1.1.0
* Deploy Read-only Replica nodes into your KurrentDB cluster. See the [example](
  ../operations/database-deployment.html#three-node-insecure-cluster-with-two-read-only-replicas), and [reference](
  resource-types.html#kurrentdbreadonlyreplicasspec)
* Configure arbitrary scheduling constraints on your KurrentDB pods. See the [example](
  ../operations/database-deployment.html#deploying-with-scheduling-constraints), and [reference](
  resource-types.html#kurrentdbconstraints)

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
