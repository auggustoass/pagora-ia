
import React, { useState, useEffect } from 'react';
import { Check, Clock, Ban, Search, Filter, Edit, CreditCard, ExternalLink, TrendingUp, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { NotificationsService } from '@/services/notificationsService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface Invoice {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  valor: number;
  vencimento: string;
  descricao: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  user_id: string;
  payment_url: string | null;
  payment_status: string | null;
  mercado_pago_preference_id: string | null;
}

interface StatusBadgeProps {
  status: Invoice['status'];
}

interface InvoiceTableProps {
  onEditInvoice?: (invoiceId: string) => void;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusConfig = {
    pendente: {
      color: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border border-yellow-500/30',
      icon: <Clock className="w-3 h-3" />,
      label: 'Pendente'
    },
    aprovado: {
      color: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30',
      icon: <Check className="w-3 h-3" />,
      label: 'Aprovado'
    },
    rejeitado: {
      color: 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 border border-red-500/30',
      icon: <Ban className="w-3 h-3" />,
      label: 'Rejeitado'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={cn('flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm', config.color)}>
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
};

export function InvoiceTable({ onEditInvoice }: InvoiceTableProps) {
  const [filter, setFilter] = useState<Invoice['status'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        let query = supabase
          .from('faturas')
          .select('*');
          
        if (!isAdmin) {
          query = query.eq('user_id', user.id);
        }
          
        if (filter !== 'all') {
          query = query.eq('status', filter);
        }
        
        query = query.order('vencimento', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setInvoices(data as Invoice[]);
        setCurrentPage(1);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        setInvoices([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchInvoices();
      
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
  }, [filter, user, isAdmin]);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      invoice.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const currentInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const handleEditClick = (invoiceId: string) => {
    if (onEditInvoice) {
      onEditInvoice(invoiceId);
    }
  };

  const handleGeneratePaymentLink = async (invoiceId: string) => {
    if (!user) return;

    try {
      setProcessingPayment(invoiceId);

      const { data, error } = await supabase.functions.invoke('generate-invoice-payment', {
        body: { invoiceId }
      });

      if (error) throw error;
      
      if (data.success && data.payment_url) {
        toast.success('Link de pagamento gerado com sucesso!');
        
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (invoice) {
          await NotificationsService.createNotification({
            userId: user.id,
            type: 'payment_update',
            title: 'Link de pagamento gerado',
            content: `O link de pagamento para a fatura de ${formatCurrency(invoice.valor)} do cliente ${invoice.nome} foi gerado com sucesso.`,
            relatedId: invoiceId
          });
        }
      }
    } catch (error) {
      console.error('Error generating payment link:', error);
      toast.error('Erro ao gerar link de pagamento');
    } finally {
      setProcessingPayment(null);
    }
  };
  
  if (!user) {
    return <div className="text-center py-4 text-gray-400">Você precisa estar logado para visualizar faturas.</div>;
  }

  return (
    <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
      <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Faturas</h3>
            <p className="text-sm text-gray-400">Gerencie suas cobranças</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Pesquisar faturas..."
              className="pl-9 bg-gray-900/50 border-white/10 text-white placeholder-gray-400 focus:border-green-500/50 focus:ring-green-500/20 rounded-xl w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl">
                <Filter className="w-4 h-4 mr-2" />
                {filter === 'all' ? 'Todos' : 
                  filter === 'pendente' ? 'Pendentes' : 
                  filter === 'aprovado' ? 'Aprovados' : 'Rejeitados'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900/95 border-white/20 backdrop-blur-xl">
              <DropdownMenuItem onClick={() => setFilter('all')} className="hover:bg-white/10 text-white">
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('pendente')} className="hover:bg-white/10 text-white">
                Pendentes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('aprovado')} className="hover:bg-white/10 text-white">
                Aprovados
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('rejeitado')} className="hover:bg-white/10 text-white">
                Rejeitados
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-black/20">
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Cliente</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Descrição</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Valor</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Vencimento</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Status</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-300">Pagamento</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Carregando faturas...</span>
                  </div>
                </td>
              </tr>
            ) : (
              currentInvoices.length > 0 ? (
                currentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/5 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-white">{invoice.nome}</p>
                        <p className="text-sm text-gray-400">{invoice.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-300 max-w-xs truncate">{invoice.descricao}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-green-400">
                        {formatCurrency(invoice.valor)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {formatDate(invoice.vencimento)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="px-6 py-4">
                      {invoice.payment_url ? (
                        <a 
                          href={invoice.payment_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Abrir link
                        </a>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs border-white/20 bg-white/5 hover:bg-white/10 text-white"
                          onClick={() => handleGeneratePaymentLink(invoice.id)}
                          disabled={processingPayment === invoice.id}
                        >
                          <CreditCard className="w-3 h-3 mr-1" />
                          {processingPayment === invoice.id ? 'Gerando...' : 'Gerar link'}
                        </Button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                        onClick={() => handleEditClick(invoice.id)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Eye className="w-8 h-8 text-gray-500" />
                      <span>Nenhuma fatura encontrada.</span>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && filteredInvoices.length > 0 && (
        <div className="py-4 px-6 border-t border-white/10">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={cn(
                    "border-white/10 bg-white/5 hover:bg-white/10 text-white", 
                    currentPage === 1 && "pointer-events-none opacity-50"
                  )}
                  aria-disabled={currentPage === 1}
                />
              </PaginationItem>
              
              {totalPages <= 5 ? (
                [...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      onClick={() => handlePageChange(i + 1)}
                      isActive={currentPage === i + 1}
                      className={cn(
                        "border-white/10 text-white",
                        currentPage === i + 1 
                          ? "bg-green-600 hover:bg-green-700" 
                          : "bg-white/5 hover:bg-white/10"
                      )}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))
              ) : (
                <>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(1)}
                      isActive={currentPage === 1}
                      className={cn(
                        "border-white/10 text-white",
                        currentPage === 1 
                          ? "bg-green-600 hover:bg-green-700" 
                          : "bg-white/5 hover:bg-white/10"
                      )}
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                  
                  {currentPage > 3 && (
                    <PaginationItem>
                      <PaginationEllipsis className="text-white/50" />
                    </PaginationItem>
                  )}
                  
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
                              "border-white/10 text-white",
                              currentPage === pageNum 
                                ? "bg-green-600 hover:bg-green-700" 
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
                  
                  {currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis className="text-white/50" />
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(totalPages)}
                      isActive={currentPage === totalPages}
                      className={cn(
                        "border-white/10 text-white",
                        currentPage === totalPages 
                          ? "bg-green-600 hover:bg-green-700" 
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
                    "border-white/10 bg-white/5 hover:bg-white/10 text-white",
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
  );
}
