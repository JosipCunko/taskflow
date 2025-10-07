import "server-only";
import { unstable_cache } from "next/cache";

/**
 * Server-side cache utility for Next.js 15
 * 
 * This provides smart caching for expensive server-side operations like Firestore queries.
 * Uses Next.js's unstable_cache with tags for granular cache invalidation.
 */

export interface CacheConfig {
  /**
   * Cache tags for invalidation
   */
  tags: string[];
  /**
   * Cache revalidation time in seconds (default: no time-based revalidation)
   */
  revalidate?: number;
}

/**
 * Creates a cached version of a function with smart revalidation
 * 
 * @param fn - The async function to cache
 * @param keyParts - Array of strings to create a unique cache key
 * @param config - Cache configuration with tags and optional revalidation time
 * @returns Cached version of the function
 * 
 * @example
 * ```ts
 * const getCachedUser = cachedFunction(
 *   async (userId: string) => fetchUserFromDb(userId),
 *   ['user'],
 *   { tags: ['users'], revalidate: 300 } // 5 minutes
 * );
 * ```
 */
export function cachedFunction<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  keyParts: string[],
  config: CacheConfig
) {
  return unstable_cache(fn, keyParts, {
    tags: config.tags,
    revalidate: config.revalidate,
  });
}

/**
 * Cache tag generators for consistent tagging across the app
 */
export const CacheTags = {
  /**
   * User-specific cache tag
   */
  user: (userId: string) => `user:${userId}`,
  
  /**
   * All users cache tag
   */
  users: () => 'users',
  
  /**
   * User's tasks cache tag
   */
  userTasks: (userId: string) => `tasks:user:${userId}`,
  
  /**
   * All tasks cache tag
   */
  tasks: () => 'tasks',
  
  /**
   * Specific task cache tag
   */
  task: (taskId: string) => `task:${taskId}`,
  
  /**
   * User's notes cache tag
   */
  userNotes: (userId: string) => `notes:user:${userId}`,
  
  /**
   * All notes cache tag
   */
  notes: () => 'notes',
  
  /**
   * User's achievements cache tag
   */
  userAchievements: (userId: string) => `achievements:user:${userId}`,
  
  /**
   * User's notifications cache tag
   */
  userNotifications: (userId: string) => `notifications:user:${userId}`,
  
  /**
   * User's analytics cache tag
   */
  userAnalytics: (userId: string) => `analytics:user:${userId}`,
  
  /**
   * User's gym data cache tag
   */
  userGym: (userId: string) => `gym:user:${userId}`,
  
  /**
   * User's health data cache tag
   */
  userHealth: (userId: string) => `health:user:${userId}`,
};

/**
 * Cache duration constants (in seconds)
 * 
 * These provide smart defaults for different types of data:
 * - USER_DATA: 5 minutes - User profile data changes infrequently
 * - TASKS: On-demand only - Tasks change frequently, use tag-based invalidation
 * - ANALYTICS: 10 minutes - Analytics can tolerate slight staleness
 * - NOTIFICATIONS: On-demand only - Must be fresh
 */
export const CacheDuration = {
  /**
   * User profile data - rarely changes
   * 5 minutes time-based revalidation as a safety net
   */
  USER_DATA: 300,
  
  /**
   * Tasks - no time-based revalidation, only tag-based
   * undefined = cache indefinitely until revalidateTag is called
   */
  TASKS: undefined,
  
  /**
   * Analytics data - can tolerate some staleness
   * 10 minutes revalidation
   */
  ANALYTICS: 600,
  
  /**
   * Notifications - must be fresh, use tag-based only
   */
  NOTIFICATIONS: undefined,
  
  /**
   * Notes - rarely change, but must be accurate
   * 5 minutes revalidation
   */
  NOTES: 300,
  
  /**
   * Achievements - rarely change
   * 5 minutes revalidation
   */
  ACHIEVEMENTS: 300,
  
  /**
   * Gym/Health data - changes moderately
   * 3 minutes revalidation
   */
  GYM_HEALTH: 180,
} as const;