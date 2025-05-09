---
title: Introduction
---

# Introduction

This tutorial will guide you through the Outbox Out of the Box sample with KurrentDB using GitHub Codespaces.

## Objectives

In this tutorial, you will:

- Understand how triggering events in KurrentDB can initiate updates to external data stores
- Implement persistent subscriptions to process events from KurrentDB streams
- Observe real-time event processing with persistent subscriptions
- Create and configure consumer groups for reliable event processing
- Develop idempotent event handlers to safely process events with at-least-once delivery guarantees
- Implement proper error handling strategies for both transient and permanent errors
- Work with checkpoints to ensure events are properly processed after system failures
- Learn how to handle problematic events by using techniques like retrying and skipping

## Prerequisites

Before starting, ensure you have the following:

- A GitHub account to use GitHub Codespaces
- Basic knowledge of c#
- Familiarity with command-line operations

## Tutorial Overview

This tutorial consists of the following steps:

### [Part 1: Set up Codespaces](/getting-started/use-cases/outbox/tutorial-1.md)
1. **[Set up your Codespaces](/getting-started/use-cases/outbox/tutorial-1.md#step-1-set-up-your-codespaces)**: Starts up an interactive coding environment in your browser where all tools and databases are installed

### [Part 2: Trigger Writes to External Data Stores](/getting-started/use-cases/outbox/tutorial-2.md)
1. **[Start Databases and Append OrderPlaced Event to KurrentDB](/getting-started/use-cases/outbox/tutorial-2.md#step-2-start-databases-and-append-orderplaced-event-to-kurrentdb)**: Start up KurrentDB and PostgreSQL, and append sample OrderPlaced events
2. **[Browse OrderPlaced Events in KurrentDB's Admin UI](/getting-started/use-cases/outbox/tutorial-2.md#step-3-browse-orderplaced-events-in-kurrentdb-s-admin-ui)**: Access the Admin UI to explore the triggering events

### [Part 3: Write to a External Data Store with Persistent Subscription](/getting-started/use-cases/outbox/tutorial-3.md)
1. **[Create a KurrentDB Persistent Subscription Consumer Group](/getting-started/use-cases/outbox/tutorial-3.md#step-4-create-a-kurrentdb-persistent-subscription-consumer-group)**: Set up a persistent subscription to process events
2. **[Review the Consumer Group from KurrentDB Admin UI](/getting-started/use-cases/outbox/tutorial-3.md#step-5-review-the-consumer-group-from-kurrentdb-admin-ui)**: Examine the created consumer group
3. **[Start the Order Processor Application](/getting-started/use-cases/outbox/tutorial-3.md#step-6-start-the-order-processor-application)**: Run the application that processes OrderPlaced events
4. **[Examine the Order Processor Application Codebase](/getting-started/use-cases/outbox/tutorial-3.md#step-7-examine-the-order-processor-application-codebase)**: Understand how idempotent event processing works
5. **[Process New Events in Real-Time](/getting-started/use-cases/outbox/tutorial-3.md#step-8-process-new-events-in-real-time)**: Observe real-time event processing with persistent subscriptions

### [Part 4: Error Handling of Writes to External Data Stores](/getting-started/use-cases/outbox/tutorial-4.md)
1. **[Handle Application Outage with Checkpoints](/getting-started/use-cases/outbox/tutorial-4.md#step-9-handle-application-outage-with-checkpoints)**: Learn how checkpoints ensure event processing after system failures
2. **[Handle Transient Errors by Retrying Events](/getting-started/use-cases/outbox/tutorial-4.md#step-10-handle-transient-errors-by-retrying-events)**: Implement retry logic for temporary failures
3. **[Examine How Transient Errors are Handled in the Codebase](/getting-started/use-cases/outbox/tutorial-4.md#step-11-examine-how-transient-errors-are-handled-in-the-codebase)**: Understand the error handling implementation
4. **[Handle Permanent Errors by Skipping Events](/getting-started/use-cases/outbox/tutorial-4.md#step-12-handle-permanent-errors-by-skipping-events)**: Learn to handle unrecoverable errors by skipping problematic events
5. **[Examine How Permanent Errors are Handled in the Codebase](/getting-started/use-cases/outbox/tutorial-4.md#step-13-examine-how-permanent-errors-are-handled-in-the-codebase)**: Review the permanent error handling implementation
