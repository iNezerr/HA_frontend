/**
 * Generic API Mutation Hook
 * Handles POST, PUT, DELETE operations with loading states and callbacks
 */

import { useState, useCallback, useRef } from 'react';
import { ApiError } from '../services/apiClient';

export interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: ApiError, variables: TVariables) => void | Promise<void>;
  onSettled?: (data: TData | null, error: ApiError | null, variables: TVariables) => void | Promise<void>;
  retry?: number;
  retryDelay?: number;
}

export interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  data: TData | null;
  error: ApiError | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
}

export function useMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {}
): UseMutationResult<TData, TVariables> {
  const {
    onSuccess,
    onError,
    onSettled,
    retry = 0,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const retryCountRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    setIsSuccess(false);
    setIsError(false);
    retryCountRef.current = 0;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const executeMutation = useCallback(async (
    variables: TVariables,
    isRetry: boolean = false
  ): Promise<TData> => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!isRetry) {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);
      setIsError(false);
    }

    abortControllerRef.current = new AbortController();

    try {
      const result = await mutationFn(variables);
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Request aborted');
      }

      setData(result);
      setIsSuccess(true);
      setIsError(false);
      retryCountRef.current = 0;

      // Call success callback
      try {
        await onSuccess?.(result, variables);
      } catch (callbackError) {
        console.error('onSuccess callback error:', callbackError);
      }

      // Call settled callback
      try {
        await onSettled?.(result, null, variables);
      } catch (callbackError) {
        console.error('onSettled callback error:', callbackError);
      }

      return result;
    } catch (err) {
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        throw err;
      }

      const apiError = err as ApiError;
      
      // Retry logic for network errors
      if (retryCountRef.current < retry && !apiError.status) {
        retryCountRef.current++;
        
        return new Promise((resolve, reject) => {
          setTimeout(async () => {
            try {
              const result = await executeMutation(variables, true);
              resolve(result);
            } catch (retryError) {
              reject(retryError);
            }
          }, retryDelay * retryCountRef.current);
        });
      }

      setError(apiError);
      setIsSuccess(false);
      setIsError(true);

      // Call error callback
      try {
        await onError?.(apiError, variables);
      } catch (callbackError) {
        console.error('onError callback error:', callbackError);
      }

      // Call settled callback
      try {
        await onSettled?.(null, apiError, variables);
      } catch (callbackError) {
        console.error('onSettled callback error:', callbackError);
      }

      throw apiError;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [mutationFn, onSuccess, onError, onSettled, retry, retryDelay]);

  const mutate = useCallback(async (variables: TVariables): Promise<TData> => {
    retryCountRef.current = 0;
    return executeMutation(variables);
  }, [executeMutation]);

  const mutateAsync = mutate; // Alias for consistency with react-query

  return {
    mutate,
    mutateAsync,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
    reset,
  };
}

export default useMutation;
