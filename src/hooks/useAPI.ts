/**
 * Generic API Data Fetching Hook
 * Manages loading, error, and data states automatically
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiError } from '../services/apiClient';

export interface UseAPIOptions<T> {
  dependencies?: any[];
  enabled?: boolean;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
  cacheTime?: number;
  retry?: number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

export interface UseAPIResult<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
  isStale: boolean;
  lastFetchedAt: number | null;
}

// Simple cache implementation
class QueryCache {
  private cache = new Map<string, {
    data: any;
    timestamp: number;
    staleTime: number;
  }>();

  set(key: string, data: any, staleTime: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      staleTime,
    });
  }

  get(key: string): { data: any; isStale: boolean } | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isStale = Date.now() - cached.timestamp > cached.staleTime;
    return {
      data: cached.data,
      isStale,
    };
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

const queryCache = new QueryCache();

export function useAPI<T>(
  queryFn: () => Promise<T>,
  queryKey: string,
  options: UseAPIOptions<T> = {}
): UseAPIResult<T> {
  const {
    dependencies = [],
    enabled = true,
    refetchOnMount = true,
    refetchOnWindowFocus = false,
    staleTime = 5 * 60 * 1000, // 5 minutes
    retry = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);
  const [isStale, setIsStale] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef<number>(0);

  const fetchData = useCallback(async (isRetry: boolean = false): Promise<void> => {
    if (!enabled) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Check cache first
    if (!isRetry) {
      const cached = queryCache.get(queryKey);
      if (cached && !cached.isStale) {
        setData(cached.data);
        setError(null);
        setIsStale(false);
        setLastFetchedAt(Date.now());
        return;
      }
      if (cached && cached.isStale) {
        setData(cached.data);
        setIsStale(true);
      }
    }

    setIsLoading(true);
    setError(null);
    
    abortControllerRef.current = new AbortController();

    try {
      const result = await queryFn();
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      setData(result);
      setError(null);
      setIsStale(false);
      setLastFetchedAt(Date.now());
      retryCountRef.current = 0;

      // Cache the result
      queryCache.set(queryKey, result, staleTime);

      onSuccess?.(result);
    } catch (err) {
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const apiError = err as ApiError;
      
      // Retry logic
      if (retryCountRef.current < retry && !apiError.status) {
        retryCountRef.current++;
        setTimeout(() => {
          fetchData(true);
        }, retryDelay * retryCountRef.current);
        return;
      }

      setError(apiError);
      onError?.(apiError);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [queryFn, queryKey, enabled, staleTime, retry, retryDelay, onSuccess, onError]);

  const refetch = useCallback(async (): Promise<void> => {
    retryCountRef.current = 0;
    await fetchData();
  }, [fetchData]);

  // Initial fetch and dependency-based refetch
  useEffect(() => {
    if (refetchOnMount || dependencies.length > 0) {
      fetchData();
    }
  }, [fetchData, refetchOnMount, ...dependencies]);

  // Window focus refetch
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (enabled && data && lastFetchedAt) {
        const timeSinceLastFetch = Date.now() - lastFetchedAt;
        if (timeSinceLastFetch > staleTime) {
          fetchData();
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, enabled, data, lastFetchedAt, staleTime, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Check for stale data periodically
  useEffect(() => {
    if (!data || !lastFetchedAt) return;

    const interval = setInterval(() => {
      const timeSinceLastFetch = Date.now() - lastFetchedAt;
      setIsStale(timeSinceLastFetch > staleTime);
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [data, lastFetchedAt, staleTime]);

  return {
    data,
    isLoading,
    error,
    refetch,
    isStale,
    lastFetchedAt,
  };
}

export default useAPI;
