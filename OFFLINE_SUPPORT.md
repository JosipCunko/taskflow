# TaskFlow Offline Support Implementation

This document explains how offline functionality is implemented in TaskFlow using Service Workers, IndexedDB, and caching strategies.

## Overview

TaskFlow now supports robust offline functionality, allowing users to access most features even without an internet connection. The implementation uses a combination of:

- **Service Workers** for caching static assets and network interception
- **IndexedDB** for storing dynamic data locally
- **Cache-First & Network-First strategies** for optimal performance
- **Offline indicators** for clear user feedback

## Architecture

### 1. Service Worker (`public/sw.js`)

The Service Worker acts as a network proxy, intercepting all network requests and implementing intelligent caching strategies:

#### Caching Strategy:

- **Static Assets (Cache-First)**: JavaScript, CSS, images, and fonts are cached aggressively
  - Falls back to network if not in cache
  - Automatically caches new static assets
  
- **HTML Pages (Network-First)**: App pages try network first, fall back to cache
  - Ensures fresh content when online
  - Serves cached version when offline
  
- **API Calls (Network-First with Graceful Degradation)**: 
  - Attempts network request first
  - Returns offline error response when network fails
  - Allows app to handle offline state gracefully

#### Precached Resources:

The following pages are cached during Service Worker installation:
- `/` (Landing page)
- `/webapp` (Dashboard)
- `/webapp/tasks`, `/webapp/today`, `/webapp/notes`
- `/webapp/profile`, `/webapp/calendar`, `/webapp/completed`
- `/webapp/gym`, `/webapp/health`
- `/login`, `/offline`
- Essential assets (manifest, icons)

### 2. IndexedDB Storage (`app/_utils/offlineStorage.ts`)

IndexedDB provides persistent, structured storage for application data:

#### Object Stores:

- **tasks**: User tasks with indexes on `userId`, `status`, and `dueDate`
- **notes**: Personal notes indexed by `userId`
- **user**: User profile data
- **meals**: Nutrition logs indexed by `userId` and `date`
- **workouts**: Gym sessions indexed by `userId`
- **analytics**: Analytics data with timestamp index

#### Key Functions:

```typescript
// Save data to offline storage
await saveToOfflineStorage(STORES.TASKS, taskData);

// Retrieve data from storage
const tasks = await getAllFromOfflineStorage(STORES.TASKS, 'userId', userId);

// Get single item
const task = await getFromOfflineStorage(STORES.TASKS, taskId);

// Delete from storage
await deleteFromOfflineStorage(STORES.TASKS, taskId);
```

### 3. Offline Data Hook (`app/_hooks/useOfflineData.ts`)

A custom React hook that automatically manages data fetching with offline support:

```typescript
const { data, loading, error, isFromCache, isOnline } = useOfflineData({
  storeName: STORES.TASKS,
  onlineDataFetcher: fetchTasksFromAPI,
  indexName: 'userId',
  indexValue: userId,
  enabled: true
});
```

**Features:**
- Automatically fetches from network when online
- Falls back to cached data when offline
- Caches fresh data for future offline use
- Provides loading and error states
- Indicates when data is from cache

### 4. Offline Indicator (`app/_components/OfflineIndicator.tsx`)

Visual feedback component that shows:
- Yellow banner when offline with message about limited features
- Green banner when reconnecting with sync notification
- Automatically dismisses after 3 seconds when back online

### 5. Online Status Hook (`app/_hooks/useOnlineStatus.ts`)

Simple hook that monitors browser online/offline events:

```typescript
const isOnline = useOnlineStatus();
```

## What Works Offline

### ✅ Fully Functional Offline:
- **Viewing cached data**: Tasks, notes, workout history, meal logs
- **Navigation**: Between all main app pages
- **UI interactions**: All interface elements remain functional
- **Reading data**: Access to previously loaded data

### ⚠️ Limited Offline:
- **Creating new items**: Can be implemented with pending actions queue (future enhancement)
- **Updating data**: Local changes not synced until online
- **Deleting items**: Local deletions not synced until online

### ❌ Not Available Offline:
- **AI Assistant**: Requires API calls to AI providers
- **Real-time sync**: Changes from other devices won't appear
- **Authentication**: Login/signup requires network connection
- **USDA Food Search**: External API dependency
- **Analytics generation**: Requires server-side processing

## Implementation Details

### Cache Management

The Service Worker maintains three cache levels:

```javascript
const CACHE_NAME = "taskflow-cache-v2";        // Precached resources
const RUNTIME_CACHE = "taskflow-runtime-v2";   // Runtime HTML pages
const STATIC_CACHE = "taskflow-static-v2";     // Static assets (JS, CSS, images)
```

Old caches are automatically cleaned up during the activation phase.

### Cache Version Updates

To force cache refresh after updates:
1. Increment version number in `sw.js` (e.g., `v2` → `v3`)
2. Service Worker will automatically clean old caches
3. Users will be prompted to reload for the new version

### Network Resilience

The implementation handles various offline scenarios:

```javascript
// API calls return structured error when offline
{
  error: "offline",
  message: "You are currently offline"
}
```

This allows components to gracefully handle offline state and display appropriate messages.

## User Experience

### Offline Flow:

1. User goes offline
2. Yellow banner appears: "You're offline. Some features may be limited. Cached data is being used."
3. App continues to function with cached data
4. Features requiring network show appropriate messages
5. User comes back online
6. Green banner appears: "Back online! Syncing your data..."
7. Fresh data is fetched and cached

### First-Time Offline:

If a user goes offline before visiting a page:
- Precached pages are available immediately
- Other pages will show the offline page
- Previously visited pages are available from runtime cache

## Testing Offline Mode

### Chrome DevTools:

1. Open DevTools (F12)
2. Go to **Network** tab
3. Select **Offline** from throttling dropdown
4. Test app functionality

### Service Worker DevTools:

1. Go to **Application** tab → **Service Workers**
2. View active service worker
3. Test "Offline" checkbox
4. Clear storage if needed

### Cache Inspection:

1. Go to **Application** tab → **Cache Storage**
2. Inspect cached resources
3. View what's available offline

## Future Enhancements

### Planned Features:

- **Background Sync**: Queue actions when offline, sync when online
- **Push Notifications**: Offline notification queuing
- **Conflict Resolution**: Handle data conflicts from multiple devices
- **Selective Sync**: Let users choose what to cache
- **Storage Management**: Monitor and manage cache size
- **Offline Analytics**: Track offline usage patterns

## Troubleshooting

### Service Worker Not Registering:

- Check browser console for errors
- Ensure `sw.js` is in `/public` directory
- Verify HTTPS (required for Service Workers in production)
- Try unregistering and re-registering

### Cached Data Not Loading:

- Check IndexedDB in DevTools → Application → IndexedDB
- Verify data was cached when online
- Check for quota exceeded errors
- Try clearing storage and recaching

### Old Version Persisting:

- Clear all cache storage in DevTools
- Unregister service worker
- Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
- Increment service worker version

## Best Practices

### For Developers:

1. **Always cache read operations**: When fetching data, save to IndexedDB
2. **Handle offline gracefully**: Show appropriate messages, don't crash
3. **Test offline thoroughly**: Use DevTools offline mode
4. **Keep cache small**: Only cache essential data
5. **Version your caches**: Increment on breaking changes

### For Users:

1. **Visit pages online first**: Ensures they're cached
2. **Don't clear browser data**: Removes offline cache
3. **Update regularly**: Get latest offline improvements
4. **Report issues**: Help us improve offline support

## Technical Considerations

### Storage Limits:

- **IndexedDB**: Usually 50% of available disk space per origin
- **Cache Storage**: Similar to IndexedDB limits
- **Combined**: Browsers manage total storage quota

### Performance:

- Cache lookups are fast (< 1ms typically)
- IndexedDB operations are asynchronous
- Service Worker runs in separate thread
- Minimal performance overhead

### Browser Support:

- **Chrome/Edge**: Full support ✅
- **Firefox**: Full support ✅
- **Safari**: Full support ✅ (iOS 11.3+)
- **Opera**: Full support ✅

## Conclusion

TaskFlow's offline support provides a seamless experience even without internet connectivity. The combination of Service Workers and IndexedDB ensures users can access their data anytime, anywhere, with automatic synchronization when back online.

For questions or issues related to offline functionality, please open an issue on GitHub or contact support.

---

**Last Updated**: 2025-10-14  
**Version**: 2.0  
**Author**: TaskFlow Development Team
