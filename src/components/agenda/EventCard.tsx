
import React from 'react';
import { AgendaEvent } from '@/types/agenda';
import { FileText, CheckSquare, AlertTriangle, Clock } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

interface EventCardProps {
  event: AgendaEvent;
  onClick: (event: AgendaEvent) => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
  const getIcon = () => {
    if (event.type === 'invoice') {
      return <FileText className="w-3 h-3" />;
    }
    return <CheckSquare className="w-3 h-3" />;
  };

  const getStatusIcon = () => {
    switch (event.status) {
      case 'completed':
        return <CheckSquare className="w-3 h-3 text-green-400" />;
      case 'overdue':
        return <AlertTriangle className="w-3 h-3 text-red-400" />;
      default:
        return <Clock className="w-3 h-3 text-yellow-400" />;
    }
  };

  return (
    <div
      onClick={() => onClick(event)}
      className="group relative overflow-hidden rounded-md p-2 mb-1 cursor-pointer transition-all duration-200 hover:scale-[1.02] border"
      style={{
        backgroundColor: `${event.color}20`,
        borderColor: `${event.color}40`
      }}
    >
      {/* Scan line effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
        style={{ background: `linear-gradient(to right, transparent, ${event.color}40, transparent)` }}
      />
      
      <div className="relative flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5" style={{ color: event.color }}>
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            {getStatusIcon()}
            <span className="text-xs font-mono text-white truncate">
              {event.title}
            </span>
          </div>
          
          {event.amount && (
            <div className="text-xs text-gray-300 font-mono">
              {formatCurrency(event.amount)}
            </div>
          )}
          
          {event.description && (
            <div className="text-xs text-gray-400 truncate mt-1">
              {event.description}
            </div>
          )}
        </div>
        
        {/* Priority indicator */}
        {event.priority === 'high' && (
          <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0 animate-pulse" />
        )}
      </div>
      
      {/* Corner cuts */}
      <div className="absolute top-0 left-0 w-1 h-1 bg-black transform rotate-45 -translate-x-0.5 -translate-y-0.5" />
      <div className="absolute top-0 right-0 w-1 h-1 bg-black transform rotate-45 translate-x-0.5 -translate-y-0.5" />
    </div>
  );
}
