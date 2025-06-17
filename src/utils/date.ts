
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

// New functions to handle date-only values without timezone issues
export const formatDateForDatabase = (date: Date): string => {
  // Format date as YYYY-MM-DD without timezone conversion
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDateFromDatabase = (dateString: string): Date => {
  // Parse YYYY-MM-DD as local date without timezone conversion
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const createLocalDate = (dateString: string): Date => {
  // Create a date object from YYYY-MM-DD string in local timezone
  if (dateString.includes('T')) {
    // If it's already an ISO string, parse it normally
    return parseISO(dateString);
  }
  // If it's a date-only string, create local date
  return parseDateFromDatabase(dateString);
};
