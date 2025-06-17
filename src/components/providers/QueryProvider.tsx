
import React from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundaryWithRecovery } from '@/components/ui/ErrorBoundaryWithRecovery';

interface QueryProviderProps {
  children: React.ReactNode;
}

// Create a fallback query client with minimal configuration
const createFallbackQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  });
};

// Lazy initialization of query client
let queryClient: QueryClient | null = null;

const getQueryClient = () => {
  if (!queryClient) {
    try {
      queryClient = createFallbackQueryClient();
    } catch (error) {
      console.error('Failed to create QueryClient:', error);
      // Create a minimal client as fallback
      queryClient = new QueryClient();
    }
  }
  return queryClient;
};

export function QueryProvider({ children }: QueryProviderProps) {
  // Verify React hooks are available
  if (!React.useEffect) {
    console.error('React hooks not available in QueryProvider');
    return <div>Loading...</div>;
  }

  const client = getQueryClient();

  return (
    <ErrorBoundaryWithRecovery
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-center">
            <h2 className="text-xl mb-4">Inicializando aplicação...</h2>
            <p className="text-gray-400">Carregando sistema de consultas...</p>
          </div>
        </div>
      }
    >
      <QueryClientProvider client={client}>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ErrorBoundaryWithRecovery>
  );
}
