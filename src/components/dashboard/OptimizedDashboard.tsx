
import React from 'react';
import { useOptimizedStats } from '@/hooks/use-optimized-stats';
import { useOptimizedClients } from '@/hooks/use-optimized-clients';
import { useOfflineSync } from '@/hooks/use-offline-sync';
import { CreditsDisplay } from './CreditsDisplay';
import { UpcomingEvents } from './UpcomingEvents';
import { CyberHeaderSection } from './CyberHeaderSection';
import { MemoizedCyberStatsSection } from './MemoizedCyberStatsSection';
import { LazyTabsSection } from './LazyTabsSection';
import { PerformanceMonitorWidget } from './PerformanceMonitorWidget';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { ErrorBoundaryWithRecovery } from '@/components/ui/ErrorBoundaryWithRecovery';
import { toast } from 'sonner';

export function OptimizedDashboard() {
  const {
    data: stats = { total: 0, pendentes: 0, aprovadas: 0, totalRecebido: 0 },
    isLoading: statsLoading,
    refetch: refetchStats
  } = useOptimizedStats();

  const {
    clients,
    isLoading: clientsLoading
  } = useOptimizedClients();

  const { isOnline, pendingActions } = useOfflineSync();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleQuickInvoiceSuccess = () => {
    refetchStats();
    toast.success('Fatura criada com sucesso!');
  };

  React.useEffect(() => {
    if (!isOnline) {
      toast.warning('Modo offline ativo', {
        description: `${pendingActions.length} ações pendentes para sincronização`
      });
    } else if (pendingActions.length > 0) {
      toast.info('Sincronizando dados offline...');
    }
  }, [isOnline, pendingActions.length]);

  return (
    <ErrorBoundaryWithRecovery>
      <div className="min-h-screen bg-background">
        {!isOnline && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-warning text-warning-foreground px-4 py-2 rounded-lg text-sm font-medium z-50">
            Modo Offline - {pendingActions.length} ações pendentes
          </div>
        )}
        
        <div className="space-y-8 p-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold title-blue">Dashboard Financeiro</h1>
            <p className="text-subtle">Gerencie suas faturas e clientes</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CreditsDisplay />
            </div>
            <div>
              <PerformanceMonitorWidget />
            </div>
          </div>
          
          <MemoizedCyberStatsSection 
            stats={stats}
            loading={statsLoading}
            formatCurrency={formatCurrency}
          />
          
          <div className="minimal-card p-6">
            <UpcomingEvents />
          </div>
          
          <LazyTabsSection
            clients={clients}
            loading={clientsLoading}
            searchTerm=""
            currentPage={1}
            itemsPerPage={10}
            selectedClientId={null}
            editClientDialogOpen={false}
            onEditClient={() => {}}
            onPageChange={() => {}}
            onEditClientDialogChange={() => {}}
            onEditClientSuccess={() => {}}
          />
        </div>
        
        <PWAInstallPrompt />
      </div>
    </ErrorBoundaryWithRecovery>
  );
}
