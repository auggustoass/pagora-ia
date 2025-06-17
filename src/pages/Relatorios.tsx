
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { subMonths } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useAuth } from '@/components/auth/AuthProvider';
import { useReports } from '@/hooks/useReports';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { OverviewTab } from '@/components/reports/OverviewTab';
import { ClientsTab } from '@/components/reports/ClientsTab';
import { InvoicesTab } from '@/components/reports/InvoicesTab';

const Relatorios = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [userFilter, setUserFilter] = useState<string>('all');
  const { isAdmin } = useAuth();
  
  const { statusCounts, clientStats, invoiceStats, loading, refetch } = useReports({
    dateRange: dateRange && dateRange.from && dateRange.to ? {
      from: dateRange.from,
      to: dateRange.to
    } : undefined,
    userFilter: userFilter !== 'all' ? userFilter : undefined
  });

  const handleExpandPeriod = () => {
    setDateRange({
      from: subMonths(new Date(), 12),
      to: new Date(),
    });
  };

  // Generate monthly data for the chart from invoice statistics
  const monthlyData = invoiceStats?.monthlyValues?.map(item => ({
    month: item.month,
    valor: item.value
  })) || [];

  return (
    <Layout>
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Cyber background effects */}
        <div className="absolute inset-0 bg-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(0,255,65,0.05)_0%,transparent_25%),radial-gradient(circle_at_75%_75%,rgba(0,255,65,0.05)_0%,transparent_25%)]"></div>
        
        {/* Scan lines overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_98%,rgba(0,255,65,0.03)_100%)] bg-[length:100%_4px] animate-pulse pointer-events-none"></div>
        
        <div className="relative z-10 space-y-8 animate-fade-in p-6">
          <Card className="bg-black/20 border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl font-mono text-white tracking-wider">
                RELATÓRIOS_SISTEMA
              </CardTitle>
              <CardDescription>
                Análise detalhada de dados e performance
              </CardDescription>
            </CardHeader>
          </Card>

          <ReportFilters
            dateRange={dateRange}
            setDateRange={setDateRange}
            userFilter={userFilter}
            setUserFilter={setUserFilter}
            isAdmin={isAdmin}
            loading={loading}
            onRefresh={refetch}
          />

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-black/20 border border-white/10">
              <TabsTrigger value="overview" className="data-[state=active]:bg-green-500/20">
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="invoices" className="data-[state=active]:bg-green-500/20">
                Faturas
              </TabsTrigger>
              <TabsTrigger value="clients" className="data-[state=active]:bg-green-500/20">
                Clientes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OverviewTab
                loading={loading}
                clientStats={clientStats}
                invoiceStats={invoiceStats}
                statusData={statusCounts}
                monthlyData={monthlyData}
                onExpandPeriod={handleExpandPeriod}
              />
            </TabsContent>

            <TabsContent value="invoices">
              <InvoicesTab
                loading={loading}
                invoiceStats={invoiceStats}
                onExpandPeriod={handleExpandPeriod}
              />
            </TabsContent>

            <TabsContent value="clients">
              <ClientsTab
                loading={loading}
                clientStats={clientStats}
                onExpandPeriod={handleExpandPeriod}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Relatorios;
