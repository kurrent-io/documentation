---
title: Introduction
prev: ./introduction.md
---

# Introduction

This tutorial guides you through implementing time-travel capabilities in your applications using KurrentDB. You will learn how to reconstruct and query the state of your system at any point in history, an essential feature for auditing to understand data evolution.

## Objectives

In this tutorial, you will:

- Learn the principles of time-traveling in event-native applications  
- Project events into read models for sales reporting
- Enable time-travel by recording and querying historical states
- Explore both snapshot-based and on-demand time-travel approaches
- Discover interactive interfaces to visualize historical data
- Audit the lineage of data changes

## Prerequisites

Before starting, ensure you have the following:

- A GitHub account to use GitHub Codespaces
- Basic knowledge of C#
- Familiarity with command-line operations

## Tutorial Overview

This tutorial consists of the following steps:

### [Part 1: Set up Codespaces](/getting-started/use-cases/time-travel/tutorial-1.md)
1. **[Set up your Codespaces](/getting-started/use-cases/time-travel/tutorial-1.md#step-1-set-up-your-codespaces)**: Start an interactive coding environment in your browser where all tools and databases are installed.

### [Part 2: Initialize KurrentDB with Sample Orders](/getting-started/use-cases/time-travel/tutorial-2.md)
2. **[Start Databases and Append OrderPlaced Events](/getting-started/use-cases/time-travel/tutorial-2.md#step-2-start-databases-and-append-orderplaced-event-to-kurrentdb)**: Start KurrentDB and append sample order events for use in reporting.
3. **[Browse OrderPlaced Events in KurrentDB's Admin UI](/getting-started/use-cases/time-travel/tutorial-2.md#step-3-browse-orderplaced-events-in-kurrentdb-s-admin-ui)**: Explore the event streams in the Admin UI.

### [Part 3: Project Events to Sales Report Read Model](/getting-started/use-cases/time-travel/tutorial-3.md)
4. **[Start the Report Projection Application](/getting-started/use-cases/time-travel/tutorial-3.md#step-4-start-the-report-projection-application)**: Start the app that listens for `OrderPlaced` events and builds a denormalized JSON sales report read model.
5. **[Start and Browse the Report Web Application](/getting-started/use-cases/time-travel/tutorial-3.md#step-5-start-and-browse-the-report-web-application)**: Open the web app to view the sales report generated from the read model.
6. **[Examine the Report Projection Application](/getting-started/use-cases/time-travel/tutorial-3.md#step-6-examine-the-report-projection-application)**: Review how the projection app loads, updates, and saves the read model in response to events.
7. **[Examine the Report Projection Logic](/getting-started/use-cases/time-travel/tutorial-3.md#step-7-examine-the-report-projection-logic)**: Explore how the projection logic transforms order events into the month-end sales report.

### [Part 4: Time Travel with Pre-computed Read Models](/getting-started/use-cases/time-travel/tutorial-4.md)
8. **[Add Time-Travel Support to the Sales Report Projection](/getting-started/use-cases/time-travel/tutorial-4.md#step-8-add-time-travel-support-to-sales-report-projection)**: Modify the projection so the read model records sales data for every day of the month, enabling time-travel queries.
9. **[Explore Time Travel Capabilities in the Report Web Application](/getting-started/use-cases/time-travel/tutorial-4.md#step-9-explore-time-travel-capability-in-the-report-web-application)**: Use the web app's time slider to view historical snapshots of the sales report for any day.

### [Part 5: Time Travel with On-demand Event Replay](/getting-started/use-cases/time-travel/tutorial-5.md)
10. **[Discover the Auditing Capabilities in the Report Web Application](/getting-started/use-cases/time-travel/tutorial-5.md#step-10-discover-the-auditing-capabilities-in-the-report-web-application)**: Use the web app to audit and reconstruct the sales report state at any point in time by replaying events on demand.
11. **[Examine the Event Audit API](/getting-started/use-cases/time-travel/tutorial-5.md#step-11-examine-the-event-audit-api)**: Review how the API reads and filters events from the event store to support on-demand time-travel and auditing.