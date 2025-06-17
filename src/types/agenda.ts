
export interface AgendaEvent {
  id: string;
  title: string;
  date: string;
  type: 'invoice' | 'task';
  status: 'pending' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  data: any; // dados originais da fatura ou tarefa
  color: string;
  description?: string;
  amount?: number;
  clientName?: string;
}

export interface CalendarDay {
  date: Date;
  events: AgendaEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

export interface AgendaFilters {
  type: 'all' | 'invoice' | 'task';
  status: 'all' | 'pending' | 'completed' | 'overdue';
}
