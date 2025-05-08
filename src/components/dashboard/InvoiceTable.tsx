
import React, { useState, useEffect } from 'react';
import { Check, Clock, Ban, Search, Filter, Edit, CreditCard, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
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

// Type for our invoice data
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

// Status badge component
interface StatusBadgeProps {
  status: Invoice['status'];
}

interface InvoiceTableProps {
  onEditInvoice?: (invoiceId: string) => void;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusConfig = {
    pendente: {
      color: 'bg-pagora-pending/20 text-pagora-pending border border-pagora-pending/30',
      icon: <Clock className="w-3 h-3" />,
      label: 'Pendente'
    },
    aprovado: {
      color: 'bg-pagora-success/20 text-pagora-success border border-pagora-success/30',
      icon: <Check className="w-3 h-3" />,
      label: 'Aprovado'
    },
    rejeitado: {
      color: 'bg-pagora-error/20 text-pagora-error border border-pagora-error/30',
      icon: <Ban className="w-3 h-3" />,
      label: 'Rejeitado'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={cn('flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium', config.color)}>
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
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Show 10 invoices per page

  // Busca dados do Supabase
  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        let query = supabase
          .from('faturas')
          .select('*');
          
        // Filter by user_id unless the user is an admin
        if (!isAdmin) {
          query = query.eq('user_id', user.id);
        }
          
        // Apply status filter if not 'all'
        if (filter !== 'all') {
          query = query.eq('status', filter);
        }
        
        // Sort by date
        query = query.order('vencimento', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setInvoices(data as Invoice[]);
        // Reset to first page when filter changes
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
      
      // Configure real-time subscription for updates
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

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      invoice.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Calculate total pages
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  
  // Get current page invoices
  const currentInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Format date for display
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
        // The real-time subscription will update the invoice in the UI
      }
    } catch (error) {
      console.error('Error generating payment link:', error);
      toast.error('Erro ao gerar link de pagamento');
    } finally {
      setProcessingPayment(null);
    }
  };
  
  if (!user) {
    return <div className="text-center py-4">Você precisa estar logado para visualizar faturas.</div>;
  }

  return (
    <div className="glass-card overflow-hidden animate-fade-in bg-black/20">
      <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Pesquisar faturas..."
            className="pl-9 bg-white/5 border-white/10 w-full sm:w-64 focus:ring-1 focus:ring-pagora-purple/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-white/10 bg-white/5 btn-hover-fx">
              <Filter className="w-4 h-4 mr-2" />
              {filter === 'all' ? 'Todos' : 
                filter === 'pendente' ? 'Pendentes' : 
                filter === 'aprovado' ? 'Aprovados' : 'Rejeitados'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-pagora-dark border-white/10">
            <DropdownMenuItem onClick={() => setFilter('all')} className="hover:bg-white/10">
              Todos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('pendente')} className="hover:bg-white/10">
              Pendentes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('aprovado')} className="hover:bg-white/10">
              Aprovados
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('rejeitado')} className="hover:bg-white/10">
              Rejeitados
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-black/30">
              <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Cliente</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Descrição</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Valor</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Vencimento</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Pagamento</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Carregando...
                </td>
              </tr>
            ) : (
              currentInvoices.length > 0 ? (
                currentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium">{invoice.nome}</p>
                        <p className="text-sm text-muted-foreground">{invoice.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm">{invoice.descricao}</p>
                    </td>
                    <td className="px-4 py-4 font-medium">
                      {formatCurrency(invoice.valor)}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {formatDate(invoice.vencimento)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="px-4 py-4">
                      {invoice.payment_url ? (
                        <a 
                          href={invoice.payment_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Link de pagamento
                        </a>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs flex items-center gap-1"
                          onClick={() => handleGeneratePaymentLink(invoice.id)}
                          disabled={processingPayment === invoice.id}
                        >
                          <CreditCard className="w-3 h-3" />
                          {processingPayment === invoice.id ? 'Gerando...' : 'Gerar link'}
                        </Button>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-muted-foreground hover:text-white hover:bg-white/10"
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
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhuma fatura encontrada.
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && filteredInvoices.length > 0 && (
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
  );
}
