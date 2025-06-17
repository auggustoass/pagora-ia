
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useDebounce } from './use-debounce';

interface Client {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  cpf_cnpj: string;
}

export function useOptimizedClients(searchTerm: string = '') {
  const { user, isAdmin } = useAuth();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchClients = async (): Promise<Client[]> => {
    if (!user) return [];

    let query = supabase
      .from('clients')
      .select('id, nome, email, whatsapp, cpf_cnpj')
      .order('nome');
    
    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };

  const {
    data: clients = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['clients', user?.id, isAdmin],
    queryFn: fetchClients,
    enabled: !!user,
    // Cache clients for 3 minutes
    staleTime: 3 * 60 * 1000,
  });

  // Memoized filtered clients for search
  const filteredClients = useMemo(() => {
    if (!debouncedSearchTerm) return clients;
    
    const term = debouncedSearchTerm.toLowerCase();
    return clients.filter(client =>
      client.nome.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term) ||
      client.cpf_cnpj.includes(term) ||
      client.whatsapp.includes(term)
    );
  }, [clients, debouncedSearchTerm]);

  return {
    clients: filteredClients,
    allClients: clients,
    isLoading,
    error: error instanceof Error ? error.message : null
  };
}
