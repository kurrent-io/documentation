---
order: 3
---

# Pulumi provider

Kurrent Cloud provides a Pulumi provider, `kurrentcloud`, to automate the provisioning of KurrentDB clusters and the resources around them: projects, networks, peerings, managed clusters, read-only replica sets, scheduled backups and integrations. The provider is developed in the [`pulumi-kurrentcloud` repository][pulumi provider], which also holds its documentation and examples.

::: info
The provider was previously published as `eventstorecloud`. If your stacks use it, see [Migrating from `eventstorecloud`](#migrating-from-eventstorecloud).
:::

## Installation

The provider is available for every Pulumi language:

| Language | Install |
|:---------|:--------|
| TypeScript/JavaScript | `npm install @kurrent/pulumi-kurrentcloud` |
| Python | `pip install pulumi_kurrentcloud` |
| Go | `go get github.com/kurrent-io/pulumi-kurrentcloud/sdk/go/kurrentcloud` |
| .NET | `dotnet add package Kurrent.Pulumi.KurrentCloud` |

Each package downloads the provider plugin the first time a program runs. To install the plugin ahead of time, for example in a CI image:

```bash
# The latest release
pulumi plugin install resource kurrentcloud --server github://api.github.com/kurrent-io
# A specific release
pulumi plugin install resource kurrentcloud v0.3.1 --server github://api.github.com/kurrent-io
```

## Configuration

The provider needs the ID of your organization and credentials to act on its behalf. The organization ID is on the organization's settings page in the [Cloud console][cloud console].

For credentials, use either:

- **A [service account](../access-control/service-accounts.md)** (recommended for automation): set `clientId` and `clientSecret` to the values from the service account's Authentication tab. When both are set, the provider uses them and ignores `token`.
- **A token** for a Kurrent Cloud account with admin access to the organization: set `token`.

Set them with `pulumi config`:

```bash
pulumi config set kurrentcloud:organizationId <organization-id>

# Service account
pulumi config set kurrentcloud:clientId <client-id>
pulumi config set --secret kurrentcloud:clientSecret <client-secret>

# or a token
pulumi config set --secret kurrentcloud:token <token>
```

Or with environment variables, which take the same values:

```bash
export ESC_ORG_ID=<organization-id>
export ESC_CLIENT_ID=<client-id>
export ESC_CLIENT_SECRET=<client-secret>
# or
export ESC_TOKEN=<token>
```

## Usage

This TypeScript program creates a single-node cluster in an existing project and network, which it looks up by name:

```typescript
import * as kurrent from "@kurrent/pulumi-kurrentcloud";

const project = kurrent.getProjectOutput({ name: "Default" });
const network = kurrent.getNetworkOutput({ projectId: project.id, name: "My network" });

const cluster = new kurrent.ManagedCluster("cluster", {
    name: "my-cluster",
    projectId: project.id,
    networkId: network.id,
    topology: "single-node",
    instanceType: "F1",
    diskSize: 16,
    diskType: "gp3",
    diskIops: 3000,
    diskThroughput: 125,
    serverVersion: "26.0",
});

export const dnsName = cluster.dnsName;
```

Find examples in every language and the full list of resources in the [provider repository][pulumi provider].

## Migrating from `eventstorecloud`

The `eventstorecloud` package is replaced by `kurrentcloud`. Every `kurrentcloud` resource declares an alias to its old `eventstorecloud` type, so an existing stack moves to the new package without replacing any cloud resources:

1. Replace the package with its `kurrentcloud` equivalent:

   | Language | Old package | New package |
   |:---------|:------------|:------------|
   | TypeScript/JavaScript | `@eventstore/pulumi-eventstorecloud` | `@kurrent/pulumi-kurrentcloud` |
   | Python | `pulumi_eventstorecloud` | `pulumi_kurrentcloud` |
   | Go | `github.com/EventStore/pulumi-eventstorecloud/sdk/go/eventstorecloud` | `github.com/kurrent-io/pulumi-kurrentcloud/sdk/go/kurrentcloud` |
   | .NET | `Pulumi.EventStoreCloud` | `Kurrent.Pulumi.KurrentCloud` |

2. If you configure the provider with `pulumi config`, move the settings from the `eventstorecloud:` namespace to `kurrentcloud:`, for example `eventstorecloud:organizationId` to `kurrentcloud:organizationId`. The keys and the `ESC_*` environment variables are unchanged.
3. Run `pulumi preview` and check that it shows `0 to replace` before running `pulumi up`.

The [migration guide][pulumi migration] covers each language in detail.

[pulumi provider]: https://github.com/kurrent-io/pulumi-kurrentcloud
[pulumi migration]: https://github.com/kurrent-io/pulumi-kurrentcloud/blob/main/MIGRATION.md
[cloud console]: https://console.kurrent.cloud/
