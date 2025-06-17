
import React from 'react';
import { Search, Filter, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface InvoiceTableHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filter: 'all' | 'pendente' | 'aprovado' | 'rejeitado';
  onFilterChange: (filter: 'all' | 'pendente' | 'aprovado' | 'rejeitado') => void;
}

export const InvoiceTableHeader: React.FC<InvoiceTableHeaderProps> = ({
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange
}) => {
  const getFilterLabel = () => {
    switch (filter) {
      case 'all': return 'Todos';
      case 'pendente': return 'Pendentes';
      case 'aprovado': return 'Aprovados';
      case 'rejeitado': return 'Rejeitados';
      default: return 'Todos';
    }
  };

  return (
    <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
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
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl">
              <Filter className="w-4 h-4 mr-2" />
              {getFilterLabel()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-900/95 border-white/20 backdrop-blur-xl">
            <DropdownMenuItem onClick={() => onFilterChange('all')} className="hover:bg-white/10 text-white">
              Todos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange('pendente')} className="hover:bg-white/10 text-white">
              Pendentes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange('aprovado')} className="hover:bg-white/10 text-white">
              Aprovados
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange('rejeitado')} className="hover:bg-white/10 text-white">
              Rejeitados
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
