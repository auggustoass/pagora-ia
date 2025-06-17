
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
    if (!user) {
      console.log('No user found, returning empty clients array');
      return [];
    }

    try {
      let query = supabase
        .from('clients')
        .select('id, nome, email, whatsapp, cpf_cnpj')
        .order('nome');
      
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      return [];
    }
  };

  const {
    data: clients = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['clients', user?.id, isAdmin],
    queryFn: fetchClients,
    enabled: !!user,
    staleTime: 3 * 60 * 1000, // Cache por 3 minutos
    retry: 1, // Tentar apenas uma vez em caso de erro
  });

  // Filtrar clientes com base no termo de busca
  const filteredClients = useMemo(() => {
    if (!debouncedSearchTerm || !Array.isArray(clients)) {
      return clients;
    }
    
    const term = debouncedSearchTerm.toLowerCase();
    return clients.filter(client => {
      try {
        return (
          client.nome?.toLowerCase().includes(term) ||
          client.email?.toLowerCase().includes(term) ||
          client.cpf_cnpj?.includes(term) ||
          client.whatsapp?.includes(term)
        );
      } catch (error) {
        console.warn('Error filtering client:', client, error);
        return false;
      }
    });
  }, [clients, debouncedSearchTerm]);

  return {
    clients: filteredClients,
    allClients: clients,
    isLoading,
    error: error instanceof Error ? error.message : null
  };
}
