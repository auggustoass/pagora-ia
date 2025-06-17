
import React from 'react';
import { useAgendaEvents } from '@/hooks/useAgendaEvents';
import { AgendaEvent } from '@/types/agenda';
import { Calendar, Clock, FileText, CheckSquare, AlertTriangle } from 'lucide-react';
import { format, addDays, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '@/utils/currency';
import { useNavigate } from 'react-router-dom';

export function UpcomingEvents() {
  const navigate = useNavigate();
  const today = new Date();
  const nextWeek = addDays(today, 7);
  
  const { events, isLoading } = useAgendaEvents(today, nextWeek);

  // Get the next 6 most urgent events
  const upcomingEvents = events.slice(0, 6);

  const getEventIcon = (event: AgendaEvent) => {
    if (event.type === 'invoice') {
      return <FileText className="w-4 h-4" />;
    }
    return <CheckSquare className="w-4 h-4" />;
  };

  const getStatusIcon = (event: AgendaEvent) => {
    switch (event.status) {
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'completed':
        return <CheckSquare className="w-4 h-4 text-green-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'HOJE';
    if (isTomorrow(date)) return 'AMANHÃ';
    return format(date, 'dd/MM', { locale: ptBR }).toUpperCase();
  };

  const handleEventClick = (event: AgendaEvent) => {
    navigate('/agenda');
  };

  if (isLoading) {
    return (
      <div className="relative bg-black border border-green-500/20 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-green-400 text-center">
              <div className="text-lg font-mono mb-4">LOADING_EVENTS...</div>
              <div className="animate-pulse">■ ■ ■</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-black border border-green-500/20 rounded-2xl overflow-hidden group hover:border-green-400/30 transition-all duration-500">
      {/* Cyber grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
      
      <div className="relative p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-transparent animate-pulse"></div>
            <div>
              <h3 className="text-xl font-mono font-bold text-white tracking-wider">UPCOMING_EVENTS</h3>
              <p className="text-green-400/70 text-sm font-mono tracking-widest">// NEXT_7_DAYS_PROTOCOL</p>
            </div>
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-400" />
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-mono text-green-400 tracking-wider">ACTIVE</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-green-400/30 mx-auto mb-4" />
              <p className="text-green-400/70 font-mono tracking-wider">NO_UPCOMING_EVENTS</p>
              <p className="text-gray-500 text-sm font-mono mt-2">// SYSTEM_CLEAR</p>
            </div>
          ) : (
            upcomingEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => handleEventClick(event)}
                className="group/item relative overflow-hidden rounded-lg p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] border border-green-500/20 hover:border-green-400/40 bg-black/40 hover:bg-green-500/5"
              >
                {/* Scan line effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent -translate-x-full group-hover/item:translate-x-full transition-transform duration-1000"></div>
                
                <div className="relative flex items-center gap-4">
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <div className="text-green-400">
                      {getEventIcon(event)}
                    </div>
                    {getStatusIcon(event)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-white font-mono text-sm truncate tracking-wider">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs font-mono text-green-400 tracking-widest">
                        {getDateLabel(event.date)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400 truncate font-mono">
                        {event.description || event.clientName || '// NO_DESCRIPTION'}
                      </div>
                      
                      {event.amount && (
                        <div className="text-xs text-green-400 font-mono font-bold">
                          {formatCurrency(event.amount)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Priority indicator */}
                  {event.priority === 'high' && (
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  )}
                </div>
                
                {/* Corner cuts */}
                <div className="absolute top-0 left-0 w-2 h-2 bg-black transform rotate-45 -translate-x-1 -translate-y-1"></div>
                <div className="absolute top-0 right-0 w-2 h-2 bg-black transform rotate-45 translate-x-1 -translate-y-1"></div>
              </div>
            ))
          )}
        </div>
        
        {/* Footer with view all button */}
        <div className="mt-6 pt-4 border-t border-green-500/20">
          <button
            onClick={() => navigate('/agenda')}
            className="w-full bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/20 hover:border-green-400/50 transition-all duration-300 font-mono text-sm tracking-wider uppercase overflow-hidden group/btn relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
            <div className="relative flex items-center justify-center gap-2">
              <Calendar size={16} />
              VIEW_ALL_EVENTS
            </div>
          </button>
        </div>
      </div>
      
      {/* Corner cuts */}
      <div className="absolute top-0 left-0 w-4 h-4 bg-black transform rotate-45 -translate-x-2 -translate-y-2"></div>
      <div className="absolute top-0 right-0 w-4 h-4 bg-black transform rotate-45 translate-x-2 -translate-y-2"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 bg-black transform rotate-45 -translate-x-2 translate-y-2"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 bg-black transform rotate-45 translate-x-2 translate-y-2"></div>
    </div>
  );
}
