---
title: Mix-and-Match Database Tutorial Introduction
prev: ./introduction.md
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

### [Part 1: Setup and Initialize KurrentDB](/getting-started/use-cases/mix-and-match-database/tutorial-1.md)
1. **[Set up your Codespaces](/getting-started/use-cases/mix-and-match-database/tutorial-1.md#step-1-set-up-your-codespaces)**: Starts up an interactive coding environment in your browser where all tools and database are installed
2. **[Start and Initialize KurrentDB with Sample Events](/getting-started/use-cases/mix-and-match-database/tutorial-1.md#step-2-start-and-initialize-kurrentdb-with-sample-events)**: Start up KurrentDB and initialize it with sample events
3. **[Browse the Sample Events in KurrentDB's Admin UI](/getting-started/use-cases/mix-and-match-database/tutorial-1.md#step-3-browse-sample-events-in-kurrentdb-s-admin-ui)**: Access the Admin UI to browse the appended events
### [Part 2: Project KurrentDB Events to Postgres](/getting-started/use-cases/mix-and-match-database/tutorial-2.md) 
4. **[Execute Projection Applications](/getting-started/use-cases/mix-and-match-database/tutorial-2.md#step-4-execute-projection-application)**: Starts up the projection sample applications that transform KurrentDB events into read models in Postgres and Redis
5. **[Review the Projected Read Models in Postgres](/getting-started/use-cases/mix-and-match-database/tutorial-2.md#step-5-review-the-projected-read-models-in-postgres)**: Run the PostgreSQL command line tool to review the newly inserted records
6. **[Examine the Postgres Projection Application Codebase](/getting-started/use-cases/mix-and-match-database/tutorial-2.md#step-6-examine-the-postgres-projection-application-codebase)**: Examine the PostgreSQL projection application codebase to see how events are transformed to read models in the tables
### [Part 3: Project KurrentDB Events to Redis](/getting-started/use-cases/mix-and-match-database/tutorial-3.md) 
7. **[Review the Projected Read Models in Redis](/getting-started/use-cases/mix-and-match-database/tutorial-3.md#step-7-review-the-projected-read-models-in-redis)**: Run the Redis command line tool to review the newly added entries
8. **[Examine the Redis Projection Application Codebase](/getting-started/use-cases/mix-and-match-database/tutorial-3.md#step-8-examine-the-redis-projection-application-codebase)**: Examine the Redis projection application codebase to see how events are transformed into read models in Redis
### [Part 4: Project KurrentDB Events in Real-Time](/getting-started/use-cases/mix-and-match-database/tutorial-4.md)
9. **[Browse the Demo Web Page](/getting-started/use-cases/mix-and-match-database/tutorial-4.md#step-9-browse-the-demo-web-page)**: Navigate to the Demo Web Page to see a sample of how the read models in Postgres and Redis are used
10. **[Start the Live Data Generator](/getting-started/use-cases/mix-and-match-database/tutorial-4.md#step-10-start-the-live-data-generator)**: Start a live data generator program that continuously appends events into KurrentDB
11. **[Watch the Read Models Update in Real-Time](/getting-started/use-cases/mix-and-match-database/tutorial-4.md#step-11-watch-the-read-models-update-in-real-time)**: See how the read models are updated in real-time in the Demo Web Page
12. **[Understanding catch-up subscription and real-time processing](/getting-started/use-cases/mix-and-match-database/tutorial-4.md#step-12-understanding-catch-up-subscription-and-real-time-processing)**: Understand how the code projects events to the read models in real-time
