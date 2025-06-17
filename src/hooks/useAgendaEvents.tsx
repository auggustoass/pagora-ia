
import { useMemo } from 'react';
import { useInvoices } from '@/hooks/useInvoices';
import { useSupabaseTasks } from '@/hooks/useSupabaseTasks';
import { AgendaEvent } from '@/types/agenda';
import { format, isAfter, isToday } from 'date-fns';

export function useAgendaEvents(monthStart: Date, monthEnd: Date) {
  const { invoices, isLoading: invoicesLoading } = useInvoices();
  const { tasks, loading: tasksLoading } = useSupabaseTasks();

  const events = useMemo(() => {
    const agendaEvents: AgendaEvent[] = [];

    // Processar faturas
    if (invoices) {
      invoices.forEach(invoice => {
        try {
          const dueDate = new Date(invoice.vencimento);
          if (isNaN(dueDate.getTime())) {
            console.warn('Invalid invoice due date:', invoice.vencimento);
            return;
          }
          
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
        } catch (error) {
          console.error('Error processing invoice for agenda:', error, invoice);
        }
      });
    }

    // Processar tarefas - com fallback caso o hook não esteja disponível
    if (tasks && typeof tasks === 'object') {
      try {
        Object.values(tasks).forEach(task => {
          if (task.due_date) {
            try {
              const dueDate = new Date(task.due_date);
              if (isNaN(dueDate.getTime())) {
                console.warn('Invalid task due date:', task.due_date);
                return;
              }
              
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
            } catch (error) {
              console.error('Error processing task date:', error, task);
            }
          }
        });
      } catch (error) {
        console.error('Error processing tasks for agenda:', error);
      }
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
