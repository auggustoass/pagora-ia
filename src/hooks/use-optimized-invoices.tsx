
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Invoice, InvoiceFilters } from '@/types/invoice';
import { useDebounce } from './use-debounce';

export const useOptimizedInvoices = (filters?: InvoiceFilters) => {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [localFilters, setLocalFilters] = useState(filters);
  
  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(localFilters?.searchTerm || '', 300);

  // Generate query key based on filters
  const queryKey = useMemo(() => [
    'invoices', 
    user?.id, 
    isAdmin,
    localFilters?.status,
    debouncedSearchTerm,
    localFilters?.dateRange?.from?.toISOString(),
    localFilters?.dateRange?.to?.toISOString()
  ], [user?.id, isAdmin, localFilters?.status, debouncedSearchTerm, localFilters?.dateRange]);

  const fetchInvoices = useCallback(async (): Promise<Invoice[]> => {
    if (!user) return [];

    let query = supabase
      .from('faturas')
      .select('*');

    // Apply user filter for non-admin users
    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }

    // Server-side status filter
    if (localFilters?.status && localFilters.status !== 'all') {
      query = query.eq('status', localFilters.status);
    }

    // Server-side date range filter
    if (localFilters?.dateRange) {
      query = query
        .gte('vencimento', localFilters.dateRange.from.toISOString().split('T')[0])
        .lte('vencimento', localFilters.dateRange.to.toISOString().split('T')[0]);
    }

    // Server-side search filter
    if (debouncedSearchTerm) {
      query = query.or(`nome.ilike.%${debouncedSearchTerm}%,email.ilike.%${debouncedSearchTerm}%,descricao.ilike.%${debouncedSearchTerm}%`);
    }

    query = query.order('vencimento', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data as Invoice[];
  }, [user, isAdmin, localFilters, debouncedSearchTerm]);

  const {
    data: invoices = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: fetchInvoices,
    enabled: !!user,
  });

  // Optimized mutation for updating invoices
  const updateInvoiceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Invoice> }) => {
      const { data, error } = await supabase
        .from('faturas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch invoices
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    }
  });

  const updateFilters = useCallback((newFilters: InvoiceFilters) => {
    setLocalFilters(newFilters);
  }, []);

  return {
    invoices,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
    updateInvoice: updateInvoiceMutation.mutate,
    updateFilters,
    isUpdating: updateInvoiceMutation.isPending
  };
};
