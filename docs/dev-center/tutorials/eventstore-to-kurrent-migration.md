---
title: Upgrade to the KurrentDB Java client
description: Easily upgrade your applications to use the rebranded KurrentDB Java client from the EventStoreDB client.
author:
  - david
draft: false
pubDate: 2025-06-15
heroImage: ./heroImage.png
type: article
featured: true
categories:
  - KurrentDB
  - java
---


# Introduction

This guide provides a procedure to easily upgrade from the *com.eventstore* client to the *io.kurrent* client.


As [EventStore rebranded to Kurrent](https://www.kurrent.io/blog/event-store-is-evolving-to-kurrent), so did the database clients. For applications using the java client, this causes some effort due to the renaming of packages and classes, as well as configuration parameters.

This guide will walk you through how to use an [OpenRewrite](https://docs.openrewrite.org) recipe to automatically update the Java code and its dependencies to the new Kurrent Java client.

## Requirements
- Java 8 or above
- Maven or Gradle (if not using the Maven or Gradle wrappers)
- A Java application that uses `com.eventstore.db-client-java` dependency.

## Setup

First, create a composite recipe comprising of soem recipes that will change the code and dependencies.

Create a file named `rewrite.yml` in the root directory of your Java project and copy the following:

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
recipeList:
  - org.openrewrite.java.dependencies.ChangeDependency:
      oldGroupId: com.eventstore
      oldArtifactId: db-client-java
      newGroupId: io.kurrent
      newArtifactId: kurrentdb-client
      newVersion: 1.0.2
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
  - org.openrewrite.java.ChangePackage:
      oldPackageName: com.eventstore.dbclient
      newPackageName: io.kurrent.dbclient
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

This file defines a new OpenRewrite recipe named `io.kurrent.java.UpgradeClient`. 

## Execution

Depending on which build automation tool you use (Maven or Gradle), the execution of the above composite recipe is slightly different:

::: tabs
@tab maven
If using Maven, simply run the following command:
```bash
./mvnw -U org.openrewrite.maven:rewrite-maven-plugin:run -Drewrite.activeRecipes=io.kurrent.java.UpgradeClient -Drewrite.recipeArtifactCoordinates=org.openrewrite.recipe:rewrite-java-dependencies:1.29.0,org.openrewrite.recipe:rewrite-migrate-java:3.3.0
```
If maven wrapper is not being used, replace `./mvnw` with `mvn`
@tab gradle
If using `Gradle`, you'll have to create a [Gradle init script](https://docs.openrewrite.org/running-recipes/running-rewrite-on-a-gradle-project-without-modifying-the-build). Create a `init.gradle` file with the following contents :

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
And then execute 

```bash
gradle rewriteRun --init-script init.gradle -Drewrite.activeRecipe=io.kurrent.java.UpgradeClient
```
:::

The output will be similar to:

```bash
[INFO] Using active recipe(s) [io.kurrent.java.UpgradeClient]
[INFO] Using active styles(s) []
[INFO] Validating active recipes...
[INFO] Project [loan-approvals] Resolving Poms...
[INFO] Project [loan-approvals] Parsing source files
[INFO] Running recipe(s)...
[WARNING] Changes have been made to LoanApplicationDemo/Java/loan-approvals/pom.xml by:
[WARNING]     org.openrewrite.java.dependencies.ChangeDependency: {oldGroupId=com.eventstore, oldArtifactId=db-client-java, newGroupId=io.kurrent, newArtifactId=kurrentdb-client, newVersion=1.0.2}
[WARNING] Changes have been made to LoanApplicationDemo/Java/loan-approvals/src/main/java/com/eventstore/loans/credit/CreditController.java by:
[WARNING]     org.openrewrite.java.ChangeType: {oldFullyQualifiedTypeName=com.eventstore.dbclient.EventStoreDBClientBase, newFullyQualifiedTypeName=io.kurrent.dbclient.KurrentDBClientBase}
[WARNING]         org.openrewrite.java.ChangeType: {oldFullyQualifiedTypeName=com.eventstore.dbclient.EventStoreDBClient, newFullyQualifiedTypeName=io.kurrent.dbclient.KurrentDBClient}
[WARNING]             org.openrewrite.java.ChangePackage: {oldPackageName=com.eventstore.dbclient, newPackageName=io.kurrent.dbclient}
[WARNING] Changes have been made to LoanApplicationDemo/Java/loan-approvals/src/main/java/com/eventstore/loans/LoanApprovalsConfiguration.java by:
[WARNING]     org.openrewrite.java.ChangeType: {oldFullyQualifiedTypeName=com.eventstore.dbclient.EventStoreDBClientBase, newFullyQualifiedTypeName=io.kurrent.dbclient.KurrentDBClientBase}
[WARNING]         org.openrewrite.java.ChangeType: {oldFullyQualifiedTypeName=com.eventstore.dbclient.EventStoreDBClient, newFullyQualifiedTypeName=io.kurrent.dbclient.KurrentDBClient}
[WARNING]             org.openrewrite.java.ChangeType: {oldFullyQualifiedTypeName=com.eventstore.dbclient.EventStoreDBClientSettings, newFullyQualifiedTypeName=io.kurrent.dbclient.KurrentDBClientSettings}
[WARNING]                 org.openrewrite.java.ChangeType: {oldFullyQualifiedTypeName=com.eventstore.dbclient.EventStoreDBConnectionString, newFullyQualifiedTypeName=io.kurrent.dbclient.KurrentDBConnectionString}
[WARNING] Changes have been made to LoanApplicationDemo/Java/loan-approvals/src/main/java/com/eventstore/loans/LoanApprovalsApplication.java by:
[WARNING]     org.openrewrite.java.ChangeType: {oldFullyQualifiedTypeName=com.eventstore.dbclient.EventStoreDBClientBase, newFullyQualifiedTypeName=io.kurrent.dbclient.KurrentDBClientBase}
[WARNING]         org.openrewrite.java.ChangeType: {oldFullyQualifiedTypeName=com.eventstore.dbclient.EventStoreDBClient, newFullyQualifiedTypeName=io.kurrent.dbclient.KurrentDBClient}
[WARNING]             org.openrewrite.java.ChangeType: {oldFullyQualifiedTypeName=com.eventstore.dbclient.EventStoreDBClientSettings, newFullyQualifiedTypeName=io.kurrent.dbclient.KurrentDBClientSettings}
[WARNING]                 org.openrewrite.java.ChangeType: {oldFullyQualifiedTypeName=com.eventstore.dbclient.EventStoreDBConnectionString, newFullyQualifiedTypeName=io.kurrent.dbclient.KurrentDBConnectionString}
[WARNING] Changes have been made to LoanApplicationDemo/Java/loan-approvals/src/main/java/com/eventstore/loans/subscriptions/EventHandler.java by:
[WARNING]     org.openrewrite.java.ChangePackage: {oldPackageName=com.eventstore.dbclient, newPackageName=io.kurrent.dbclient}
[WARNING] Changes have been made to LoanApplicationDemo/Java/loan-approvals/src/main/java/com/eventstore/loans/subscriptions/PersistentSubscriptionListener.java by:
[WARNING]     org.openrewrite.java.ChangeType: {oldFullyQualifiedTypeName=com.eventstore.dbclient.EventStoreDBClientBase, newFullyQualifiedTypeName=io.kurrent.dbclient.KurrentDBClientBase}
[WARNING]         org.openrewrite.java.ChangeType: {oldFullyQualifiedTypeName=com.eventstore.dbclient.EventStoreDBClient, newFullyQualifiedTypeName=io.kurrent.dbclient.KurrentDBClient}
[WARNING]             org.openrewrite.java.ChangeType: {oldFullyQualifiedTypeName=com.eventstore.dbclient.EventStoreDBPersistentSubscriptionsClient, newFullyQualifiedTypeName=io.kurrent.dbclient.KurrentDBPersistentSubscriptionsClient}
[WARNING]                 org.openrewrite.java.ChangePackage: {oldPackageName=com.eventstore.dbclient, newPackageName=io.kurrent.dbclient}
[WARNING] Changes have been made to LoanApplicationDemo/Java/loan-approvals/src/main/java/com/eventstore/loans/subscriptions/SubscriptionListener.java by:
[WARNING]     org.openrewrite.java.ChangeType: {oldFullyQualifiedTypeName=com.eventstore.dbclient.EventStoreDBClientBase, newFullyQualifiedTypeName=io.kurrent.dbclient.KurrentDBClientBase}
[WARNING]         org.openrewrite.java.ChangeType: {oldFullyQualifiedTypeName=com.eventstore.dbclient.EventStoreDBClient, newFullyQualifiedTypeName=io.kurrent.dbclient.KurrentDBClient}
[WARNING]             org.openrewrite.java.ChangePackage: {oldPackageName=com.eventstore.dbclient, newPackageName=io.kurrent.dbclient}
[WARNING] Changes have been made to LoanApplicationDemo/Java/loan-approvals/src/main/java/com/eventstore/loans/decider/DeciderController.java by:
[WARNING]     org.openrewrite.java.ChangeType: {oldFullyQualifiedTypeName=com.eventstore.dbclient.EventStoreDBClientBase, newFullyQualifiedTypeName=io.kurrent.dbclient.KurrentDBClientBase}
[WARNING]         org.openrewrite.java.ChangeType: {oldFullyQualifiedTypeName=com.eventstore.dbclient.EventStoreDBClient, newFullyQualifiedTypeName=io.kurrent.dbclient.KurrentDBClient}
[WARNING]             org.openrewrite.java.ChangePackage: {oldPackageName=com.eventstore.dbclient, newPackageName=io.kurrent.dbclient}
[WARNING] Changes have been made to LoanApplicationDemo/Java/loan-approvals/src/main/java/com/eventstore/loans/request/LoansController.java by:
[WARNING]     org.openrewrite.java.ChangeType: {oldFullyQualifiedTypeName=com.eventstore.dbclient.EventStoreDBClientBase, newFullyQualifiedTypeName=io.kurrent.dbclient.KurrentDBClientBase}
[WARNING]         org.openrewrite.java.ChangeType: {oldFullyQualifiedTypeName=com.eventstore.dbclient.EventStoreDBClient, newFullyQualifiedTypeName=io.kurrent.dbclient.KurrentDBClient}
[WARNING]             org.openrewrite.java.ChangePackage: {oldPackageName=com.eventstore.dbclient, newPackageName=io.kurrent.dbclient}
[WARNING] Changes have been made to LoanApplicationDemo/Java/loan-approvals/src/main/java/com/eventstore/loans/underwriting/ApprovalsService.java by:
[WARNING]     org.openrewrite.java.ChangeType: {oldFullyQualifiedTypeName=com.eventstore.dbclient.EventStoreDBClientBase, newFullyQualifiedTypeName=io.kurrent.dbclient.KurrentDBClientBase}
[WARNING]         org.openrewrite.java.ChangeType: {oldFullyQualifiedTypeName=com.eventstore.dbclient.EventStoreDBClient, newFullyQualifiedTypeName=io.kurrent.dbclient.KurrentDBClient}
[WARNING]             org.openrewrite.java.ChangePackage: {oldPackageName=com.eventstore.dbclient, newPackageName=io.kurrent.dbclient}
[WARNING] Changes have been made to LoanApplicationDemo/Java/loan-approvals/src/main/resources/application.yml by:
[WARNING]     org.openrewrite.text.FindAndReplace: {find=esdb+discover://, replace=kurrent+discover://, caseSensitive=true}
[WARNING] Changes have been made to LoanApplicationDemo/Java/loan-approvals/rewrite.yml by:
[WARNING]     org.openrewrite.text.FindAndReplace: {find=esdb://, replace=kurrent://, caseSensitive=true}
[WARNING]         org.openrewrite.text.FindAndReplace: {find=esdb+discover://, replace=kurrent+discover://, caseSensitive=true}
[WARNING] Changes have been made to LoanApplicationDemo/Java/loan-approvals/cluster-config.yml by:
[WARNING]     org.openrewrite.text.FindAndReplace: {find=esdb+discover://, replace=kurrent+discover://, caseSensitive=true}
[WARNING] Changes have been made to LoanApplicationDemo/Java/loan-approvals/config.yml by:
[WARNING]     org.openrewrite.text.FindAndReplace: {find=esdb+discover://, replace=kurrent+discover://, caseSensitive=true}
[WARNING] Changes have been made to LoanApplicationDemo/Java/loan-approvals/shared.yml by:
[WARNING]     org.openrewrite.text.FindAndReplace: {find=esdb+discover://, replace=kurrent+discover://, caseSensitive=true}
[WARNING] Changes have been made to LoanApplicationDemo/Java/loan-approvals/README.md by:
[WARNING]     org.openrewrite.text.FindAndReplace: {find=esdb+discover://, replace=kurrent+discover://, caseSensitive=true}
[WARNING] Please review and commit the results.
[WARNING] Estimate time saved: 1h 20m

```

Once the recipe has been executed, package names, class names, dependencies and connection strings, would have been updated to use the KurrentDB Java client.

# Notes
   ### expectedRevision

The `OptionsWithExpectedRevisionBase` has been replaced with `OptionsWithStreamStateBase`. These classes provide the ability to set the expected revision on `AppendToStreamOptions` and `DeleteStreamOptions`. 

Whilst the former class had two overloaded methods named `expectedRevision` allowing to pass in a `ExpectedRevision` object or a `long`, in the latter, the methods are named differently.

    1. streamState(StreamState state)
    2. streamRevision(long revision)

This means we can't automatically convert without knowing the type of the parameter. 

The set of rules above makes an assumption towards the `long` parameter version, so will convert `expectedRevision(something)` to `streamRevision(something)`. If `something` is actually a `StreamState` then compilation will fail until the call is renamed to `streamState(something)`.