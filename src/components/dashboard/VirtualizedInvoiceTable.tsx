
import React, { useMemo } from 'react';
import { VirtualizedList } from '@/components/ui/VirtualizedList';
import { useOptimizedInvoices } from '@/hooks/use-optimized-invoices';
import { useAdvancedSearch } from '@/hooks/use-advanced-search';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import { InvoiceActions } from './InvoiceActions';
import { ErrorBoundaryWithRecovery } from '@/components/ui/ErrorBoundaryWithRecovery';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';

interface VirtualizedInvoiceTableProps {
  onEditInvoice?: (invoiceId: string) => void;
}

export function VirtualizedInvoiceTable({ onEditInvoice }: VirtualizedInvoiceTableProps) {
  const { invoices, isLoading } = useOptimizedInvoices();
  
  const {
    searchTerm,
    filteredData,
    suggestions,
    updateSearchTerm,
    updateFilter,
    sortBy,
    setSortBy,
    clearFilters,
    resultCount
  } = useAdvancedSearch(invoices, {
    searchFields: ['nome', 'email', 'descricao'],
    filterFields: ['status'],
    sortOptions: [
      { field: 'vencimento', direction: 'desc' },
      { field: 'valor', direction: 'desc' },
      { field: 'nome', direction: 'asc' }
    ]
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const renderInvoiceRow = useMemo(() => (invoice: any, index: number) => (
    <div 
      key={invoice.id}
      className="flex items-center justify-between p-4 border-b border-green-500/10 hover:bg-green-500/5 transition-colors"
    >
      <div className="flex-1 grid grid-cols-5 gap-4 items-center">
        <div className="text-white font-mono text-sm truncate">
          {invoice.nome}
        </div>
        <div className="text-gray-400 text-sm truncate">
          {invoice.email}
        </div>
        <div className="text-green-400 font-mono">
          {formatCurrency(invoice.valor)}
        </div>
        <div className="text-gray-300 text-sm">
          {new Date(invoice.vencimento).toLocaleDateString('pt-BR')}
        </div>
        <InvoiceStatusBadge status={invoice.status} />
      </div>
      <div className="ml-4">
        <InvoiceActions 
          invoice={invoice} 
          onEdit={onEditInvoice}
        />
      </div>
    </div>
  ), [onEditInvoice]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-green-400 font-mono">LOADING_INVOICES...</div>
      </div>
    );
  }

  return (
    <ErrorBoundaryWithRecovery>
      <div className="space-y-4">
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-900/50 border border-green-500/20 rounded-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar faturas..."
              value={searchTerm}
              onChange={(e) => updateSearchTerm(e.target.value)}
              className="pl-10 bg-black border-green-500/30 text-white"
            />
            
            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-green-500/30 rounded-lg shadow-lg z-10">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-3 py-2 hover:bg-green-500/20 text-gray-300 text-sm"
                    onClick={() => updateSearchTerm(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy(
                sortBy?.field === 'vencimento' && sortBy?.direction === 'desc'
                  ? { field: 'vencimento', direction: 'asc' }
                  : { field: 'vencimento', direction: 'desc' }
              )}
              className="border-green-500/30 text-green-400 hover:bg-green-500/20"
            >
              {sortBy?.field === 'vencimento' && sortBy?.direction === 'desc' ? (
                <SortDesc className="w-4 h-4 mr-1" />
              ) : (
                <SortAsc className="w-4 h-4 mr-1" />
              )}
              Data
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="border-red-500/30 text-red-400 hover:bg-red-500/20"
            >
              <Filter className="w-4 h-4 mr-1" />
              Limpar
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-gray-400 text-sm font-mono">
          {resultCount} resultados encontrados
        </div>

        {/* Table Header */}
        <div className="flex items-center justify-between p-4 bg-gray-800/50 border-b border-green-500/20">
          <div className="flex-1 grid grid-cols-5 gap-4 text-green-400 font-mono text-sm uppercase tracking-wider">
            <div>Nome</div>
            <div>Email</div>
            <div>Valor</div>
            <div>Vencimento</div>
            <div>Status</div>
          </div>
          <div className="ml-4 w-16 text-center text-green-400 font-mono text-sm uppercase">
            Ações
          </div>
        </div>

        {/* Virtualized List */}
        <VirtualizedList
          items={filteredData}
          itemHeight={72}
          containerHeight={600}
          renderItem={renderInvoiceRow}
          className="border border-green-500/20 rounded-lg bg-gray-900/30"
        />
      </div>
    </ErrorBoundaryWithRecovery>
  );
}
