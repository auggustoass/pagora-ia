
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

interface Invoice {
  id: string;
  nome: string;
  email: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: string;
  payment_url: string | null;
  created_at: string;
}

interface PaginatedInvoicesResult {
  invoices: Invoice[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
}

export function usePaginatedInvoices(
  page: number = 1,
  pageSize: number = 10,
  filters: {
    status?: string;
    searchTerm?: string;
  } = {}
) {
  const [result, setResult] = useState<PaginatedInvoicesResult>({
    invoices: [],
    totalCount: 0,
    totalPages: 0,
    currentPage: page,
    isLoading: true,
    error: null
  });

  const { user, isAdmin } = useAuth();

  const fetchPaginatedInvoices = async () => {
    if (!user) return;

    try {
      setResult(prev => ({ ...prev, isLoading: true, error: null }));

      // Build base query
      let query = supabase
        .from('faturas')
        .select('*', { count: 'exact' });

      // Apply user filter
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Apply search filter
      if (filters.searchTerm) {
        query = query.or(`nome.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%,descricao.ilike.%${filters.searchTerm}%`);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      const totalPages = Math.ceil((count || 0) / pageSize);

      setResult({
        invoices: data || [],
        totalCount: count || 0,
        totalPages,
        currentPage: page,
        isLoading: false,
        error: null
      });

    } catch (error) {
      console.error('Error fetching paginated invoices:', error);
      setResult(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar faturas'
      }));
    }
  };

  useEffect(() => {
    fetchPaginatedInvoices();
  }, [user, isAdmin, page, pageSize, filters.status, filters.searchTerm]);

  return {
    ...result,
    refetch: fetchPaginatedInvoices
  };
}
