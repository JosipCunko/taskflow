import "server-only";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { after } from "next/server";

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
  userFitness: (userId: string) => `fitness:user:${userId}`,
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
   * Tasks are not stored in the Next.js Data Cache.
   * They change from server actions, other devices, and daily repeating-task
   * resets during auth — a cross-request cache goes stale immediately.
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
   * Fitness/Health data - changes moderately
   * 3 minutes revalidation
   */
  FITNESS_HEALTH: 180,
} as const;

const TASK_PAGES = [
  "/webapp",
  "/webapp/tasks",
  "/webapp/today",
  "/webapp/calendar",
  "/webapp/completed",
  "/webapp/inbox",
] as const;

export type TaskRevalidateOptions = {
  taskId?: string;
  includeUser?: boolean;
  includeActivity?: boolean;
};

/**
 * Invalidate every surface that shows tasks: data tags, the webapp layout
 * (search/sidebar), and each task-related page — including the dashboard.
 */
export function revalidateTaskData(
  userId: string,
  options?: TaskRevalidateOptions,
) {
  revalidateTag(CacheTags.tasks());
  revalidateTag(CacheTags.userTasks(userId));
  if (options?.taskId) {
    revalidateTag(CacheTags.task(options.taskId));
  }
  if (options?.includeUser) {
    revalidateTag(CacheTags.user(userId));
  }
  if (options?.includeActivity) {
    revalidateTag(CacheTags.userActivity(userId));
  }

  revalidatePath("/webapp", "layout");
  for (const path of TASK_PAGES) {
    revalidatePath(path);
  }
}

/**
 * Same as revalidateTaskData, but runs after the response is sent.
 * Use this from auth/JWT or other code that runs during render —
 * revalidateTag/revalidatePath throw "used during render" in that context.
 */
export function scheduleTaskRevalidation(
  userId: string,
  options?: TaskRevalidateOptions,
) {
  try {
    after(() => {
      revalidateTaskData(userId, options);
    });
  } catch (error) {
    console.error("Could not schedule task revalidation:", error);
  }
}
