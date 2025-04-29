import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { PieChart, BarChart3, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface StatusCount {
  status: string;
  count: number;
}

interface MonthlyTotal {
  month: string;
  total: number;
}

const Relatorios = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '365d'>('30d');
  const [statusData, setStatusData] = useState<StatusCount[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  // Colors for pie chart
  const STATUS_COLORS = {
    pendente: '#FFB547',
    aprovado: '#10B981',
    cancelado: '#EF4444'
  };

  // Mapping status to display names
  const STATUS_NAMES = {
    pendente: 'Pendente',
    aprovado: 'Aprovado',
    cancelado: 'Cancelado'
  };

  useEffect(() => {
    if (user) {
      fetchReportData();
    }
  }, [user, timeRange, isAdmin]);

  const fetchReportData = async () => {
    setLoading(true);
    
    try {
      // Calculate date range based on selection
      const endDate = new Date();
      const startDate = new Date();
      
      switch(timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '365d':
          startDate.setDate(endDate.getDate() - 365);
          break;
      }
      
      // Query for status counts
      const statusQuery = supabase
        .from('faturas')
        .select('status, count', { count: 'exact' })
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
        
      // Apply user filter if not admin
      let statusQueryFiltered = statusQuery;
      if (!isAdmin && user) {
        statusQueryFiltered = statusQuery.filter('user_id', 'eq', user.id);
      }
      
      // Execute the query with group by using separate SQL query
      const { data: statusCounts, error: statusError } = await supabase.rpc(
        'get_invoice_status_counts', 
        { 
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          user_filter: !isAdmin && user ? user.id : null
        }
      );
      
      if (statusError) {
        console.error('Status error:', statusError);
        throw statusError;
      }
      
      // Format status data for the pie chart
      const formattedStatusData = statusCounts?.map((item: any) => ({
        status: item.status,
        count: parseInt(item.count, 10)
      })) || [];
      
      // Add missing statuses with count 0
      const allStatuses = ['pendente', 'aprovado', 'cancelado'];
      const existingStatuses = formattedStatusData.map(item => item.status);
      
      allStatuses.forEach(status => {
        if (!existingStatuses.includes(status)) {
          formattedStatusData.push({ status, count: 0 });
        }
      });
      
      setStatusData(formattedStatusData);
      
      // Query for monthly totals (approved invoices)
      let monthlyQuery = supabase.from('faturas')
        .select('created_at, valor')
        .filter('status', 'eq', 'aprovado')
        .gte('created_at', new Date(startDate.getFullYear(), startDate.getMonth() - 6, 1).toISOString());
        
      if (!isAdmin && user) {
        monthlyQuery = monthlyQuery.filter('user_id', 'eq', user.id);
      }
      
      const { data: monthlyValues, error: monthlyError } = await monthlyQuery;
      
      if (monthlyError) {
        throw monthlyError;
      }
      
      // Process monthly data
      const monthlyMap = new Map<string, number>();
      const now = new Date();
      
      // Initialize past 6 months with 0 values
      for (let i = 6; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = month.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
        monthlyMap.set(monthKey, 0);
      }
      
      // Add values from database
      monthlyValues?.forEach(invoice => {
        const date = new Date(invoice.created_at);
        const monthKey = date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
        
        if (monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + Number(invoice.valor));
        }
      });
      
      // Convert map to array for the chart
      const formattedMonthlyData = Array.from(monthlyMap.entries()).map(([month, total]) => ({
        month,
        total
      }));
      
      setMonthlyData(formattedMonthlyData);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/80 p-3 rounded border border-white/10 shadow-lg">
          <p className="text-sm font-medium">Status: {STATUS_NAMES[data.status as keyof typeof STATUS_NAMES]}</p>
          <p className="text-sm">Quantidade: {data.count}</p>
        </div>
      );
    }
    return null;
  };
  
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 p-3 rounded border border-white/10 shadow-lg">
          <p className="text-sm font-medium">Mês: {payload[0].payload.month}</p>
          <p className="text-sm">Total: {formatCurrency(payload[0].payload.total)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-glow">
            <span className="text-gradient">Relatórios</span>
          </h1>
          <p className="text-muted-foreground">Visualize estatísticas e relatórios das suas cobranças.</p>
        </div>
        
        <div className="flex justify-between items-center">
          <Tabs defaultValue="overview" className="w-auto">
            <TabsList className="bg-black/20 border border-white/10">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="detailed">Detalhado</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
              <SelectTrigger className="w-[180px] bg-white/5 border-white/10">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="365d">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs defaultValue="overview">
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <PieChart className="h-5 w-5" />
                    Status de Pagamentos
                  </CardTitle>
                  <CardDescription>
                    Distribuição de faturas por status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    {loading ? (
                      <p className="text-muted-foreground">Carregando dados...</p>
                    ) : statusData.some(item => item.count > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="status"
                            label={({ name, percent }) => `${STATUS_NAMES[name as keyof typeof STATUS_NAMES]} ${(percent * 100).toFixed(0)}%`}
                          >
                            {statusData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || '#777777'} 
                              />
                            ))}
                          </Pie>
                          <Legend formatter={(value) => STATUS_NAMES[value as keyof typeof STATUS_NAMES]} />
                          <Tooltip content={<CustomTooltip />} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted-foreground">Nenhum dado disponível para o período selecionado.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5" />
                    Valores Recebidos
                  </CardTitle>
                  <CardDescription>
                    Total recebido por período
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    {loading ? (
                      <p className="text-muted-foreground">Carregando dados...</p>
                    ) : monthlyData.some(item => item.total > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={monthlyData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <XAxis dataKey="month" />
                          <YAxis 
                            tickFormatter={(value) => formatCurrency(value).replace('R$', '')}
                            width={50}
                          />
                          <Tooltip content={<CustomBarTooltip />} />
                          <Bar dataKey="total" fill="#10B981" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted-foreground">Nenhum dado disponível para o período selecionado.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="detailed" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Relatórios Detalhados</CardTitle>
                <CardDescription>Relatórios exportáveis e análises detalhadas estarão disponíveis em breve.</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground">Funcionalidade em desenvolvimento. Disponível em breve.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Relatorios;
