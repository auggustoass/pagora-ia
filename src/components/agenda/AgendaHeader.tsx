
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Plus, Filter } from 'lucide-react';
import { AgendaFilters } from '@/types/agenda';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AgendaHeaderProps {
  monthLabel: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  filters: AgendaFilters;
  onFiltersChange: (filters: AgendaFilters) => void;
}

export function AgendaHeader({
  monthLabel,
  onPreviousMonth,
  onNextMonth,
  onToday,
  filters,
  onFiltersChange
}: AgendaHeaderProps) {
  return (
    <div className="bg-black/50 border border-green-400/20 rounded-lg p-4 backdrop-blur-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Navegação do mês */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-400" />
            <h1 className="text-xl font-mono text-green-400 uppercase tracking-wider">
              AGENDA_SYSTEM
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPreviousMonth}
              className="text-green-400 hover:bg-green-500/10 hover:text-green-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="min-w-[180px] text-center">
              <span className="text-lg font-mono text-white capitalize">
                {monthLabel}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onNextMonth}
              className="text-green-400 hover:bg-green-500/10 hover:text-green-300"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onToday}
            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
          >
            Hoje
          </Button>
        </div>

        {/* Filtros e ações */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            
            <Select
              value={filters.type}
              onValueChange={(value) => 
                onFiltersChange({ ...filters, type: value as any })
              }
            >
              <SelectTrigger className="w-32 bg-black/30 border-green-500/30 text-green-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-green-500/30">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="invoice">Faturas</SelectItem>
                <SelectItem value="task">Tarefas</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={filters.status}
              onValueChange={(value) => 
                onFiltersChange({ ...filters, status: value as any })
              }
            >
              <SelectTrigger className="w-32 bg-black/30 border-green-500/30 text-green-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-green-500/30">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="overdue">Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            size="sm"
            className="bg-green-500/20 border border-green-500/40 text-green-400 hover:bg-green-500/30"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Button>
        </div>
      </div>
    </div>
  );
}
