---
title: Summary
---

In this tutorial, you’ve explored how KurrentDB enables robust time-travel capabilities by leveraging its event-driven architecture. Time-travel allows you to reconstruct and query the state of your system at any point in history—an essential feature for auditing, debugging, and understanding how your data evolves. Through hands-on exercises, you learned how to implement both snapshot-based and on-demand time-travel using KurrentDB.

Here are the key takeaways:

* **Understand Time-Travel in Event-Sourced Systems**  
  By storing every change as an immutable event, KurrentDB makes it possible to rebuild the state of your application as it existed at any moment in the past.

* **Implement Snapshot-Based Time-Travel**  
  You created projections that periodically store snapshots of your data, enabling fast queries for historical states without replaying all events from the beginning.

* **Enable On-Demand State Reconstruction**  
  You examined APIs that can replay events up to a specific point in time, reconstructing the exact state as it was, even if no snapshot exists for that moment.

* **Balance Performance and Accuracy**  
  You learned when to use pre-computed snapshots for performance and when to use on-demand event replay for the most accurate, up-to-date historical views.

* **Filter and Process Events Efficiently**  
  Your solution filters events by relevant criteria (such as date or entity) and processes only what’s needed to reconstruct the requested state.

* **Build Interactive Time-Travel Interfaces**  
  You implemented a UI that lets users “travel” through time, visualizing how data changed by selecting different historical points.

* **Audit and Trace Data Lineage**  
  You enabled users to trace which events contributed to a particular state, providing transparency and accountability for every data change.

By using KurrentDB’s event storage and processing features, you’ve built a powerful, flexible time-travel system that delivers deep insight into your data’s history while maintaining simplicity and performance.