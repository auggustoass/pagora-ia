
import React, { useState } from 'react';
import { format, isSameMonth, isToday, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AgendaEvent, CalendarDay } from '@/types/agenda';
import { EventCard } from './EventCard';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  calendarDays: Date[];
  events: AgendaEvent[];
  currentDate: Date;
  onEventClick: (event: AgendaEvent) => void;
}

export function CalendarView({ calendarDays, events, currentDate, onEventClick }: CalendarViewProps) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const getEventsForDate = (date: Date): AgendaEvent[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(event => event.date === dateStr);
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="bg-black/50 border border-green-400/20 rounded-lg backdrop-blur-sm overflow-hidden">
      {/* Header dos dias da semana */}
      <div className="grid grid-cols-7 border-b border-green-500/20">
        {weekDays.map((day) => (
          <div key={day} className="p-3 text-center">
            <span className="text-sm font-mono text-green-400 uppercase tracking-wider">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Grid do calendário */}
      <div className="grid grid-cols-7">
        {calendarDays.map((date, index) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const dayEvents = getEventsForDate(date);
          const isCurrentMonthDay = isSameMonth(date, currentDate);
          const isTodayDay = isToday(date);
          const isWeekendDay = isWeekend(date);
          const isHovered = hoveredDate === dateStr;

          return (
            <div
              key={index}
              className={cn(
                "min-h-[120px] p-2 border-r border-b border-green-500/10 transition-all duration-200 relative overflow-hidden",
                !isCurrentMonthDay && "bg-black/20 opacity-50",
                isWeekendDay && "bg-green-500/5",
                isTodayDay && "bg-green-500/10 border-green-400/30",
                isHovered && "bg-green-500/5"
              )}
              onMouseEnter={() => setHoveredDate(dateStr)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              {/* Background grid pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.02)_1px,transparent_1px)] bg-[size:10px_10px]" />
              
              {/* Day number */}
              <div className="relative flex items-center justify-between mb-2">
                <span className={cn(
                  "text-sm font-mono",
                  isTodayDay ? "text-green-400 font-bold" : "text-gray-300",
                  !isCurrentMonthDay && "text-gray-600"
                )}>
                  {format(date, 'd')}
                </span>
                
                {dayEvents.length > 0 && (
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    dayEvents.some(e => e.status === 'overdue') ? "bg-red-400 animate-pulse" :
                    dayEvents.some(e => e.priority === 'high') ? "bg-yellow-400" :
                    "bg-green-400"
                  )} />
                )}
              </div>

              {/* Events */}
              <div className="relative space-y-1 max-h-[80px] overflow-y-auto scrollbar-none">
                {dayEvents.slice(0, 3).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={onEventClick}
                  />
                ))}
                
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-400 font-mono text-center py-1 bg-black/30 rounded">
                    +{dayEvents.length - 3} mais
                  </div>
                )}
              </div>

              {/* Today indicator */}
              {isTodayDay && (
                <div className="absolute top-1 right-1 w-1 h-1 bg-green-400 rounded-full animate-pulse" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
