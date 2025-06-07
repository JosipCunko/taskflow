# Advanced Notification System for TaskFlow

## Overview

The TaskFlow notification system provides intelligent, contextual alerts to help users stay on top of their tasks and maintain productivity. The system automatically generates notifications based on task behavior, deadlines, and user patterns.

## Features

### 🔔 Smart Notification Types

1. **Task at Risk** - Repeating tasks that have been delayed multiple times
2. **Task Overdue** - Tasks that are past their due date
3. **Task Due Soon** - Tasks due within the next 24 hours
4. **Streak at Risk** - When user's consistency streak is about to be broken
5. **Streak Milestone** - Achievement of new streak milestones
6. **Priority Task Pending** - High-priority tasks that need attention
7. **Achievement Unlocked** - New achievements and milestones
8. **Weekly Summary** - Performance summaries and insights
9. **Task Reminder** - General task reminders
10. **Consistency Alert** - When task completion consistency drops
11. **Points Milestone** - Reward points milestones reached
12. **System Update** - Important system announcements

### 📊 Priority Levels

- **URGENT** - Critical tasks requiring immediate attention
- **HIGH** - Important tasks that should be addressed soon
- **MEDIUM** - Standard notifications
- **LOW** - Informational notifications

### 🎯 Key Components

#### Notification Bell (`NotificationBell.tsx`)

- Real-time notification count display
- Color-coded priority indicators
- Animated badges for urgent notifications
- Direct link to inbox

#### Notification Card (`NotificationCard.tsx`)

- Rich notification display with icons and styling
- Action buttons (mark as read, archive, delete)
- Priority badges and timestamps
- Click-to-navigate functionality

#### Inbox Page (`/webapp/inbox`)

- Comprehensive notification management
- Filtering by type, priority, and read status
- Search functionality
- Bulk actions (mark all as read)
- Real-time updates

#### Dashboard Integration

- Notification summary widget
- Priority alert highlights
- Quick access to inbox

## Technical Implementation

### Database Schema

```typescript
interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  taskId?: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: Date;
  readAt?: Date;
  data?: Record<string, unknown>;
  expiresAt?: Date;
}
```

### Notification Generation Logic

The system automatically generates notifications based on:

1. **Task Status Changes** - When tasks are completed, delayed, or updated
2. **Time-based Triggers** - Daily checks for overdue and due-soon tasks
3. **Pattern Recognition** - Identifying at-risk tasks based on delay patterns
4. **Achievement Detection** - Milestone and streak achievements

### Server Actions

- `markAsReadAction` - Mark individual notifications as read
- `markAllAsReadAction` - Bulk mark notifications as read
- `archiveNotificationAction` - Archive notifications
- `deleteNotificationAction` - Delete notifications
- `generateNotificationsAction` - Trigger notification generation

### Automatic Generation

Notifications are automatically generated:

- When users visit the inbox page
- When tasks are created, updated, or completed
- When users interact with the dashboard

## Usage Examples

### Creating Custom Notifications

```typescript
import { createNotification } from "@/app/_lib/notifications";

await createNotification({
  userId: "user123",
  type: "TASK_OVERDUE",
  priority: "HIGH",
  title: "⏰ Task Overdue",
  message: 'Your task "Complete project" is 2 days overdue',
  actionText: "Complete Now",
  actionUrl: "/webapp/tasks/task123",
  taskId: "task123",
  expiresAt: addDays(new Date(), 7),
});
```

### Generating Notifications for User

```typescript
import { generateNotificationsForUser } from "@/app/_lib/notifications";
import { getTasksByUserId } from "@/app/_lib/tasks";

const tasks = await getTasksByUserId(userId);
await generateNotificationsForUser(userId, tasks);
```

### Getting Notification Statistics

```typescript
import { getNotificationStats } from "@/app/_lib/notifications";

const stats = await getNotificationStats(userId);
console.log(`User has ${stats.totalUnread} unread notifications`);
```

## How It Works

The notification system works automatically without any external setup:

1. **Real-time Generation**: Notifications are created immediately when tasks are modified
2. **On-demand Updates**: When users visit the inbox, fresh notifications are generated
3. **Smart Cleanup**: Expired notifications are automatically removed
4. **No External Dependencies**: Everything runs within your Next.js application

## Notification Rules

### Task at Risk Detection

- Triggered when a repeating task has `delayCount >= 3`
- Priority: HIGH
- Expires: 7 days

### Overdue Task Detection

- Triggered when task due date is in the past
- Priority: Based on task priority and days overdue
- Expires: 14 days

### Due Soon Detection

- Triggered when task is due within 24 hours
- Priority: HIGH for priority tasks, MEDIUM for others
- Expires: 1 day after due date

## Customization

### Adding New Notification Types

1. Add the new type to `NotificationType` in `types.ts`
2. Add icon mapping in `getNotificationIcon()` in `utils.ts`
3. Add label mapping in `getNotificationTypeLabel()` in `utils.ts`
4. Implement generation logic in `notifications.ts`

### Styling Customization

Notification styling is controlled through:

- `getNotificationStyles()` - Priority-based styling
- `getPriorityBadgeStyles()` - Priority badge styling
- Tailwind CSS classes in components

## Performance Considerations

### Optimization Strategies

1. **Pagination** - Limit notifications fetched per request
2. **Expiration** - Automatic cleanup of expired notifications
3. **Indexing** - Firestore indexes on userId, createdAt, isRead
4. **Caching** - Client-side caching of notification stats
5. **Batching** - Bulk operations for marking as read

### Firestore Indexes

Recommended indexes:

```
Collection: notifications
- userId (Ascending), createdAt (Descending)
- userId (Ascending), isRead (Ascending), createdAt (Descending)
- userId (Ascending), isArchived (Ascending), createdAt (Descending)
- expiresAt (Ascending)
```

## Future Enhancements

### Planned Features

1. **Email Notifications** - Send notifications via email
2. **Push Notifications** - Browser push notifications
3. **Notification Settings** - User preferences for notification types
4. **Quiet Hours** - Respect user's quiet time preferences
5. **Smart Grouping** - Group related notifications
6. **AI-Powered Insights** - Intelligent notification prioritization

### Integration Ideas

1. **Calendar Integration** - Sync with external calendars
2. **Slack/Discord Bots** - Send notifications to team channels
3. **Mobile App** - Native mobile notifications
4. **Webhook Support** - External system integrations

## Troubleshooting

### Common Issues

1. **Notifications not generating**

   - Check if user has tasks
   - Verify notification generation is called after task operations
   - Check Firebase permissions

2. **Performance issues**

   - Implement pagination for large notification lists
   - Add proper Firestore indexes
   - Consider notification archiving strategy

3. **Missing notifications**
   - Check expiration dates
   - Verify notification generation logic
   - Check user permissions

### Debug Tools

```typescript
// Enable debug logging
console.log("Generating notifications for user:", userId);
console.log("Tasks to process:", tasks.length);
console.log("Generated notifications:", notifications.length);
```

## Security Considerations

1. **User Isolation** - Notifications are strictly user-scoped
2. **Authentication** - All operations require valid session
3. **Authorization** - Users can only access their own notifications
4. **Rate Limiting** - Consider implementing rate limits for API endpoints
5. **Data Validation** - Validate all notification data before storage

## Monitoring & Analytics

### Key Metrics to Track

1. **Notification Engagement**

   - Open rates
   - Click-through rates
   - Time to action

2. **System Performance**

   - Generation time
   - Delivery success rate
   - Error rates

3. **User Behavior**
   - Most effective notification types
   - Optimal timing for notifications
   - User preferences

This notification system provides a solid foundation for keeping users engaged and productive while being extensible for future enhancements.
