
import React from 'react';
import { useOptimizedStats } from '@/hooks/use-optimized-stats';
import { useOptimizedClients } from '@/hooks/use-optimized-clients';
import { CreditsDisplay } from './CreditsDisplay';
import { RevenueChart } from './charts/RevenueChart';
import { CyberHeaderSection } from './CyberHeaderSection';
import { MemoizedCyberStatsSection } from './MemoizedCyberStatsSection';
import { LazyTabsSection } from './LazyTabsSection';

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleQuickInvoiceSuccess = () => {
    refetchStats();
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Cyber background elements */}
      <div className="absolute inset-0 bg-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,rgba(0,255,65,0.05)_0%,transparent_25%),radial-gradient(circle_at_85%_30%,rgba(0,255,65,0.05)_0%,transparent_25%)]"></div>
      
      {/* Scan lines overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_98%,rgba(0,255,65,0.03)_100%)] bg-[length:100%_4px] animate-pulse pointer-events-none"></div>
      
      <div className="relative z-10 space-y-12 p-6">
        {/* Header Section */}
        <CyberHeaderSection 
          searchTerm=""
          onSearchTermChange={() => {}}
          onQuickInvoiceSuccess={handleQuickInvoiceSuccess}
        />
        
        {/* Credits Display */}
        <div className="relative">
          <CreditsDisplay />
        </div>
        
        {/* Stats Cards - Now memoized for better performance */}
        <MemoizedCyberStatsSection 
          stats={stats}
          loading={statsLoading}
          formatCurrency={formatCurrency}
        />
        
        {/* Charts Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 to-transparent rounded-2xl blur-3xl"></div>
          <div className="relative">
            <RevenueChart />
          </div>
        </div>
        
        {/* Tabs Section with lazy loading */}
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
    </div>
  );
}
