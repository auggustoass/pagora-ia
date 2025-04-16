import React, { useState, useEffect } from 'react';
import { Check, Clock, Ban, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
}

// Status badge component
interface StatusBadgeProps {
  status: Invoice['status'];
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusConfig = {
    pendente: {
      color: 'bg-pagora-pending/20 text-pagora-pending',
      icon: <Clock className="w-3 h-3" />,
      label: 'Pendente'
    },
    aprovado: {
      color: 'bg-pagora-success/20 text-pagora-success',
      icon: <Check className="w-3 h-3" />,
      label: 'Aprovado'
    },
    rejeitado: {
      color: 'bg-pagora-error/20 text-pagora-error',
      icon: <Ban className="w-3 h-3" />,
      label: 'Rejeitado'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', config.color)}>
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
};

export function InvoiceTable() {
  const [filter, setFilter] = useState<Invoice['status'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Busca dados do Supabase
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true);
        
        let query = supabase
          .from('faturas')
          .select('*')
          .order('vencimento', { ascending: false });
          
        if (filter !== 'all') {
          query = query.eq('status', filter);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setInvoices(data as Invoice[]);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        setInvoices([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInvoices();
    
    // Configurar escuta em tempo real para atualizações
    const subscription = supabase
      .channel('table-db-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'faturas' 
        }, 
        () => {
          fetchInvoices();
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [filter]);

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      invoice.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

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

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Pesquisar faturas..."
            className="pl-9 bg-white/5 border-white/10 w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-white/10 bg-white/5">
              <Filter className="w-4 h-4 mr-2" />
              {filter === 'all' ? 'Todos' : 
                filter === 'pendente' ? 'Pendentes' : 
                filter === 'aprovado' ? 'Aprovados' : 'Rejeitados'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilter('all')}>
              Todos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('pendente')}>
              Pendentes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('aprovado')}>
              Aprovados
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('rejeitado')}>
              Rejeitados
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Cliente</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Descrição</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Valor</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Vencimento</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-muted-foreground">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Carregando...
                </td>
              </tr>
            ) : (
              filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{invoice.nome}</p>
                        <p className="text-sm text-muted-foreground">{invoice.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm">{invoice.descricao}</p>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(invoice.valor)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(invoice.vencimento)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                        Detalhes
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhuma fatura encontrada.
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
