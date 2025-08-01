/**
 *
 * @param cacheKey
 * @param revalidateTime - in minutes
 * @param serverUrl
 * @param stateSetterFn - Sets data.data to state
 * @param stateDefault - Default state which is set in case of error
 * @param loadingStateSetterFn - Optional: Sets loading state
 * @param notificationErrorFn - Optional: Notification function in case of error
 */
export function clientCache<T>(
  cacheKey: string,
  revalidateTime: number,
  serverUrl: string,
  stateSetterFn: (state: T) => void,
  stateDefault: T,
  loadingStateSetterFn?: (state: boolean) => void,
  notificationErrorFn?: (message: string) => void
) {
  async function cache() {
    const cachedData = sessionStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        const cacheTime = sessionStorage.getItem(`${cacheKey}Time`);
        const now = Date.now();

        if (
          cacheTime &&
          now - parseInt(cacheTime) < revalidateTime * 60 * 1000
        ) {
          stateSetterFn(parsed);
          return;
        }
      } catch (error) {
        console.error("Error parsing cached data:", error);
      }
    }
    loadingStateSetterFn?.(true);
    try {
      const response = await fetch(serverUrl, {
        headers: {
          "Cache-Control": `max-age=${revalidateTime * 60}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch in the client cache");
      }
      const data = await response.json();
      sessionStorage.setItem(cacheKey, JSON.stringify(data.data));
      sessionStorage.setItem(`${cacheKey}Time`, Date.now().toString());
      stateSetterFn(data.data as T);
    } catch (error) {
      console.error("Error fetching data:", error);
      notificationErrorFn?.("Failed to load from the client cache");
      stateSetterFn(stateDefault);
    } finally {
      loadingStateSetterFn?.(false);
    }
  }

  return {
    cache,
    invalidateCache: () => {
      sessionStorage.removeItem(cacheKey);
      sessionStorage.removeItem(`${cacheKey}Time`);
    },
  };
}
