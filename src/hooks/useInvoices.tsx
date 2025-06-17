
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Invoice, InvoiceFilters } from '@/types/invoice';

export const useInvoices = (filters?: InvoiceFilters) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();

  const fetchInvoices = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('faturas')
        .select('*');

      // Apply user filter for non-admin users
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      // Apply status filter
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Apply date range filter
      if (filters?.dateRange) {
        query = query
          .gte('vencimento', filters.dateRange.from.toISOString().split('T')[0])
          .lte('vencimento', filters.dateRange.to.toISOString().split('T')[0]);
      }

      query = query.order('vencimento', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      let filteredData = data as Invoice[];

      // Apply search filter
      if (filters?.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        filteredData = filteredData.filter(invoice =>
          invoice.nome.toLowerCase().includes(searchTerm) ||
          invoice.email.toLowerCase().includes(searchTerm) ||
          invoice.descricao.toLowerCase().includes(searchTerm)
        );
      }

      setInvoices(filteredData);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar faturas');
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInvoices();

      // Set up real-time subscription
      const subscription = supabase
        .channel('table-db-changes')
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'faturas',
            filter: isAdmin ? undefined : `user_id=eq.${user.id}`
          },
          () => {
            fetchInvoices();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, isAdmin, filters?.status, filters?.dateRange, filters?.searchTerm]);

  return {
    invoices,
    isLoading,
    error,
    refetch: fetchInvoices
  };
};
