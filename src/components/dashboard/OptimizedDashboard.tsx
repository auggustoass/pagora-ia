
import React, { Suspense } from 'react';
import { useOptimizedStats } from '@/hooks/use-optimized-stats';
import { useOptimizedClients } from '@/hooks/use-optimized-clients';
import { useOfflineSync } from '@/hooks/use-offline-sync';
import { CreditsDisplay } from './CreditsDisplay';
import { RevenueChart } from './charts/RevenueChart';
import { CyberHeaderSection } from './CyberHeaderSection';
import { MemoizedCyberStatsSection } from './MemoizedCyberStatsSection';
import { LazyTabsSection } from './LazyTabsSection';
import { PerformanceMonitorWidget } from './PerformanceMonitorWidget';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { ErrorBoundaryWithRecovery } from '@/components/ui/ErrorBoundaryWithRecovery';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

// Componente de loading para Suspense
const DashboardSkeleton = () => (
  <div className="min-h-screen bg-black p-6 space-y-6">
    <Skeleton className="h-16 w-full bg-green-400/10" />
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32 bg-green-400/10" />
      ))}
    </div>
    <Skeleton className="h-64 w-full bg-green-400/10" />
  </div>
);

export function OptimizedDashboard() {
  const {
    data: stats = { total: 0, pendentes: 0, aprovadas: 0, totalRecebido: 0 },
    isLoading: statsLoading,
    refetch: refetchStats
  } = useOptimizedStats();

  const {
    clients = [],
    isLoading: clientsLoading
  } = useOptimizedClients(''); // Sempre passar string vazia como padrão

  const { isOnline, pendingActions } = useOfflineSync();

  const formatCurrency = (value: number) => {
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value || 0);
    } catch (error) {
      console.warn('Error formatting currency:', error);
      return `R$ ${(value || 0).toFixed(2)}`;
    }
  };

  const handleQuickInvoiceSuccess = () => {
    refetchStats();
    toast.success('Fatura criada com sucesso!');
  };

  // Monitorar status offline
  React.useEffect(() => {
    if (!isOnline && pendingActions.length > 0) {
      toast.warning('Modo offline ativo', {
        description: `${pendingActions.length} ações pendentes para sincronização`
      });
    } else if (isOnline && pendingActions.length > 0) {
      toast.info('Sincronizando dados offline...');
    }
  }, [isOnline, pendingActions.length]);

  return (
    <ErrorBoundaryWithRecovery>
      <Suspense fallback={<DashboardSkeleton />}>
        <div className="min-h-screen bg-black relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 bg-black"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(0,255,65,0.05)_0%,transparent_25%),radial-gradient(circle_at_85%_30%,rgba(0,255,65,0.05)_0%,transparent_25%)]"></div>
          
          {/* Scan lines overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(transparent_98%,rgba(0,255,65,0.03)_100%)] bg-[length:100%_4px] animate-pulse pointer-events-none"></div>
          
          {/* Indicador offline */}
          {!isOnline && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-mono z-50">
              OFFLINE_MODE - {pendingActions.length} pending actions
            </div>
          )}
          
          <div className="relative z-10 space-y-12 p-6">
            {/* Header Section */}
            <CyberHeaderSection 
              searchTerm=""
              onSearchTermChange={() => {}}
              onQuickInvoiceSuccess={handleQuickInvoiceSuccess}
            />
            
            {/* Top Row: Credits e Performance Monitor */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CreditsDisplay />
              </div>
              <div>
                <PerformanceMonitorWidget />
              </div>
            </div>
            
            {/* Stats Cards */}
            <MemoizedCyberStatsSection 
              stats={stats}
              loading={statsLoading}
              formatCurrency={formatCurrency}
            />
            
            {/* Charts Section */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 to-transparent rounded-2xl blur-3xl"></div>
              <div className="relative">
                <ErrorBoundaryWithRecovery>
                  <RevenueChart />
                </ErrorBoundaryWithRecovery>
              </div>
            </div>
            
            {/* Tabs Section */}
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
          
          {/* Corner accents */}
          <div className="fixed top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-green-400/20 pointer-events-none"></div>
          <div className="fixed top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-green-400/20 pointer-events-none"></div>
          <div className="fixed bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-green-400/20 pointer-events-none"></div>
          <div className="fixed bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-green-400/20 pointer-events-none"></div>
          
          {/* PWA Install Prompt */}
          <PWAInstallPrompt />
        </div>
      </Suspense>
    </ErrorBoundaryWithRecovery>
  );
}
