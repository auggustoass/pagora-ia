
import React from 'react';
import { Check, Clock, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvoiceStatusBadgeProps {
  status: 'pendente' | 'aprovado' | 'rejeitado';
}

export const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    pendente: {
      color: 'bg-gradient-to-r from-gray-500/20 to-gray-400/20 text-gray-300 border border-gray-500/30',
      icon: <Clock className="w-3 h-3" />,
      label: 'Pendente'
    },
    aprovado: {
      color: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30',
      icon: <Check className="w-3 h-3" />,
      label: 'Aprovado'
    },
    rejeitado: {
      color: 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 border border-red-500/30',
      icon: <Ban className="w-3 h-3" />,
      label: 'Rejeitado'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={cn('flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm', config.color)}>
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
};
