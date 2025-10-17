"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  const abortControllerRef = useRef<AbortController | null>(null);

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchData = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const currentController = abortControllerRef.current;

    try {
      setLoading(true);
      setError(null);

      if (isOnline) {
        // Try to fetch fresh data from network
        try {
          const freshData = await onlineDataFetcher();

          // Check if request was aborted
          if (currentController.signal.aborted) return;

          setData(freshData);
          setIsFromCache(false);

          // Cache the fresh data
          if (freshData) {
            await saveToOfflineStorage(storeName, freshData);
          }
        } catch (fetchError) {
          if (currentController.signal.aborted) return;

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
          : await getAllFromOfflineStorage<T>(storeName, indexName, indexValue);

        if (cachedData) {
          setData(cachedData as T);
          setIsFromCache(true);
        } else {
          throw new Error("No cached data available while offline");
        }
      }
    } catch (err) {
      // Check if request was aborted
      if (currentController.signal.aborted) return;

      setError(err instanceof Error ? err : new Error("Failed to fetch data"));
    } finally {
      // Check if request was aborted
      if (!currentController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [
    enabled,
    isOnline,
    storeName,
    cacheKey,
    indexName,
    indexValue,
    onlineDataFetcher,
  ]);

  useEffect(() => {
    fetchData();
    // Cleanup function to abort ongoing requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  return { data, loading, error, isFromCache, isOnline, refetch: fetchData };
}
