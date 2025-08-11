---
title: Supported Resource Types
order: 3
---

The Operator supports the following resource types (known as `Kind`'s):
- `KurrentDB`
- `KurrentDBBackup`

## KurrentDB

This resource type is used to define a database deployment.

### API

| Field                                                                                                                                       | Required | Description                                                                                                                              |
|---------------------------------------------------------------------------------------------------------------------------------------------|----------|------------------------------------------------------------------------------------------------------------------------------------------|
| `replicas` _integer_                                                                                                                        | Yes      | Number of nodes in a database cluster (1 or 3)                                                                                           |
| `image` _string_                                                                                                                            | Yes      | KurrentDB container image URL                                                                                                            |
| `resources` _[ResourceRequirements](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.26/#resourcerequirements-v1-core)_     | No       | Database container resource limits and requests                                                                                          |
| `storage` _[PersistentVolumeClaim](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.26/#persistentvolumeclaimspec-v1-core)_ | Yes      | Persistent volume claim settings for the underlying data volume                                                                          |
| `network` _[KurrentDBNetwork](#kurrentdbnetwork)_                                                                                           | Yes      | Defines the network configuration to use with the database                                                                               |
| `configuration` _yaml_                                                                                                                      | No       | Additional configuration to use with the database, see [below](#configuring-kurrent-db)                                                  |
| `sourceBackup` _string_                                                                                                                     | No       | Backup name to restore a cluster from                                                                                                    |
| `security` _[KurrentDBSecurity](#kurrentdbsecurity)_                                                                                        | No       | Security configuration to use for the database. This is optional, if not specified the cluster will be created without security enabled. |
| `licenseSecret` _[SecretKeySelector](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.26/#secretkeyselector-v1-core)_       | No       | A secret that contains the Enterprise license for the database                                                                           |
| `constraints` _[KurrentDBConstraints](#kurrentdbconstraints)_                                                                               | No       | Scheduling constraints for the Kurrent DB pod.                                                                                           |
| `readOnlyReplias` _[KurrentDBReadOnlyReplicasSpec](#kurrentdbreadonlyreplicasspec)_                                                         | No       | Read-only replica configuration the Kurrent DB Cluster.                                                                                  |
| `extraMetadata` _[KurrentDBExtraMetadataSpec](#kurrentdbextrametadataspec)_                                                                 | No       | Additional annotations and labels for child resources.                                                                                   |

#### KurrentDBReadOnlyReplicasSpec

Other than `replicas`, each of the fields in `KurrentDBReadOnlyReplicasSpec` default to the corresponding values from the main KurrentDBSpec.

| Field                                                                                                                                       | Required | Description                                                      |
|---------------------------------------------------------------------------------------------------------------------------------------------|----------|------------------------------------------------------------------|
| `replicas` _integer_                                                                                                                        | No       | Number of read-only replicas in the cluster.  Defaults to zero.  |
| `resources` _[ResourceRequirements](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.26/#resourcerequirements-v1-core)_     | No       | Database container resource limits and requests.                 |
| `storage` _[PersistentVolumeClaim](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.26/#persistentvolumeclaimspec-v1-core)_ | No       | Persistent volume claim settings for the underlying data volume. |
| `configuration` _yaml_                                                                                                                      | No       | Additional configuration to use with the database.               |
| `constraints` _[KurrentDBConstraints](#kurrentdbconstraints)_                                                                               | No       | Scheduling constraints for the Kurrent DB pod.                   |

#### KurrentDBConstraints

| Field                                                                                                                                                                   | Required | Description                                                                               |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|-------------------------------------------------------------------------------------------|
| `nodeSelector` _yaml_                                                                                                                                                   | No       | Identifies nodes that the Kurrent DB may consider during scheduling.                      |
| `affinity` _[Affinity](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.26/#affinity-v1-core)_                                                          | No       | The node affinity, pod affinity, and pod anti-affinity for scheduling the Kurrent DB pod. |
| `tolerations` _list of [Toleration](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.26/#toleration-v1-core)_                                           | No       | The tolerations for scheduling the Kurrent DB pod.                                        |
| `topologySpreadConstraints` _list of [TopologySpreadConstraint](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.26/#topologyspreadconstraint-v1-core)_ | No       | The topology spread constraints for scheduling the Kurrent DB pod.                        |

#### KurrentDBExtraMetadataSpec

| Field                                                            | Required | Description                                                         |
|------------------------------------------------------------------|----------|---------------------------------------------------------------------|
| All _[ExtraMetadataSpec](#extrametadataspec)_                    | No       | Extra annotations and labels for all child resource types.          |
| ConfigMaps _[ExtraMetadataSpec](#extrametadataspec)_             | No       | Extra annotations and labels for ConfigMaps.                        |
| StatefulSets _[ExtraMetadataSpec](#extrametadataspec)_           | No       | Extra annotations and labels for StatefulSets.                      |
| Pods _[ExtraMetadataSpec](#extrametadataspec)_                   | No       | Extra annotations and labels for Pods.                              |
| PersistentVolumeClaims _[ExtraMetadataSpec](#extrametadataspec)_ | No       | Extra annotations and labels for PersistentVolumeClaims.            |
| HeadlessServices _[ExtraMetadataSpec](#extrametadataspec)_       | No       | Extra annotations and labels for the per-cluster headless Services. |
| HeadlessPodServices _[ExtraMetadataSpec](#extrametadataspec)_    | No       | Extra annotations and labels for the per-pod headless Services.     |
| LoadBalancers _[ExtraMetadataSpec](#extrametadataspec)_          | No       | Extra annotations and labels for LoadBalancer-type Services.        |

#### ExtraMetadataSpec

| Field                 | Required  | Description
|-----------------------|-----------|-----------------------------------|
| Labels _object_       | No        | Extra labels for a resource.      |
| Annotations _object_  | No        | Extra annotations for a resource. |

#### KurrentDBNetwork

| Field                                                            | Required | Description                                                                      |
|------------------------------------------------------------------|----------|----------------------------------------------------------------------------------|
| `domain` _string_                                                | Yes      | Domain used for external DNS e.g. advertised address exposed in the gossip state |
| `loadBalancer` _[KurrentDBLoadBalancer](#kurrentdbloadbalancer)_ | Yes      | Defines a load balancer to use with the database                                 |
| `fqdnTemplate` _string_                                          | No       | The template string used to define the external advertised address of a node     |

Note that `fqdnTemplate` supports the following expansions:
- `{name}` expands to KurrentDB.metadata.name
- `{namespace}` expands to KurretnDB.metadata.namespace
- `{domain}` expands to the KurrnetDBNetwork.domain
- `{podName}` expands to the name of the pod
- `{nodeTypeSuffix}` expands to `""` for a primary node or `"-replica"` for a replica node

When `fqdnTemplate` is empty, it defaults to `{podName}.{name}{nodeTypeSuffix}.{domain}`.

#### KurrentDBLoadBalancer

| Field                        | Required | Description                                                                    |
|------------------------------|----------|--------------------------------------------------------------------------------|
| `enabled` _boolean_          | Yes      | Determines if a load balancer should be deployed for each node                 |
| `allowedIps` _string array_  | No       | List of IP ranges allowed by the load balancer (default will allow all access) |

#### KurrentDBSecurity

| Field                                                                  | Required | Description                                                                                                           |
|------------------------------------------------------------------------|----------|-----------------------------------------------------------------------------------------------------------------------|
| `certificateReservedNodeCommonName` _string_                           | No       | Common name for the TLS certificate (this maps directly to the database property `CertificateReservedNodeCommonName`) |
| `certificateAuthoritySecret` _[CertificateSecret](#certificatesecret)_ | No       | Secret containing the CA TLS certificate.                                                                             |
| `certificateSecret` _[CertificateSecret](#certificatesecret)_          | Yes      | Secret containing the TLS certificate to use.                                                                         |
| `certificateSubjectName` _string_                                      | No       | Deprecated field.  The value of this field is always ignored.                                                         |

#### CertificateSecret

| Field                     | Required | Description                                                      |
|---------------------------|----------|------------------------------------------------------------------|
| `name` _string_           | Yes      | Name of the secret holding the certificate details               |
| `keyName` _string_        | Yes      | Key within the secret containing the TLS certificate             |
| `privateKeyName` _string_ | No       | Key within the secret containing the TLS certificate private key |


## KurrentDBBackup

This resource type is used to define a backup for an existing database deployment.

:::important
Resources of this type must be created within the same namespace as the target database cluster to backup.
:::

### API

| Field                                                                                   | Required | Description                                                                                                                             |
|-----------------------------------------------------------------------------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------|
| `clusterName` _string_                                                                  | Yes      | Name of the source database cluster                                                                                                     |
| `nodeName` _string_                                                                     | No       | Specific node name within the database cluster to use as the backup. If this is not specified, the leader will be picked as the source. |
| `volumeSnapshotClassName` _string_                                                      | Yes      | The name of the underlying volume snapshot class to use.                                                                                |
| `extraMetadata` _[KurrentDBBackupExtraMetadataSpec](#kurrentdbbackupextrametadataspec)_ | No       | Additional annotations and labels for child resources.                                                                                  |

#### KurrentDBBackupExtraMetadataSpec

| Field                                                            | Required | Description                                                                                 |
|------------------------------------------------------------------|----------|---------------------------------------------------------------------------------------------|
| All _[ExtraMetadataSpec](#extrametadataspec)_                    | No       | Extra annotations and labels for all child resource types (currently only VolumeSnapshots). |
| VolumeSnapshots _[ExtraMetadataSpec](#extrametadataspec)_        | No       | Extra annotations and labels for VolumeSnapshots.                                           |

## Configuring Kurrent DB

The [`KurrentDB.spec.configuration` yaml field](#kurrentdb) may contain any valid configuration values for Kurrent
DB.  However, some values may be unnecessary, as the Operator provides some defaults, while other
values may be ignored, as the Operator may override them.

The Operator-defined default configuration values, which may be overridden by the user's
`KurrentDB.spec.configuration` are:

| Default Field                | Default Value |
|------------------------------|---------------|
| DisableLogFile               | true          |
| EnableAtomPubOverHTTP        | true          |
| Insecure                     | false         |
| PrepareTimeoutMs             | 3000          |
| CommitTimeoutMs              | 3000          |
| GossipIntervalMs             | 2000          |
| GossipTimeoutMs              | 5000          |
| LeaderElectionTimeoutMs      | 2000          |
| ReplicationHeartbeatInterval | 1000          |
| ReplicationHeartbeatTimeout  | 2500          |
| NodeHeartbeatInterval        | 1000          |
| NodeHeartbeatTimeout         | 2500          |

The Operator-managed configuration values, which take precedence over the user's
`KurrentDB.spec.configuration`, are:

<!-- Values until ReplicationIp are from pkg/db/config.go -->
<!-- Values after ReplicationIp are from pkg/kubernetes/db/factory.go, as pod commandArgs -->

| Managed Field                | Value                                                        |
|------------------------------| -------------------------------------------------------------|
| Db                           | hard-coded volume mount point                                |
| Index                        | hard-coded volume mount point                                |
| Log                          | hard-coded volume mount point                                |
| Insecure                     | true if `KurrentDB.spec.security.certificateSecret` is empty |
| DiscoverViaDns               | false (`GossipSeed` is used instead)                         |
| AllowAnonymousEndpointAccess | true                                                         |
| AllowUnknownOptions          | true                                                         |
| NodeIp                       | 0.0.0.0 (to accept traffic from outside pod)                 |
| ReplicationIp                | 0.0.0.0 (to accept traffic from outside pod)                 |
| NodeHostAdvertiseAs          | Derived from pod name                                        |
| ReplicationHostAdvertiseAs   | Derived from pod name                                        |
| AdveritseHostToClientAs      | Derived from `KurrentDB.spec.newtork.fqdnTemplate`           |
| ClusterSize                  | Derived from `KurrentDB.spec.replicas`                       |
| GossipSeed                   | Derived from pod list                                        |
| ReadOnlyReplica              | Automatically set for ReadOnlyReplica pods                   |
