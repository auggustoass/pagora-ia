
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { CreditsDisplay } from './CreditsDisplay';
import { RevenueChart } from './charts/RevenueChart';
import { HeaderSection } from './HeaderSection';
import { StatsSection } from './StatsSection';
import { TabsSection } from './TabsSection';

interface Client {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  cpf_cnpj: string;
}

export function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pendentes: 0,
    aprovadas: 0,
    totalRecebido: 0
  });
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [editClientDialogOpen, setEditClientDialogOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchStats = async () => {
    if (!user) return;
    try {
      setLoading(true);
      
      let query = supabase.from('faturas').select('*', { count: 'exact' });
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }
      const { data, count: total, error: errorTotal } = await query;

      let pendingQuery = supabase.from('faturas').select('*', { count: 'exact' }).eq('status', 'pendente');
      let approvedQuery = supabase.from('faturas').select('*', { count: 'exact' }).eq('status', 'aprovado');
      let approvedValueQuery = supabase.from('faturas').select('valor').eq('status', 'aprovado');

      if (!isAdmin) {
        pendingQuery = pendingQuery.eq('user_id', user.id);
        approvedQuery = approvedQuery.eq('user_id', user.id);
        approvedValueQuery = approvedValueQuery.eq('user_id', user.id);
      }

      const { count: pendentes, error: errorPendentes } = await pendingQuery;
      const { count: aprovadas, error: errorAprovadas } = await approvedQuery;
      const { data: faturasAprovadas, error: errorValor } = await approvedValueQuery;

      if (errorTotal || errorPendentes || errorAprovadas || errorValor) throw new Error();

      const totalRecebido = faturasAprovadas?.reduce((sum, item) => sum + Number(item.valor), 0) || 0;

      setStats({
        total: total || 0,
        pendentes: pendentes || 0,
        aprovadas: aprovadas || 0,
        totalRecebido
      });

      await fetchClients();
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    if (!user) return;
    try {
      let query = supabase.from('clients').select('*');
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }
      const { data, error } = await query.order('nome');
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleEditClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setEditClientDialogOpen(true);
  };

  const handleEditClientSuccess = () => {
    setEditClientDialogOpen(false);
    setSelectedClientId(null);
    fetchClients();
  };

  const handleQuickInvoiceSuccess = () => {
    fetchStats();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 bg-transparent">
      <div className="">
        {/* Header Section */}
        <HeaderSection 
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onQuickInvoiceSuccess={handleQuickInvoiceSuccess}
        />
        
        {/* Credits Display */}
        <CreditsDisplay />
        
        {/* Stats Cards */}
        <StatsSection 
          stats={stats}
          loading={loading}
          formatCurrency={formatCurrency}
        />
        
        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-1">
          <RevenueChart />
        </div>
        
        {/* Tabs Section */}
        <TabsSection
          clients={clients}
          loading={loading}
          searchTerm={searchTerm}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          selectedClientId={selectedClientId}
          editClientDialogOpen={editClientDialogOpen}
          onEditClient={handleEditClient}
          onPageChange={handlePageChange}
          onEditClientDialogChange={setEditClientDialogOpen}
          onEditClientSuccess={handleEditClientSuccess}
        />
      </div>
    </div>
  );
}
