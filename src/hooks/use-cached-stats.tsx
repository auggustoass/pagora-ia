
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { cacheService } from '@/services/CacheService';
import { realtimeService } from '@/services/RealtimeService';
import { performanceService } from '@/services/PerformanceService';

interface OptimizedStats {
  total: number;
  pendentes: number;
  aprovadas: number;
  totalRecebido: number;
}

export function useCachedStats() {
  const { user, isAdmin } = useAuth();

  const fetchStats = async (): Promise<OptimizedStats> => {
    if (!user) return { total: 0, pendentes: 0, aprovadas: 0, totalRecebido: 0 };

    const cacheKey = `stats_${user.id}_${isAdmin}`;
    const cached = cacheService.get<OptimizedStats>(cacheKey);
    
    if (cached) {
      performanceService.recordMetric('cache_hit_rate', 100);
      return cached;
    }

    return performanceService.measureApiCall('fetch_stats', async () => {
      let baseQuery = supabase
        .from('faturas')
        .select('status, valor', { count: 'exact' });
      
      if (!isAdmin) {
        baseQuery = baseQuery.eq('user_id', user.id);
      }

      const { data: invoices, count: total, error } = await baseQuery;
      
      if (error) throw error;

      const stats = invoices?.reduce((acc, invoice) => {
        const valor = Number(invoice.valor) || 0;
        
        switch (invoice.status) {
          case 'pendente':
            acc.pendentes += 1;
            break;
          case 'aprovado':
            acc.aprovadas += 1;
            acc.totalRecebido += valor;
            break;
        }
        
        return acc;
      }, {
        total: total || 0,
        pendentes: 0,
        aprovadas: 0,
        totalRecebido: 0
      }) || { total: 0, pendentes: 0, aprovadas: 0, totalRecebido: 0 };

      // Cache for 2 minutes
      cacheService.set(cacheKey, stats, 2 * 60 * 1000);
      performanceService.recordMetric('cache_hit_rate', 0);
      
      return stats;
    });
  };

  const {
    data: stats = { total: 0, pendentes: 0, aprovadas: 0, totalRecebido: 0 },
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['cached-stats', user?.id, isAdmin],
    queryFn: fetchStats,
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channelName = `stats_${user.id}`;
    const filter = isAdmin ? undefined : `user_id=eq.${user.id}`;

    realtimeService.subscribe(
      channelName,
      'faturas',
      () => {
        // Invalidate cache and refetch
        const cacheKey = `stats_${user.id}_${isAdmin}`;
        cacheService.delete(cacheKey);
        refetch();
      },
      { filter }
    );

    return () => {
      realtimeService.unsubscribe(channelName);
    };
  }, [user, isAdmin, refetch]);

  return {
    data: stats,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch
  };
}
