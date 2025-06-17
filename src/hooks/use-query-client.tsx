import { QueryClient } from '@tanstack/react-query';

// Create a more robust query client with better error handling
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed queries
      retry: (failureCount, error) => {
        // Don't retry on certain errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status === 404 || status === 403 || status === 401) {
            return false;
          }
        }
        return failureCount < 2;
      },
      // Don't refetch on window focus for performance
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Export a function to get the client (for lazy initialization)
export const getQueryClient = () => queryClient;
