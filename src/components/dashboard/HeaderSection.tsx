
import React from 'react';
import { SearchBar } from './SearchBar';
import { ActionButtons } from './ActionButtons';

interface HeaderSectionProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onQuickInvoiceSuccess: () => void;
}

export function HeaderSection({ 
  searchTerm, 
  onSearchTermChange, 
  onQuickInvoiceSuccess 
}: HeaderSectionProps) {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Dashboard Financeiro
          </h1>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <SearchBar 
          value={searchTerm} 
          onChange={onSearchTermChange} 
          placeholder="Pesquisar faturas e clientes..." 
        />
        <ActionButtons onQuickInvoiceSuccess={onQuickInvoiceSuccess} />
      </div>
    </div>
  );
}
