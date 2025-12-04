---
title: Example Deployments
order: 1
---

This page shows various deployment examples of KurrentDB.  Each example assumes the that the
Operator has been installed in a way that it can at least control KurrentDB resources in the
`kurrent` namespace.

Each example is designed to illustrate specific techniques:

* [Single Node Insecure Cluster](#single-node-insecure-cluster) is the "hello world" example
  that illustrates the most basic features possible.  An insecure cluster should not be used in
  production.

* [Three Node Insecure Cluster with Two Read-Only Replicas](
  #three-node-insecure-cluster-with-two-read-only-replicas) illustrates how to deploy a clustered
  KurrentDB instance and how to add read-only replicas to it.

* [Three Node Secure Cluster (using self-signed certificates)](
  #three-node-secure-cluster-using-self-signed-certificates) illustrates how to secure a cluster with
  self-signed certificates using cert-manager.

* [Three Node Secure Cluster (using LetsEncrypt)](
  #three-node-secure-cluster-using-letsencrypt) illustrates how to secure a cluster with LetsEncrypt.

* [Deploying Standalone Read-only Replicas](#deploying-standalone-read-only-replicas) illustrates
  an advanced topology where a pair of read-only replicas is deployed in a different Kubernetes
  cluster than where the quorum nodes are deployed.

* [Deploying With Scheduling Constraints](#deploying-with-scheduling-constraints): illustrates how
  to deploy a cluster with customized scheduling constraints for the KurrentDB pods.

* [Custom Database Configuration](#custom-database-configuration) illustrates how to make direct
  changes to the KurrentDB configuration file.

## Single Node Insecure Cluster

The following `KurrentDB` resource type defines a single node cluster with the following properties:

- The database will be deployed in the `kurrent` namespace with the name `kurrentdb-cluster`
- Security is not enabled
- KurrentDB version 25.0.0 will be used
- 1 vCPU will be requested as the minimum (upper bound is unlimited)
- 1 GB of memory will be used
- 512 MB of storage will be allocated for the data disk
- The KurrentDB instance that is provisioned will be exposed as `kurrentdb-0.kurrent.test`

```yaml
apiVersion: kubernetes.kurrent.io/v1
kind: KurrentDB
metadata:
  name: kurrentdb-cluster
  namespace: kurrent
spec:
  replicas: 1
  image: docker.kurrent.io/kurrent-latest/kurrentdb:25.1.0
  resources:
    requests:
      cpu: 1000m
      memory: 1Gi
  storage:
    volumeMode: "Filesystem"
    accessModes:
      - ReadWriteOnce
    resources:
      requests:
        storage: 512Mi
  network:
    domain: kurrent.test
    loadBalancer:
      enabled: true
    fqdnTemplate: '{podName}.{domain}'
```

## Enable Enterprise Features

The Operator license provided during Helm installation is different than the KurrentDB license used
to unlock the Enterprise features of KurrentDB.

You configure your KurrentDB license by creating a Secret containing the license key, and provide
a reference to that Secret in the `.spec.licenseSecret` field.  Note that the Secret resource and
the KurrentDB resource must be in the same namespace.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: my-license-secret
  namespace: kurrent
type: Opaque
stringData:
  licenseKey: 000000-111111-222222-AAAAAA-BBBBBB-CC
---
apiVersion: kubernetes.kurrent.io/v1
kind: KurrentDB
metadata:
  name: kurrentdb-cluster
  namespace: kurrent
spec:
  replicas: 1
  image: docker.kurrent.io/kurrent-latest/kurrentdb:25.1.0
  resources:
    requests:
      cpu: 1000m
      memory: 1Gi
  storage:
    volumeMode: "Filesystem"
    accessModes:
      - ReadWriteOnce
    resources:
      requests:
        storage: 512Mi
  network:
    domain: kurrent.test
    loadBalancer:
      enabled: true
    fqdnTemplate: '{podName}.{domain}'
  licenseSecret:
    name: my-license-secret
    key: licenseKey
```

## Three Node Insecure Cluster with Two Read-Only Replicas

Note that read-only replicas are only supported by KurrentDB in clustered configurations, that is,
with multiple quorum nodes.

The following `KurrentDB` resource type defines a three node cluster with the following properties:
- Security is not enabled
- 1 GB of memory will be used per quorum node, but read-only replicas will have 2 GB of memory
- The quorum nodes will be exposed as `kurrentdb-{idx}.kurrent.test`
- The read-only replicas will be exposed as `kurrentdb-replica-{idx}.kurrent.test`

```yaml
apiVersion: kubernetes.kurrent.io/v1
kind: KurrentDB
metadata:
  name: kurrentdb-cluster
  namespace: kurrent
spec:
  replicas: 3
  image: docker.kurrent.io/kurrent-latest/kurrentdb:25.1.0
  resources:
    requests:
      cpu: 1000m
      memory: 1Gi
  storage:
    volumeMode: "Filesystem"
    accessModes:
      - ReadWriteOnce
    resources:
      requests:
        storage: 512Mi
  network:
    domain: kurrent.test
    loadBalancer:
      enabled: true
    fqdnTemplate: '{podName}.{domain}'
  readOnlyReplicas:
    replicas: 2
```

## Three Node Secure Cluster (using self-signed certificates)

The following `KurrentDB` resource type defines a three node cluster with the following properties:
- Security is enabled using self-signed certificates
- The KurrentDB servers will be exposed as `kurrentdb-{idx}.kurrent.test`
- Servers will dial each other by Kubernetes service name (`*.kurrent.svc.cluster.local`)
- Clients will dial servers by the FQDN (`*.kurrent.test`)
- The self-signed certificate is valid for both service name and FQDN.

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: kurrentdb-cluster
  namespace: kurrent
spec:
  secretName: kurrentdb-cluster-tls
  isCA: false
  usages:
    - client auth
    - server auth
    - digital signature
    - key encipherment
  commonName: kurrentdb-node
  subject:
    organizations:
      - Kurrent
    organizationalUnits:
      - Cloud
  dnsNames:
    - '*.kurrentdb-cluster.kurrent.svc.cluster.local'
    - '*.kurrentdb-cluster-replica.kurrent.svc.cluster.local'
  privateKey:
    algorithm: RSA
    encoding: PKCS1
    size: 2048
  issuerRef:
    name: ca-issuer
    kind: Issuer
---
apiVersion: kubernetes.kurrent.io/v1
kind: KurrentDB
metadata:
  name: kurrentdb-cluster
  namespace: kurrent
spec:
  replicas: 3
  image: docker.kurrent.io/kurrent-latest/kurrentdb:25.1.0
  resources:
    requests:
      cpu: 1000m
      memory: 1Gi
  storage:
    volumeMode: "Filesystem"
    accessModes:
      - ReadWriteOnce
    resources:
      requests:
        storage: 512Mi
  network:
    domain: kurrent.test
    loadBalancer:
      enabled: true
    fqdnTemplate: '{podName}.{domain}'
    internodeTrafficStrategy: ServiceName
    clientTrafficStrategy: ServiceName
  security:
    certificateReservedNodeCommonName: kurrentdb-node
    certificateAuthoritySecret:
      name: ca-tls
      keyName: ca.crt
    certificateSecret:
      name: kurrentdb-cluster-tls
      keyName: tls.crt
      privateKeyName: tls.key
```

Before deploying this cluster, be sure to follow the steps in [Using Self-Signed Certificates](
managing-certificates.md#using-self-signed-certificates).

## Three Node Secure Cluster (using LetsEncrypt)

The following `KurrentDB` resource type defines a three node cluster with the following properties:
- Security is enabled using certificates from LetsEncrypt
- The KurrentDB instance that is provisioned will be exposed as `kurrentdb-{idx}.kurrent.test`
- The LetsEncrypt certificate is only valid for the FQDN (`*.kurrent.test`)
- Clients will dial servers by FQDN
- Server will dial each other by FQDN but because of the `SplitDNS` feature, they will still connect
  via direct pod-to-pod networking, as if they had dialed each other by Kubernetes service name.

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: kurrentdb-cluster
  namespace: kurrent
spec:
  secretName: kurrentdb-cluster-tls
  isCA: false
  usages:
    - client auth
    - server auth
    - digital signature
    - key encipherment
  commonName: '*.kurrent.test'
  subject:
    organizations:
      - Kurrent
    organizationalUnits:
      - Cloud
  dnsNames:
    - '*.kurrent.test'
  privateKey:
    algorithm: RSA
    encoding: PKCS1
    size: 2048
  issuerRef:
    name: letsencrypt
    kind: Issuer
---
apiVersion: kubernetes.kurrent.io/v1
kind: KurrentDB
metadata:
  name: kurrentdb-cluster
  namespace: kurrent
spec:
  replicas: 3
  image: docker.kurrent.io/kurrent-latest/kurrentdb:25.1.0
  resources:
    requests:
      cpu: 1000m
      memory: 1Gi
  storage:
    volumeMode: "Filesystem"
    accessModes:
      - ReadWriteOnce
    resources:
      requests:
        storage: 512Mi
  network:
    domain: kurrent.test
    loadBalancer:
      enabled: true
    fqdnTemplate: '{podName}.{domain}'
    internodeTrafficStrategy: SplitDNS
    clientTrafficStrategy: FQDN
  security:
    certificateReservedNodeCommonName: '*.kurrent.test'
    certificateSecret:
      name: kurrentdb-cluster-tls
      keyName: tls.crt
      privateKeyName: tls.key
```

Before deploying this cluster, be sure to follow the steps in [Using LetsEncrypt Certificates](
managing-certificates.md#using-trusted-certificates-via-letsencrypt).

## Deploying Standalone Read-only Replicas

This example illustrates an advanced topology where a pair of read-only replicas is deployed in a
different Kubernetes cluster than where the quorum nodes are deployed.

We make the following assumptions:
- LetsEncrypt certificates are used everywhere, to ease certificate management
- LoadBalancers are enabled to ensure each node is accessible through its FQDN
- `internodeTrafficStrategy` is `"SplitDNS"` to avoid hairpin traffic patterns between servers
- the quorum nodes will have `-qn` suffixes in their FQDN while the read-only replicas will have
  `-rr` suffixes

This `Certificate` should be deployed in **both** clusters:

```yaml
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: mydb
  namespace: kurrent
spec:
  secretName: mydb-tls
  isCA: false
  usages:
    - client auth
    - server auth
    - digital signature
    - key encipherment
  commonName: '*.kurrent.test'
  subject:
    organizations:
      - Kurrent
    organizationalUnits:
      - Cloud
  dnsNames:
    - '*.kurrent.test'
  privateKey:
    algorithm: RSA
    encoding: PKCS1
    size: 2048
  issuerRef:
    name: letsencrypt
    kind: Issuer
```

This `KurrentDB` resource defines the quorum nodes in one cluster:

```yaml
apiVersion: kubernetes.kurrent.io/v1
kind: KurrentDB
metadata:
  name: mydb
  namespace: kurrent
spec:
  replicas: 3
  image: docker.kurrent.io/kurrent-latest/kurrentdb:25.1.0
  resources:
    requests:
      cpu: 1000m
      memory: 1Gi
  storage:
    volumeMode: "Filesystem"
    accessModes:
      - ReadWriteOnce
    resources:
      requests:
        storage: 512Mi
  network:
    domain: kurrent.test
    loadBalancer:
      enabled: true
    fqdnTemplate: '{podName}-qn.{domain}'
    internodeTrafficStrategy: SplitDNS
    clientTrafficStrategy: FQDN
  security:
    certificateReservedNodeCommonName: '*.kurrent.test'
    certificateSecret:
      name: mydb-tls
      keyName: tls.crt
      privateKeyName: tls.key
```

And this `KurrentDB` resource defines the standalone read-only replica in another cluster.  Notice
that:

- `.replicas` is 0, but `.quorumNodes` is set instead
- `.readOnlyReplicas.replicas` is set
- `fqdnTemplate` differs slightly from above

```yaml
apiVersion: kubernetes.kurrent.io/v1
kind: KurrentDB
metadata:
  name: mydb
  namespace: kurrent
spec:
  replicas: 0
  quorumNodes:
    - mydb-0-qn.kurrent.test:2113
    - mydb-1-qn.kurrent.test:2113
    - mydb-2-qn.kurrent.test:2113
  readOnlyReplicas:
    replicas: 2
  image: docker.kurrent.io/kurrent-latest/kurrentdb:25.1.0
  resources:
    requests:
      cpu: 1000m
      memory: 1Gi
  storage:
    volumeMode: "Filesystem"
    accessModes:
      - ReadWriteOnce
    resources:
      requests:
        storage: 512Mi
  network:
    domain: kurrent.test
    loadBalancer:
      enabled: true
    fqdnTemplate: '{podName}-sa.{domain}'
    internodeTrafficStrategy: SplitDNS
    clientTrafficStrategy: FQDN
  security:
    certificateReservedNodeCommonName: '*.kurrent.test'
    certificateSecret:
      name: mydb-tls
      keyName: tls.crt
      privateKeyName: tls.key
```

## Deploying With Scheduling Constraints

The pods created for a KurrentDB resource can be configured with any of the constraints commonly applied to pods:

- [Node Selectors](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#nodeselector)
- [Affinity and Anti-Affinity](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity)
- [Topology Spread Constraints](https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/)
- [Tolerations](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/)
- [Node Name](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#nodename)

For example, in cloud deployments, you may want to maximize uptime by asking each replica of a
KurrentDB cluster to be deployed in a different availability zone.  The following KurrentDB resource
does that, and also requires KurrentDB to schedule pods onto nodes labeled with
`machine-size:large`:

```yaml
apiVersion: kubernetes.kurrent.io/v1
kind: KurrentDB
metadata:
  name: my-kurrentdb-cluster
  namespace: kurrent
spec:
  replicas: 3
  image: docker.kurrent.io/kurrent-latest/kurrentdb:25.1.0
  resources:
    requests:
      cpu: 1000m
      memory: 1Gi
  storage:
    volumeMode: "Filesystem"
    accessModes:
      - ReadWriteOnce
    resources:
      requests:
        storage: 512Mi
  network:
    domain: kurrent.test
    loadBalancer:
      enabled: true
    fqdnTemplate: '{podName}.{domain}'
  constraints:
    nodeSelector:
      machine-size: large
    topologySpreadConstraints:
    - maxSkew: 1
      topologyKey: zone
      labelSelector:
        matchLabels:
          app.kubernetes.io/part-of: kurrentdb-operator
          app.kubernetes.io/name: my-kurrentdb-cluster
      whenUnsatisfiable: DoNotSchedule
```

If no scheduling constraints are configured, the operator sets a default soft constraint configuring
pod anti-affinity such that multiple replicas will prefer to run on different nodes, for better
fault tolerance.

## Custom Database Configuration

If custom parameters are required in the underlying database configuration then these can be
specified using the `configuration` YAML block within a `KurrentDB`. The parameters which are
defaulted or overridden by the operator are listed [in the CRD reference](
../getting-started/resource-types.md#configuring-kurrent-db).

For example, to enable projections, the deployment configuration looks as follows:

```yaml
apiVersion: kubernetes.kurrent.io/v1
kind: KurrentDB
metadata:
  name: kurrentdb-cluster
  namespace: kurrent
spec:
  replicas: 1
  image: docker.kurrent.io/kurrent-latest/kurrentdb:25.1.0
  configuration:
    RunProjections: all
    StartStandardProjections: true
  resources:
    requests:
      cpu: 1000m
      memory: 1Gi
  storage:
    volumeMode: "Filesystem"
    accessModes:
      - ReadWriteOnce
    resources:
      requests:
        storage: 512Mi
  network:
    domain: kurrent.test
    loadBalancer:
      enabled: true
    fqdnTemplate: '{podName}.{domain}'
```

## Accessing Deployments

### External

The Operator will create one service of type `LoadBalancer` per KurrentDB node when the
`spec.network.loadBalancer.enabled` flag is set to `true`.

Each service is annotated with `external-dns.alpha.kubernetes.io/hostname: {external cluster endpoint}` to allow the third-party tool [ExternalDNS](https://github.com/kubernetes-sigs/external-dns) to configure external access.

### Internal

The Operator will create headless services to access a KurrentDB cluster internally. This includes:
- One for the underlying statefulset (selects all pods)
- One per pod in the statefulset to support `Ingress` rules that require one target endpoint
