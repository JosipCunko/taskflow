import "server-only";
import { unstable_cache } from "next/cache";

export interface CacheConfig {
  tags: string[];
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

export const CacheTags = {
  user: (userId: string) => `user:${userId}`,
  users: () => "users",
  userTasks: (userId: string) => `tasks:user:${userId}`,
  tasks: () => "tasks",
  task: (taskId: string) => `task:${taskId}`,
  userNotes: (userId: string) => `notes:user:${userId}`,
  notes: () => "notes",
  userAchievements: (userId: string) => `achievements:user:${userId}`,
  userNotifications: (userId: string) => `notifications:user:${userId}`,
  userAnalytics: (userId: string) => `analytics:user:${userId}`,
  userGym: (userId: string) => `gym:user:${userId}`,
  userHealth: (userId: string) => `health:user:${userId}`,
  userActivity: (userId: string) => `activity:user:${userId}`,
};

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
