---
title: Database Restore
order: 4
---

The sections below detail how a database restore can be performed. Refer to the [KurrentDB API](../getting-started/resource-types.md#kurrentdb) for detailed information.

## Restoring from a backup

A `KurrentDB` cluster can be restored from a backup by specifying an additional field `sourceBackup` as part of the cluster definition.

For example, if an existing `KurrentDBBackup` exists called `kurrentdb-cluster-backup`, the following snippet could be used to restore it:


```yaml
apiVersion: kubernetes.kurrent.io/v1
kind: KurrentDB
metadata:
  name: kurrentdb-cluster
  namespace: kurrent
spec:
  replicas: 1
  image: docker.kurrent.io/kurrent-latest/kurrentdb:25.0.0
  sourceBackup: kurrentdb-cluster-backup
  resources:
    requests:
      cpu: 1000m
      memory: 1Gi
  network:
    domain: kurrentdb-cluster.kurrent.test
    loadBalancer:
      enabled: true
```
