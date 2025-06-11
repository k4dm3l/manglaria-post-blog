import { useState, useEffect, useCallback } from 'react';
import { ApiResponse } from '@/types/api';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

interface UseFetchOptions {
  cacheTime?: number; // Time in milliseconds to cache the data
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
}

const cache = new Map<string, CacheItem<any>>();

export function useFetch<T>(
  url: string,
  options: UseFetchOptions = {}
) {
  const {
    cacheTime = 5 * 60 * 1000, // 5 minutes default cache time
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const cachedData = cache.get(url);
      const now = Date.now();

      if (cachedData && now - cachedData.timestamp < cacheTime) {
        setData(cachedData.data);
        setIsLoading(false);
        return;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: ApiResponse<T> = await response.json();

      if (result.success && result.data) {
        cache.set(url, { data: result.data, timestamp: now });
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [url, cacheTime]);

  useEffect(() => {
    fetchData();

    if (revalidateOnFocus) {
      window.addEventListener('focus', fetchData);
    }
    if (revalidateOnReconnect) {
      window.addEventListener('online', fetchData);
    }

    return () => {
      if (revalidateOnFocus) {
        window.removeEventListener('focus', fetchData);
      }
      if (revalidateOnReconnect) {
        window.removeEventListener('online', fetchData);
      }
    };
  }, [fetchData, revalidateOnFocus, revalidateOnReconnect]);

  return { data, error, isLoading, refetch: fetchData };
} 