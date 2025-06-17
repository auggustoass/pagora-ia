
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { CalendarView } from '@/components/agenda/CalendarView';
import { AgendaHeader } from '@/components/agenda/AgendaHeader';
import { EventDetailsModal } from '@/components/agenda/EventDetailsModal';
import { useCalendarNavigation } from '@/hooks/useCalendarNavigation';
import { useAgendaEvents } from '@/hooks/useAgendaEvents';
import { AgendaEvent, AgendaFilters } from '@/types/agenda';
import { ErrorBoundaryWithRecovery } from '@/components/ui/ErrorBoundaryWithRecovery';

export default function Agenda() {
  const {
    currentDate,
    monthStart,
    monthEnd,
    calendarDays,
    monthLabel,
    goToPreviousMonth,
    goToNextMonth,
    goToToday
  } = useCalendarNavigation();

  const { events, isLoading } = useAgendaEvents(monthStart, monthEnd);
  
  const [filters, setFilters] = useState<AgendaFilters>({
    type: 'all',
    status: 'all'
  });
  
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);

  // Filter events based on current filters
  const filteredEvents = events.filter(event => {
    if (filters.type !== 'all' && event.type !== filters.type) return false;
    if (filters.status !== 'all' && event.status !== filters.status) return false;
    return true;
  });

  const handleEventClick = (event: AgendaEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-green-400 text-center">
            <div className="text-xl font-mono mb-4">CARREGANDO_AGENDA...</div>
            <div className="animate-pulse">■ ■ ■</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ErrorBoundaryWithRecovery>
        <div className="min-h-screen bg-black p-6">
          <AgendaHeader
            monthLabel={monthLabel}
            onPreviousMonth={goToPreviousMonth}
            onNextMonth={goToNextMonth}
            onToday={goToToday}
            filters={filters}
            onFiltersChange={setFilters}
          />

          <CalendarView
            calendarDays={calendarDays}
            events={filteredEvents}
            currentDate={currentDate}
            onEventClick={handleEventClick}
          />

          {selectedEvent && (
            <EventDetailsModal
              event={selectedEvent}
              isOpen={!!selectedEvent}
              onClose={handleCloseModal}
            />
          )}
        </div>
      </ErrorBoundaryWithRecovery>
    </Layout>
  );
}
