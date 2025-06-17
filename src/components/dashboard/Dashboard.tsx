import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { CreditsDisplay } from './CreditsDisplay';
import { RevenueChart } from './charts/RevenueChart';
import { CyberHeaderSection } from './CyberHeaderSection';
import { CyberStatsSection } from './CyberStatsSection';
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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Cyber background elements */}
      <div className="absolute inset-0 bg-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(0,255,65,0.05)_0%,transparent_25%),radial-gradient(circle_at_85%_30%,rgba(0,255,65,0.05)_0%,transparent_25%)]"></div>
      
      {/* Scan lines overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_98%,rgba(0,255,65,0.03)_100%)] bg-[length:100%_4px] animate-pulse pointer-events-none"></div>
      
      <div className="relative z-10 space-y-12 p-6">
        {/* Header Section */}
        <CyberHeaderSection 
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onQuickInvoiceSuccess={handleQuickInvoiceSuccess}
        />
        
        {/* Credits Display */}
        <div className="relative">
          <CreditsDisplay />
        </div>
        
        {/* Stats Cards */}
        <CyberStatsSection 
          stats={stats}
          loading={loading}
          formatCurrency={formatCurrency}
        />
        
        {/* Charts Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 to-transparent rounded-2xl blur-3xl"></div>
          <div className="relative">
            <RevenueChart />
          </div>
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
      
      {/* Corner accents */}
      <div className="fixed top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-green-400/20 pointer-events-none"></div>
      <div className="fixed top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-green-400/20 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-green-400/20 pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-green-400/20 pointer-events-none"></div>
    </div>
  );
}
