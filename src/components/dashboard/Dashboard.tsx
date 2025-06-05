import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, Wallet, Search, UserCog, AlertCircle, Coins, Zap, TrendingUp } from 'lucide-react';
import { ModernStatusCard } from './ModernStatusCard';
import { InvoiceTable } from './InvoiceTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientEditForm } from '../forms/ClientEditForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditsDisplay } from './CreditsDisplay';
import { useCredits } from '@/hooks/use-credits';
import { cn } from '@/lib/utils';
import { RevenueChart } from './charts/RevenueChart';
import { ActionButtons } from './ActionButtons';
import { SearchBar } from './SearchBar';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
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
  const {
    user,
    isAdmin
  } = useAuth();
  const {
    credits,
    loading: creditsLoading
  } = useCredits();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, isAdmin]);
  const fetchStats = async () => {
    if (!user) return;
    try {
      setLoading(true);
      let query = supabase.from('faturas').select('*', {
        count: 'exact'
      });
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }
      const {
        data,
        count: total,
        error: errorTotal
      } = await query;
      let pendingQuery = supabase.from('faturas').select('*', {
        count: 'exact'
      }).eq('status', 'pendente');
      let approvedQuery = supabase.from('faturas').select('*', {
        count: 'exact'
      }).eq('status', 'aprovado');
      let approvedValueQuery = supabase.from('faturas').select('valor').eq('status', 'aprovado');
      if (!isAdmin) {
        pendingQuery = pendingQuery.eq('user_id', user.id);
        approvedQuery = approvedQuery.eq('user_id', user.id);
        approvedValueQuery = approvedValueQuery.eq('user_id', user.id);
      }
      const {
        count: pendentes,
        error: errorPendentes
      } = await pendingQuery;
      const {
        count: aprovadas,
        error: errorAprovadas
      } = await approvedQuery;
      const {
        data: faturasAprovadas,
        error: errorValor
      } = await approvedValueQuery;
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
      const {
        data,
        error
      } = await query.order('nome');
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
  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true;
    return client.nome.toLowerCase().includes(searchTerm.toLowerCase()) || client.email.toLowerCase().includes(searchTerm.toLowerCase()) || client.cpf_cnpj.toLowerCase().includes(searchTerm.toLowerCase());
  });
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const currentClients = filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  return <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="space-y-8 p-6 animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Dashboard Financeiro
              </h1>
            </div>
            
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Pesquisar faturas e clientes..." />
            <ActionButtons onQuickInvoiceSuccess={handleQuickInvoiceSuccess} />
          </div>
        </div>
        
        {/* Credits Display */}
        <CreditsDisplay />
        
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <ModernStatusCard title="Créditos Disponíveis" value={creditsLoading ? "..." : String(credits?.credits_remaining || 0)} icon={Coins} description="Para geração de faturas" variant="info" trend={{
          value: 12,
          isPositive: true
        }} />
          <ModernStatusCard title="Total de Faturas" value={loading ? "..." : String(stats.total)} icon={FileText} variant="default" />
          <ModernStatusCard title="Faturas Pendentes" value={loading ? "..." : String(stats.pendentes)} icon={Clock} variant="pending" description="Aguardando pagamento" />
          <ModernStatusCard title="Total Recebido" value={loading ? "..." : formatCurrency(stats.totalRecebido)} icon={Wallet} description="Valor total recebido" variant="success" trend={{
          value: 8.2,
          isPositive: true
        }} />
        </div>
        
        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-1">
          <RevenueChart />
        </div>
        
        {/* Tabs Section */}
        <Tabs defaultValue="faturas" className="space-y-6">
          <TabsList className="bg-gray-900/50 border border-white/10 rounded-xl p-1">
            <TabsTrigger value="faturas" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-lg transition-all duration-200">
              Faturas
            </TabsTrigger>
            <TabsTrigger value="clientes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all duration-200">
              Clientes
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="faturas" className="animate-fade-in">
            <InvoiceTable />
          </TabsContent>
          
          <TabsContent value="clientes" className="animate-fade-in">
            <div className="glass-card bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-white/10 rounded-2xl">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">Lista de Clientes</h3>
                    <p className="text-sm text-gray-400">Gerencie todos os seus contatos cadastrados</p>
                  </div>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 bg-black/30">
                      <TableHead className="text-gray-400">Nome</TableHead>
                      <TableHead className="text-gray-400">E-mail</TableHead>
                      <TableHead className="text-gray-400">WhatsApp</TableHead>
                      <TableHead className="text-gray-400">CPF/CNPJ</TableHead>
                      <TableHead className="text-gray-400 text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                          Carregando...
                        </TableCell>
                      </TableRow> : currentClients.length > 0 ? currentClients.map(client => <TableRow key={client.id} className="border-white/5 hover:bg-white/5">
                          <TableCell className="font-medium text-white">{client.nome}</TableCell>
                          <TableCell className="text-gray-300">{client.email}</TableCell>
                          <TableCell className="text-gray-300">{client.whatsapp}</TableCell>
                          <TableCell className="text-gray-300">{client.cpf_cnpj}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10" onClick={() => handleEditClient(client.id)}>
                              <UserCog className="w-4 h-4 mr-1" />
                              Gerenciar
                            </Button>
                          </TableCell>
                        </TableRow>) : <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                          {searchTerm ? "Nenhum cliente encontrado com este termo." : "Nenhum cliente cadastrado."}
                        </TableCell>
                      </TableRow>}
                  </TableBody>
                </Table>
                
                {/* Pagination for clients table same as original */}
                {!loading && filteredClients.length > 0 && <div className="py-4 border-t border-white/10">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious onClick={() => handlePageChange(Math.max(1, currentPage - 1))} className={cn("border-white/10 bg-white/5 hover:bg-white/10", currentPage === 1 && "pointer-events-none opacity-50")} aria-disabled={currentPage === 1} />
                        </PaginationItem>
                        
                        {totalPages <= 5 ? [...Array(totalPages)].map((_, i) => <PaginationItem key={i + 1}>
                              <PaginationLink onClick={() => handlePageChange(i + 1)} isActive={currentPage === i + 1} className={cn("border-white/10", currentPage === i + 1 ? "bg-white/20" : "bg-white/5 hover:bg-white/10")}>
                                {i + 1}
                              </PaginationLink>
                            </PaginationItem>) : <>
                            <PaginationItem>
                              <PaginationLink onClick={() => handlePageChange(1)} isActive={currentPage === 1} className={cn("border-white/10", currentPage === 1 ? "bg-white/20" : "bg-white/5 hover:bg-white/10")}>
                                1
                              </PaginationLink>
                            </PaginationItem>
                            
                            {currentPage > 3 && <PaginationItem>
                                <PaginationEllipsis className="text-white/50" />
                              </PaginationItem>}
                            
                            {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        if (pageNum !== 1 && pageNum !== totalPages && pageNum >= currentPage - 1 && pageNum <= currentPage + 1) {
                          return <PaginationItem key={pageNum}>
                                    <PaginationLink onClick={() => handlePageChange(pageNum)} isActive={currentPage === pageNum} className={cn("border-white/10", currentPage === pageNum ? "bg-white/20" : "bg-white/5 hover:bg-white/10")}>
                                      {pageNum}
                                    </PaginationLink>
                                  </PaginationItem>;
                        }
                        return null;
                      })}
                            
                            {currentPage < totalPages - 2 && <PaginationItem>
                                <PaginationEllipsis className="text-white/50" />
                              </PaginationItem>}
                            
                            <PaginationItem>
                              <PaginationLink onClick={() => handlePageChange(totalPages)} isActive={currentPage === totalPages} className={cn("border-white/10", currentPage === totalPages ? "bg-white/20" : "bg-white/5 hover:bg-white/10")}>
                                {totalPages}
                              </PaginationLink>
                            </PaginationItem>
                          </>}
                        
                        <PaginationItem>
                          <PaginationNext onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} className={cn("border-white/10 bg-white/5 hover:bg-white/10", currentPage === totalPages && "pointer-events-none opacity-50")} aria-disabled={currentPage === totalPages} />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>}
              </div>
            </div>
            
            {/* Client Edit Dialog */}
            <Dialog open={editClientDialogOpen} onOpenChange={setEditClientDialogOpen}>
              <DialogContent className="sm:max-w-[425px] bg-gray-900/95 border border-white/20 backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle className="text-white">Editar Cliente</DialogTitle>
                </DialogHeader>
                {selectedClientId && <ClientEditForm clientId={selectedClientId} onSuccess={handleEditClientSuccess} />}
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
}