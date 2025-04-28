---
title: Introduction
---

# Introduction

This tutorial will guide you through the Mix-and-Match Database sample with KurrentDB using GitHub Codespaces.

## Objectives

In this tutorial, you will:

- Learn how to project events from KurrentDB into read models in different databases
- Experience how to update read models catch-up subscription and checkpoints
- Understand how to update read models in real time

## Prerequisites

Before starting, ensure you have the following:

- A GitHub account to use GitHub Codespaces
- Basic knowledge of one of the development languages/platforms below
- Familiarity with command-line operations

## Tutorial Overview

This tutorial consists of the following steps:

### [Part 1: Setup and Initialize KurrentDB](./tutorial-1.md)
1. **[Setup your Codespaces](./tutorial-1.html#step-1-setup-your-codespaces)**: Starts up an interactive coding environment in your browser where all tools and database are installed
2. **[Start and Initialize KurrentDB with Sample Events](./tutorial-1.html#step-2-start-and-initialize-kurrentdb-with-sample-events)**: Start up KurrentDB and initialize it with sample events
3. **[Browse the Sample Events in KurrentDB's Admin UI](./tutorial-1.html#step-3-browse-sample-events-in-kurrentdb-s-admin-ui)**: Access the Admin UI to browse the appended events
### [Part 2: Project KurrentDB Events to Postgres](./tutorial-2.md) 
4. **[Execute Projection Applications](./tutorial-2.html#step-4-execute-projection-application)**: Starts up the projection sample applications that transform KurrentDB events into read models in Postgres and Redis
5. **[Review the Projected Read Models in Postgres](./tutorial-2.html#step-5-review-the-projected-read-models-in-postgres)**: Run the PostgreSQL command line tool to review the newly inserted records
6. **[Examine the Postgres Projection Application Codebase](./tutorial-2.html#step-6-examine-the-postgres-projection-application-codebase)**: Examine the PostgreSQL projection application codebase to see how events are transformed to read models in the tables
### [Part 3: Project KurrentDB Events to Redis](./tutorial-3.md) 
7. **[Review the Projected Read Models in Redis](./tutorial-3.html#step-7-review-the-projected-read-models-in-redis)**: Run the Redis command line tool to review the newly added entries
8. **[Examine the Redis Projection Application Codebase](./tutorial-3.html#step-8-examine-the-redis-projection-application-codebase)**: Examine the Redis projection application codebase to see how events are transformed into read models in Redis
### [Part 4: Project KurrentDB Events in Real-Time](./tutorial-4.md)
9. **[Browse the Demo Web Page](./tutorial-4.html#step-9-browse-the-demo-web-page)**: Navigate to the Demo Web Page to see a sample of how the read models in Postgres and Redis are used
10. **[Start the Live Data Generator](./tutorial-4.html#step-10-start-the-live-data-generator)**: Start a live data generator program that continuously appends events into KurrentDB
11. **[Watch the Read Models Update in Real-Time](./tutorial-4.html#step-11-watch-the-read-models-update-in-real-time)**: See how the read models are updated in real-time in the Demo Web Page
12. **[Understanding catch-up subscription and real-time processing](./tutorial-4.html#step-12-understanding-catch-up-subscription-and-real-time-processing)**: Understand how the code projects events to the read models in real-time
