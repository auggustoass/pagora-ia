
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

interface DashboardStats {
  total: number;
  pendentes: number;
  aprovadas: number;
  totalRecebido: number;
}

interface Client {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  cpf_cnpj: string;
}

export function useOptimizedDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pendentes: 0,
    aprovadas: 0,
    totalRecebido: 0
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  // Memoized filtered clients for search
  const getFilteredClients = useMemo(() => {
    return (searchTerm: string) => {
      if (!searchTerm) return clients;
      
      const term = searchTerm.toLowerCase();
      return clients.filter(client =>
        client.nome.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        client.cpf_cnpj.includes(term) ||
        client.whatsapp.includes(term)
      );
    };
  }, [clients]);

  const fetchOptimizedStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Use a single query with aggregate functions for better performance
      let baseQuery = supabase
        .from('faturas')
        .select('status, valor', { count: 'exact' });
      
      if (!isAdmin) {
        baseQuery = baseQuery.eq('user_id', user.id);
      }

      const { data: invoices, count: total, error } = await baseQuery;
      
      if (error) throw error;

      // Calculate stats in memory instead of multiple queries
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

      setStats(stats);
      
    } catch (error) {
      console.error('Error fetching optimized stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptimizedClients = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('clients')
        .select('id, nome, email, whatsapp, cpf_cnpj')
        .order('nome');
      
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setClients(data || []);
      
    } catch (error) {
      console.error('Error fetching optimized clients:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOptimizedStats();
      fetchOptimizedClients();
    }
  }, [user, isAdmin]);

  return {
    stats,
    clients,
    loading,
    getFilteredClients,
    refetchStats: fetchOptimizedStats,
    refetchClients: fetchOptimizedClients
  };
}
