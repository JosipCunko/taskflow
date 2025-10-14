/**
 * Hook for managing offline data caching
 * Automatically caches data when online and serves from cache when offline
 */

"use client";

import { useEffect, useState } from "react";
import { useOnlineStatus } from "./useOnlineStatus";
import {
  saveToOfflineStorage,
  getAllFromOfflineStorage,
  getFromOfflineStorage,
} from "../_utils/offlineStorage";

interface UseOfflineDataOptions<T> {
  storeName: string;
  onlineDataFetcher: () => Promise<T>;
  cacheKey?: string;
  indexName?: string;
  indexValue?: string;
  enabled?: boolean;
}

/**
 * Custom hook for managing offline-first data
 * Fetches from network when online, falls back to cache when offline
 */
export function useOfflineData<T>({
  storeName,
  onlineDataFetcher,
  cacheKey,
  indexName,
  indexValue,
  enabled = true,
}: UseOfflineDataOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        if (isOnline) {
          // Try to fetch fresh data from network
          try {
            const freshData = await onlineDataFetcher();
            setData(freshData);
            setIsFromCache(false);

            // Cache the fresh data
            if (freshData) {
              await saveToOfflineStorage(storeName, freshData);
            }
          } catch (fetchError) {
            // If network fetch fails, try to use cached data
            console.warn("Network fetch failed, trying cache:", fetchError);
            const cachedData = cacheKey
              ? await getFromOfflineStorage<T>(storeName, cacheKey)
              : await getAllFromOfflineStorage<T>(
                  storeName,
                  indexName,
                  indexValue
                );

            if (cachedData) {
              setData(cachedData as T);
              setIsFromCache(true);
            } else {
              throw fetchError;
            }
          }
        } else {
          // Offline - use cached data
          const cachedData = cacheKey
            ? await getFromOfflineStorage<T>(storeName, cacheKey)
            : await getAllFromOfflineStorage<T>(
                storeName,
                indexName,
                indexValue
              );

          if (cachedData) {
            setData(cachedData as T);
            setIsFromCache(true);
          } else {
            throw new Error("No cached data available while offline");
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch data")
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [
    isOnline,
    enabled,
    storeName,
    cacheKey,
    indexName,
    indexValue,
    onlineDataFetcher,
  ]);

  return { data, loading, error, isFromCache, isOnline };
}
