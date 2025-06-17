
import { useMemo } from 'react';
import { useInvoices } from '@/hooks/useInvoices';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import { AgendaEvent } from '@/types/agenda';
import { format, isAfter, isBefore, isToday } from 'date-fns';

export function useAgendaEvents(monthStart: Date, monthEnd: Date) {
  const { invoices, isLoading: invoicesLoading } = useInvoices();
  const { tasks, loading: tasksLoading } = useSupabaseTasks();

  const events = useMemo(() => {
    const agendaEvents: AgendaEvent[] = [];

    // Processar faturas
    if (invoices) {
      invoices.forEach(invoice => {
        const dueDate = new Date(invoice.vencimento);
        if (dueDate >= monthStart && dueDate <= monthEnd) {
          const isOverdue = isAfter(new Date(), dueDate) && invoice.status === 'pendente';
          
          agendaEvents.push({
            id: `invoice-${invoice.id}`,
            title: `Fatura - ${invoice.nome}`,
            date: format(dueDate, 'yyyy-MM-dd'),
            type: 'invoice',
            status: invoice.status === 'aprovado' ? 'completed' : isOverdue ? 'overdue' : 'pending',
            priority: isOverdue ? 'high' : isToday(dueDate) ? 'medium' : 'low',
            data: invoice,
            color: invoice.status === 'aprovado' ? '#22c55e' : isOverdue ? '#ef4444' : '#f59e0b',
            description: invoice.descricao,
            amount: Number(invoice.valor),
            clientName: invoice.nome
          });
        }
      });
    }

    // Processar tarefas
    if (tasks) {
      Object.values(tasks).forEach(task => {
        if (task.due_date) {
          const dueDate = new Date(task.due_date);
          if (dueDate >= monthStart && dueDate <= monthEnd) {
            const isCompleted = task.column_id === 'done';
            const isOverdue = isAfter(new Date(), dueDate) && !isCompleted;
            
            agendaEvents.push({
              id: `task-${task.id}`,
              title: `Tarefa - ${task.title}`,
              date: format(dueDate, 'yyyy-MM-dd'),
              type: 'task',
              status: isCompleted ? 'completed' : isOverdue ? 'overdue' : 'pending',
              priority: isOverdue ? 'high' : isToday(dueDate) ? 'medium' : 'low',
              data: task,
              color: isCompleted ? '#22c55e' : isOverdue ? '#ef4444' : '#3b82f6',
              description: task.description
            });
          }
        }
      });
    }

    // Ordenar eventos por data e prioridade
    return agendaEvents.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [invoices, tasks, monthStart, monthEnd]);

  return {
    events,
    isLoading: invoicesLoading || tasksLoading
  };
}
