---
title: Migrate from EventStore to KurrentDB Java Client
description: Automatically migrate your Java applications from the EventStore client to the new KurrentDB client using OpenRewrite.
author:
  - david
categories:
  - KurrentDB
  - java
---

Following the [Event Store rebrand to Kurrent](https://www.kurrent.io/blog/event-store-is-evolving-to-kurrent), all client libraries have been updated with new package names and improved APIs. This guide shows you how to automatically migrate your Java application from `com.eventstore.db-client-java` to the new `io.kurrent.kurrentdb-client`.

## Why Migrate?

- **Latest features and improvements**: The KurrentDB client includes performance enhancements and new capabilities
- **Automated migration**: Use [OpenRewrite](https://docs.openrewrite.org/) to handle the migration automatically with minimal manual effort

## Prerequisites

- Java 8 or above
- Maven or Gradle build tool
- Existing application using `com.eventstore.db-client-java` dependency

## What Gets Updated

This migration will automatically update:

- **Dependencies**: `com.eventstore:db-client-java` → `io.kurrent:kurrentdb-client`
- **Package imports**: `com.eventstore.dbclient` → `io.kurrent.dbclient`
- **Class names**: `EventStoreDBClient` → `KurrentDBClient`
- **Connection strings**: `esdb://` → `kurrent://`
- **Method names**: `expectedRevision()` → `streamRevision()`

## Step 1: Create Migration Recipe

Create a file named `rewrite.yml` in the root directory of your Java project:

<details>
<summary>Click to show rewrite.yml contents</summary>

```yaml
---
type: specs.openrewrite.org/v1beta/recipe
name: io.kurrent.java.UpgradeClient
displayName: Migrate to Kurrent Client
description: >
  Migrate applications to the latest KurrentDB from EventStoreDB client. This recipe will modify an
  application's pom files, migrate to the new names of classes, update package information and change the connection strings.
tags:
  - KurrentDB
  - Kurrent

# Update dependencies
recipeList:
  - org.openrewrite.java.dependencies.ChangeDependency:
      oldGroupId: com.eventstore
      oldArtifactId: db-client-java
      newGroupId: io.kurrent
      newArtifactId: kurrentdb-client
      newVersion: 1.0.2

# Update class names
  - org.openrewrite.java.ChangeType:
      oldFullyQualifiedTypeName: com.eventstore.dbclient.EventStoreDBClientBase
      newFullyQualifiedTypeName: io.kurrent.dbclient.KurrentDBClientBase
  - org.openrewrite.java.ChangeType:
      oldFullyQualifiedTypeName: com.eventstore.dbclient.EventStoreDBClient
      newFullyQualifiedTypeName: io.kurrent.dbclient.KurrentDBClient
  - org.openrewrite.java.ChangeType:
      oldFullyQualifiedTypeName: com.eventstore.dbclient.EventStoreDBClientSettings
      newFullyQualifiedTypeName: io.kurrent.dbclient.KurrentDBClientSettings
  - org.openrewrite.java.ChangeType:
      oldFullyQualifiedTypeName: com.eventstore.dbclient.EventStoreDBConnectionString
      newFullyQualifiedTypeName: io.kurrent.dbclient.KurrentDBConnectionString
  - org.openrewrite.java.ChangeType:
      oldFullyQualifiedTypeName: com.eventstore.dbclient.EventStoreDBProjectionManagementClient
      newFullyQualifiedTypeName: io.kurrent.dbclient.KurrentDBProjectionManagementClient
  - org.openrewrite.java.ChangeType:
      oldFullyQualifiedTypeName: com.eventstore.dbclient.EventStoreDBPersistentSubscriptionsClient
      newFullyQualifiedTypeName: io.kurrent.dbclient.KurrentDBPersistentSubscriptionsClient
  - org.openrewrite.java.ChangeType:
      oldFullyQualifiedTypeName: com.eventstore.dbclient.ExpectedRevision
      newFullyQualifiedTypeName: io.kurrent.dbclient.StreamState

# Update package names
  - org.openrewrite.java.ChangePackage:
      oldPackageName: com.eventstore.dbclient
      newPackageName: io.kurrent.dbclient

# Update method names and connection strings
  - org.openrewrite.text.FindAndReplace:
      find: expectedRevision(
      replace: streamRevision(
      caseSensitive: true
  - org.openrewrite.text.FindAndReplace:
      find: esdb://
      replace: kurrent://
      caseSensitive: true
  - org.openrewrite.text.FindAndReplace:
      find: esdb+discover://
      replace: kurrent+discover://
      caseSensitive: true
---
```
</details>

## Step 2: Run the Migration

Choose the command based on your build tool:

::: tabs
@tab Maven
```bash
# Run the migration (this will scan and update your code automatically)
./mvnw -U org.openrewrite.maven:rewrite-maven-plugin:run \
  -Drewrite.activeRecipes=io.kurrent.java.UpgradeClient \
  -Drewrite.recipeArtifactCoordinates=org.openrewrite.recipe:rewrite-java-dependencies:1.29.0,org.openrewrite.recipe:rewrite-migrate-java:3.3.0
```

If you're not using the Maven wrapper, replace `./mvnw` with `mvn`.

@tab Gradle
First, create an `init.gradle` file with the following contents:

```kotlin
initscript {
    repositories {
        maven { url "https://plugins.gradle.org/m2" }
    }
    dependencies {
        classpath("org.openrewrite:plugin:latest.release")
    }
}

rootProject {
    plugins.apply(org.openrewrite.gradle.RewritePlugin)
    dependencies {
        rewrite("org.openrewrite.recipe:rewrite-java-dependencies:latest.release")
        rewrite("org.openrewrite.recipe:rewrite-migrate-java:latest.release")
    }

    afterEvaluate {
        if (repositories.isEmpty()) {
            repositories {
                mavenCentral()
            }
        }
    }
}
```

Then run:
```bash
# Run the migration
gradle rewriteRun --init-script init.gradle -Drewrite.activeRecipe=io.kurrent.java.UpgradeClient
```
:::

## Step 3: Review Changes

The migration will show output similar to this:

```bash
[INFO] Using active recipe(s) [io.kurrent.java.UpgradeClient]
[WARNING] Changes have been made to pom.xml by:
[WARNING]     org.openrewrite.java.dependencies.ChangeDependency: {oldGroupId=com.eventstore, oldArtifactId=db-client-java, newGroupId=io.kurrent, newArtifactId=kurrentdb-client, newVersion=1.0.2}
[WARNING] Changes have been made to LoanApplicationDemo/Java/src/main/java/com/example/CreditController.java by:
[WARNING]     org.openrewrite.java.ChangeType: {oldFullyQualifiedTypeName=com.eventstore.dbclient.EventStoreDBClient, newFullyQualifiedTypeName=io.kurrent.dbclient.KurrentDBClient}
...
[WARNING] Please review and commit the results.
[WARNING] Estimate time saved: 1h 20m
```

## Important: Manual Review Required

### ExpectedRevision Changes

The migration automatically converts `expectedRevision()` calls to `streamRevision()`, but this assumes you're passing a `long` parameter. If you're passing a `StreamState` object, you'll need to manually change these to `streamState()`:

**Before:**
```java
// This will be auto-converted correctly
appendOptions.expectedRevision(5L);

// This will need manual fixing after migration
appendOptions.expectedRevision(StreamState.NO_STREAM);
```

**After migration:**
```java
// Auto-converted (correct)
appendOptions.streamRevision(5L);

// Needs manual fix - change to:
appendOptions.streamState(StreamState.NO_STREAM);
```

## After Migration

1. **Test your application**: Run your test suite to ensure everything works correctly
2. **Fix any StreamState calls**: Review compilation errors for `streamState()` vs `streamRevision()` usage
3. **Verify connection strings**: Ensure all `kurrent://` connections work as expected
4. **Update documentation**: Update any internal docs referencing the old client
5. **Clean up**: Remove the `rewrite.yml` and `init.gradle` files if no longer needed

## Need Help?

If you encounter issues during migration:
- Check the [KurrentDB Java client documentation](@clients/grpc/getting-started.md)
- Review the [OpenRewrite documentation](https://docs.openrewrite.org) for advanced configuration
- Open an issue in the [KurrentDB Java client repository](https://github.com/kurrent-io/KurrentDB-Client-Java)

The migration should handle 95% of the changes automatically, saving you significant time while ensuring consistency across your codebase.