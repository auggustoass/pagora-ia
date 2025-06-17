
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface PredictiveFetchOptions {
  queryKey: string[];
  queryFn: () => Promise<any>;
  enabled?: boolean;
  delay?: number;
  probability?: number;
}

export function usePredictiveFetch({
  queryKey,
  queryFn,
  enabled = true,
  delay = 2000,
  probability = 0.7
}: PredictiveFetchOptions) {
  const queryClient = useQueryClient();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled) return;

    const shouldPrefetch = Math.random() < probability;
    if (!shouldPrefetch) return;

    timeoutRef.current = setTimeout(() => {
      // Check if data is already cached
      const cachedData = queryClient.getQueryData(queryKey);
      if (!cachedData) {
        queryClient.prefetchQuery({
          queryKey,
          queryFn,
          staleTime: 5 * 60 * 1000, // 5 minutes
        });
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [queryKey, queryFn, enabled, delay, probability, queryClient]);
}
