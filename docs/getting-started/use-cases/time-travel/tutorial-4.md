---
title: Part 4 - Time Travel with Pre-computed Read Model 
---

# Part 4: Time Travel with Pre-computed Read Model

In the previous part, the projection generated and stored a read model of the month end sales report that only showed its latest state.

In this part, you will modify the projection to also record historical snapshots of the report. This will allow you to time travel to previous states of the report.

![Time Traveling Report](./images/time-travel-report.gif)

## Step 8: Add Time Traveling Support to Report Projection 

In this step, you will modify the projection so that the read model includes sales data for every day of the month, not just the most recent day.

For example, the read model will look like this:
   
```json
{
	"checkpoint": 42,
	"salesReports": {
		"2025-01-31": {
			"categorySalesReports": {
				"Electronics": {
					"regionSalesReports": {
						"Asia": {
							"dailySales": 5200.25,
							"targetSales": 6000.00,
							"totalMonthlySales": 60200.90,
							"targetHitRate": 86.71
						}
					}
				}
			}
		},    
		"2025-01-30": {
			"categorySalesReports": {
				"Electronics": {
					"regionSalesReports": {
						"Asia": {
							"dailySales": 5000.50,
							"targetSales": 6000.00,
							"totalMonthlySales": 55000.75,
							"targetHitRate": 83.34
						}
					}
				}
			}
		}
      // Capture state of the read model for rest of the month
      // "2025-01-29": {}
      // "2025-01-28": {}
	}
}
```

::: info Read Model is not Required for Time Traveling
Notice how the read model is once again denormalized with all sales figure precalculated ahead of time. This is done to increase performance and load time when the sales report is rendered.

However, time travelling does not required a denormalized read model and you can choose few other ways to implement it. For example:
- Provide a more normalized read model that say, only contains the events through out the month
- Instead of providing a read model that is saved to disk, supply an sales report API instead that will construct the report on demand

Which approach you choose depends on your requirements and what you and your team are comfortable with.
:::

1. Run this command in the terminal to stop the projection app:

   ```sh
   ./scripts/stop-app.sh
   ```

2. Run this command in the terminal to delete the existing read model:

   ```sh
   rm ./data/report-read-model.json
   ```

   ::: info Is it Safe to Delete Read Models?
   It is generally safe to delete read models because they are not the source of truth; they are materialized views derived from replaying events stored in the event store. As long as you retain all historical events, you can always rebuild any deleted read model by replaying those events. However, ensure that no unique or irreproducible data is stored only in your read models, and be aware that rebuilding can be time-consuming if your event store is very large. 
   :::

3. Run this command in the terminal to open the report projection code file:

   ```sh
   code ./ReportProjection/ReportProjection.cs
   ```

4. Implement the empty `ProjectToMonthEndReportSnapshots()` method.

   ::: tip
   You should be able to achieve this by using the variables and methods found in the file such as:
   - orderDate
   - finalDayOfTheMonth
   - ProjectToMonthlySales()
   - ProjectToDailySales()

   You should also be able to do so without modifying any
   other method or classes in this project.
   :::

   :::: tip Solution to the Problem
   You can find the solution to the problem below, or in the file:

    `./ReportProjection/SolutionToProjectToMonthEndReportSnapshots.txt`

   ::: details Expand to see the solution
   ```cs
            void ProjectToMonthEndReportSnapshots()
            {
               for (var i = orderDate.Day; i <= finalDayOfTheMonth.Day - 1; i++)   // For each subsequent day in the month after the order date
               {
                  var snapShotDate = new DateOnly(orderDate.Year,
                     orderDate.Month, i);

                  ProjectToMonthlySales(snapShotDate);                            // Project the monthly sales to a snapshot of the report
               }

               if (orderDate != finalDayOfTheMonth)                                // Don't project daily sales if the order date
               {                                                                   // is the final day of the month
                  ProjectToDailySales(orderDate);                                 // since it is already projected
               }                                                                   // by ProjectToMonthEndReport
            }
   ```
   :::
   ::::

5. Run this command in the terminal to start the projection app:

   ```sh
   ./scripts/start-app.sh
   ```

6. Run this command in the terminal to display the log (in follow mode) to check if the app ran properly:

   ```sh
   docker compose --profile app logs -f
   ```

   Within a few seconds, you should see many messages that indicate the read model is being updated:

   ```
   reportprojection  | Projected event #XXX order-placed
   ```

7. Press `ctrl + c` to exit follow mode.

8. Run this command in the terminal to check the resulting read model:

   ```sh
   code ./data/report-read-model.json
   ```

9. Run this command in the terminal to check if it matches the expected read model:
   
   ```sh
   code ./data/report-read-model-expected.json
   ```

10. Repeat 1. to 9. until the results match


## Step 9: Explore Time Traveling Capability in the Report Web Application

1. Run this command in the terminal to start the sales report web application:
   
   ```sh
   ./scripts/start-web.sh
   ```

   You will receive a message, like below, printed in the terminal:

   ```
   All apps are running.

   URL to Demo Web Application 👉 http://XXXXXXXX
   ```

2. Copy the URL printed in the terminal and navigate to it in a browser.

   The page shows a snapshot of the month end report for a particular day.

3. Move the slider at the top to show snapshots of the report for different days.