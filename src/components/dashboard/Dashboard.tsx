import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, Wallet, Search, UserCog, AlertCircle, Coins } from 'lucide-react';
import { StatusCard } from './StatusCard';
import { InvoiceTable } from './InvoiceTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientForm } from '../forms/ClientForm';
import { InvoiceForm } from '../forms/InvoiceForm';
import { ClientEditForm } from '../forms/ClientEditForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { CreditsDisplay } from './CreditsDisplay';
import { useCredits } from '@/hooks/use-credits';
import { cn } from '@/lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  const { credits, loading: creditsLoading } = useCredits();
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Show 10 clients per page
  
  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, isAdmin]);
  
  const fetchStats = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      let query = supabase.from('faturas').select('*', { count: 'exact' });
      
      // If not admin, only show user's own invoices
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }
      
      const { data, count: total, error: errorTotal } = await query;
      
      // Apply similar user filtering to other queries
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
      
      // Fetch clients for the clients tab
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
      
      // If not admin, only show user's own clients
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

  // Filter clients based on search term
  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true;
    
    return client.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cpf_cnpj.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  
  // Get current page clients
  const currentClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-glow">
            <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie suas cobranças e acompanhe pagamentos em tempo real.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pagora-purple to-pagora-purple/80 hover:bg-pagora-purple/90 btn-hover-fx">
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-pagora-dark border-white/10">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
              </DialogHeader>
              <ClientForm />
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pagora-orange to-pagora-orange/80 hover:bg-pagora-orange/90 btn-hover-fx">
                Gerar Fatura
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-pagora-dark border-white/10">
              <DialogHeader>
                <DialogTitle>Gerar Nova Fatura</DialogTitle>
              </DialogHeader>
              <InvoiceForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Credits Display */}
      <CreditsDisplay />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard 
          title="Créditos restantes" 
          value={creditsLoading ? "..." : String(credits?.credits_remaining || 0)} 
          icon={<Coins className="h-5 w-5 text-yellow-400" />} 
          className="pulse-glow" 
          description="Para geração de faturas"
        />
        <StatusCard 
          title="Total de Faturas" 
          value={loading ? "..." : String(stats.total)} 
          icon={<FileText className="h-5 w-5" />}  
        />
        <StatusCard 
          title="Faturas Pendentes" 
          value={loading ? "..." : String(stats.pendentes)} 
          icon={<Clock className="h-5 w-5" />} 
          variant="pending" 
          description="Aguardando pagamento" 
        />
        <StatusCard 
          title="Total Recebido" 
          value={loading ? "..." : formatCurrency(stats.totalRecebido)} 
          icon={<Wallet className="h-5 w-5" />} 
          description="Valor total recebido" 
        />
      </div>
      
      <Tabs defaultValue="faturas" className="py-6">
        <TabsList className="bg-black/20 border border-white/10">
          <TabsTrigger value="faturas" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pagora-purple/60 data-[state=active]:to-pagora-blue/60 data-[state=active]:text-white">Faturas</TabsTrigger>
          <TabsTrigger value="clientes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pagora-purple/60 data-[state=active]:to-pagora-blue/60 data-[state=active]:text-white">Clientes</TabsTrigger>
        </TabsList>
        <TabsContent value="faturas" className="pt-6 animate-fade-in">
          <InvoiceTable />
        </TabsContent>
        <TabsContent value="clientes" className="pt-6 animate-fade-in">
          <div className="glass-card bg-black/20">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-medium mb-1 text-gradient">Lista de Clientes</h3>
                  <p className="text-sm text-muted-foreground">Gerencie todos os seus contatos cadastrados</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Pesquisar clientes..."
                    className="pl-9 bg-white/5 border-white/10 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 bg-black/30">
                    <TableHead className="text-muted-foreground">Nome</TableHead>
                    <TableHead className="text-muted-foreground">E-mail</TableHead>
                    <TableHead className="text-muted-foreground">WhatsApp</TableHead>
                    <TableHead className="text-muted-foreground">CPF/CNPJ</TableHead>
                    <TableHead className="text-muted-foreground text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : currentClients.length > 0 ? (
                    currentClients.map((client) => (
                      <TableRow key={client.id} className="border-white/5 hover:bg-white/5">
                        <TableCell className="font-medium">{client.nome}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.whatsapp}</TableCell>
                        <TableCell>{client.cpf_cnpj}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-muted-foreground hover:text-white hover:bg-white/10"
                            onClick={() => handleEditClient(client.id)}
                          >
                            <UserCog className="w-4 h-4 mr-1" />
                            Gerenciar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? "Nenhum cliente encontrado com este termo." : "Nenhum cliente cadastrado."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {!loading && filteredClients.length > 0 && (
                <div className="py-4 border-t border-white/10">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={cn(
                            "border-white/10 bg-white/5 hover:bg-white/10", 
                            currentPage === 1 && "pointer-events-none opacity-50"
                          )}
                          aria-disabled={currentPage === 1}
                        />
                      </PaginationItem>
                      
                      {totalPages <= 5 ? (
                        // Show all pages if 5 or fewer
                        [...Array(totalPages)].map((_, i) => (
                          <PaginationItem key={i + 1}>
                            <PaginationLink
                              onClick={() => handlePageChange(i + 1)}
                              isActive={currentPage === i + 1}
                              className={cn(
                                "border-white/10",
                                currentPage === i + 1 
                                  ? "bg-white/20" 
                                  : "bg-white/5 hover:bg-white/10"
                              )}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))
                      ) : (
                        // Show first, last, and pages around current
                        <>
                          {/* First page */}
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => handlePageChange(1)}
                              isActive={currentPage === 1}
                              className={cn(
                                "border-white/10",
                                currentPage === 1 
                                  ? "bg-white/20" 
                                  : "bg-white/5 hover:bg-white/10"
                              )}
                            >
                              1
                            </PaginationLink>
                          </PaginationItem>
                          
                          {/* Ellipsis if needed */}
                          {currentPage > 3 && (
                            <PaginationItem>
                              <PaginationEllipsis className="text-white/50" />
                            </PaginationItem>
                          )}
                          
                          {/* Pages around current */}
                          {[...Array(totalPages)].map((_, i) => {
                            const pageNum = i + 1;
                            if (
                              pageNum !== 1 && 
                              pageNum !== totalPages && 
                              pageNum >= currentPage - 1 && 
                              pageNum <= currentPage + 1
                            ) {
                              return (
                                <PaginationItem key={pageNum}>
                                  <PaginationLink
                                    onClick={() => handlePageChange(pageNum)}
                                    isActive={currentPage === pageNum}
                                    className={cn(
                                      "border-white/10",
                                      currentPage === pageNum 
                                        ? "bg-white/20" 
                                        : "bg-white/5 hover:bg-white/10"
                                    )}
                                  >
                                    {pageNum}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            }
                            return null;
                          })}
                          
                          {/* Ellipsis if needed */}
                          {currentPage < totalPages - 2 && (
                            <PaginationItem>
                              <PaginationEllipsis className="text-white/50" />
                            </PaginationItem>
                          )}
                          
                          {/* Last page */}
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => handlePageChange(totalPages)}
                              isActive={currentPage === totalPages}
                              className={cn(
                                "border-white/10",
                                currentPage === totalPages 
                                  ? "bg-white/20" 
                                  : "bg-white/5 hover:bg-white/10"
                              )}
                            >
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        </>
                      )}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={cn(
                            "border-white/10 bg-white/5 hover:bg-white/10",
                            currentPage === totalPages && "pointer-events-none opacity-50"
                          )}
                          aria-disabled={currentPage === totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </div>
          
          {/* Client Edit Dialog */}
          <Dialog open={editClientDialogOpen} onOpenChange={setEditClientDialogOpen}>
            <DialogContent className="sm:max-w-[425px] bg-pagora-dark border-white/10">
              <DialogHeader>
                <DialogTitle>Editar Cliente</DialogTitle>
              </DialogHeader>
              {selectedClientId && (
                <ClientEditForm 
                  clientId={selectedClientId} 
                  onSuccess={handleEditClientSuccess} 
                />
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
