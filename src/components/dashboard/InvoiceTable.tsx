
import React, { useState } from 'react';
import { Check, Clock, Ban, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

// Mock data for now - will be replaced with actual data from Supabase
const mockInvoices: Invoice[] = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao@email.com',
    whatsapp: '+5511987654321',
    valor: 299.90,
    vencimento: '2025-04-20',
    descricao: 'Mensalidade Abril',
    status: 'pendente',
  },
  {
    id: '2',
    nome: 'Maria Souza',
    email: 'maria@email.com',
    whatsapp: '+5521987654321',
    valor: 149.90,
    vencimento: '2025-04-15',
    descricao: 'Consultoria',
    status: 'aprovado',
  },
  {
    id: '3',
    nome: 'Carlos Oliveira',
    email: 'carlos@email.com',
    whatsapp: '+5531987654321',
    valor: 450.00,
    vencimento: '2025-04-10',
    descricao: 'Projeto de Design',
    status: 'rejeitado',
  },
];

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

  // Filter invoices based on status and search term
  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesFilter = filter === 'all' || invoice.status === filter;
    const matchesSearch = 
      invoice.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      invoice.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
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
            {filteredInvoices.length > 0 ? (
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
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
