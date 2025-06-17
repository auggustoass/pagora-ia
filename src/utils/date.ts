
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, 'dd/MM/yyyy', { locale: ptBR });
};

export const formatDateLong = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
};

export const formatDateMonth = (dateString: string): string => {
  const date = new Date(dateString + "-01");
  return format(date, 'MMM/yy', { locale: ptBR });
};

export const isOverdue = (dueDate: string): boolean => {
  const today = new Date();
  const due = new Date(dueDate);
  return due < today;
};

export const getDaysUntilDue = (dueDate: string): number => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
