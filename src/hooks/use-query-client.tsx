import { QueryClient } from '@tanstack/react-query';

// Create a singleton query client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed queries
      retry: 2,
      // Don't refetch on window focus for performance
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
