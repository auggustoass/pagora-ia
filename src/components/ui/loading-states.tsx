
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Carregando...", 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className={`${sizeClasses[size]} animate-spin mr-2`} />
      <p>{message}</p>
    </div>
  );
};

interface LoadingRowProps {
  columns: number;
}

export const LoadingTableRow: React.FC<LoadingRowProps> = ({ columns }) => (
  <tr>
    <td colSpan={columns} className="px-6 py-12 text-center text-gray-400">
      <LoadingSpinner message="Carregando dados..." />
    </td>
  </tr>
);

interface EmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  message = "Nenhum item encontrado", 
  icon,
  action 
}) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {icon && <div className="mb-4 text-gray-500">{icon}</div>}
    <p className="text-gray-400 mb-4">{message}</p>
    {action}
  </div>
);
