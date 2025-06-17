
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

interface OptimizedStats {
  total: number;
  pendentes: number;
  aprovadas: number;
  totalRecebido: number;
}

export function useOptimizedStats() {
  const { user, isAdmin } = useAuth();

  const fetchStats = async (): Promise<OptimizedStats> => {
    if (!user) return { total: 0, pendentes: 0, aprovadas: 0, totalRecebido: 0 };

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

    return stats;
  };

  return useQuery({
    queryKey: ['dashboard-stats', user?.id, isAdmin],
    queryFn: fetchStats,
    enabled: !!user,
    // Cache stats for 2 minutes since they don't change frequently
    staleTime: 2 * 60 * 1000,
  });
}
