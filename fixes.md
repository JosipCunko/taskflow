# Fixes and bugs

caching - buggy unstable_cache to getTasksByUserId

sometimes i get task.dueDate.getHours is not a function

Read files that are edited, use git to identify. Those files are specific for analytics and then proceed with the these fixes:

duration or engagement_time_msec is set to 0 in analyticstracker. We need to store actual minutes. Seconds are precise enough too. Figure out what to do for that.

startUserSession, updateUserSession, and endUserSession:
Currently only defined in analytics-admin.ts but not directly called elsewhere (likely used through client-side wrappers in analytics.client.ts)
We need to use them to correctly shown correct analytics.

What does this function do to analytics: setUserAnalyticsProperties from @analytics.ts? Should I place more properties to it and where is it being used in the code? Extend it if it matters for the analytics

We are still giving some placeholder data in the getAnalyticsData function from analytics-admin. You need to replace that with actual important data.
Data that you cant calculate, you can delete it. For example, pointsGrowth you can calculate, but mostProductiveHour can be difficult, so if you cant calc it delete it and dont show anything to the /webapp page.
return {
sessionDuration: avgSessionDuration || 1247,
pageViews: totalPageViews || 45,
activeTime: totalActiveTime || 892,
dailyTaskCompletions: dailyTaskCompletions.some((d) => d > 0)
? dailyTaskCompletions
: [3, 5, 2, 7, 4, 6, 8],
weeklyTaskTrends: [23, 28, 31, 25],
mostProductiveHour: 10,
averageCompletionTime: 125,
streakHistory: [1, 2, 3, 4, 5, 6, 7],
pointsGrowth: [100, 125, 140, 165, 180, 205, 225],
featureUsage: Object.keys(defaultFeatureUsage).some(
(k) => defaultFeatureUsage[k as keyof typeof defaultFeatureUsage] > 0
)
? defaultFeatureUsage
: { tasks: 85, calendar: 23, notes: 12, inbox: 34, profile: 8 },
completionRateHistory: [78, 82, 75, 88, 85, 90, 87],
consistencyScore: 92,
productivityScore: 85,
};

# Todos for me

review dashboard page
