
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { addDays, format, formatDistanceToNow, parseISO, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
  AreaChart, Area, ComposedChart
} from 'recharts';
import {
  ArrowDown, ArrowUp, Calendar, CircleDollarSign, Clock3, PercentIcon,
  Trash, Users, FileText, Download, BarChart2, PieChartIcon, LineChartIcon,
  AlertCircle, Loader2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusCard } from '@/components/dashboard/StatusCard';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ClientStatistics, InvoiceStatistics } from '@/components/chat/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Cores para os gráficos
const COLORS = ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F5', '#33FFF5', '#8E33FF'];

interface StatusCount {
  status: string;
  count: number;
}

const Relatorios = () => {
  // Estado para o filtro de usuário (admin apenas)
  const [userFilter, setUserFilter] = useState<string>('all');
  
  // Estado para a data
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 12), // Expandir para 12 meses para ter mais chance de dados
    to: new Date()
  });
  
  // Estado para os dados do gráfico
  const [statusData, setStatusData] = useState<StatusCount[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  
  // Estado para novos dados de estatísticas
  const [clientStats, setClientStats] = useState<ClientStatistics | null>(null);
  const [invoiceStats, setInvoiceStats] = useState<InvoiceStatistics | null>(null);
  
  // Estado de carregamento
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Tab ativa
  const [activeTab, setActiveTab] = useState<string>('geral');
  
  // Auth context
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    fetchData();
  }, [dateRange, userFilter, user]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Prepara dados comuns para todas as chamadas
      const startDate = dateRange?.from || subMonths(new Date(), 12);
      const endDate = dateRange?.to || new Date();
      const requestData = {
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(addDays(endDate, 1), 'yyyy-MM-dd'), // Add 1 day to include the end date
        user_filter: userFilter === 'all' ? null : userFilter
      };
      
      console.log('Fetching data with parameters:', requestData);
      
      // 1. Buscar dados de status de faturas
      try {
        const { data: statusData, error: statusError } = await supabase.functions.invoke(
          'get_invoice_status_counts', 
          { body: requestData }
        );
        
        console.log('Status data response:', statusData, statusError);
        
        if (statusError) throw statusError;
        if (statusData) {
          setStatusData(statusData);
        }
      } catch (statusErr) {
        console.error('Error fetching status counts:', statusErr);
        toast.error('Erro ao buscar dados de status de faturas');
      }
      
      // 2. Buscar estatísticas de clientes
      try {
        const { data: clientData, error: clientError } = await supabase.functions.invoke(
          'get_client_statistics',
          { body: requestData }
        );
        
        console.log('Client data response:', clientData, clientError);
        
        if (clientError) throw clientError;
        if (clientData) {
          setClientStats(clientData);
        }
      } catch (clientErr) {
        console.error('Error fetching client statistics:', clientErr);
        toast.error('Erro ao buscar estatísticas de clientes');
      }
      
      // 3. Buscar estatísticas de faturas
      try {
        const { data: invoiceData, error: invoiceError } = await supabase.functions.invoke(
          'get_invoice_statistics',
          { body: requestData }
        );
        
        console.log('Invoice data response:', invoiceData, invoiceError);
        
        if (invoiceError) throw invoiceError;
        if (invoiceData) {
          setInvoiceStats(invoiceData);
          
          // Formatar dados mensais para o gráfico
          if (invoiceData.monthlyValues && invoiceData.monthlyValues.length > 0) {
            const monthlyDataFormatted = invoiceData.monthlyValues.map(item => ({
              month: format(new Date(item.month + "-01"), 'MMM', { locale: ptBR }),
              valor: item.value
            }));
            
            setMonthlyData(monthlyDataFormatted.sort((a, b) => {
              const monthA = new Date(a.month + "-01").getTime();
              const monthB = new Date(b.month + "-01").getTime();
              return monthA - monthB;
            }));
          } else {
            setMonthlyData([]);
          }
        }
      } catch (invoiceErr) {
        console.error('Error fetching invoice statistics:', invoiceErr);
        toast.error('Erro ao buscar estatísticas de faturas');
      }
      
    } catch (error) {
      console.error('Erro ao buscar dados para relatórios:', error);
      setError('Falha ao carregar dados. Tente novamente mais tarde.');
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };
  
  // Função para formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  // Função para exportar dados em CSV
  const exportData = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast.error('Não há dados para exportar');
      return;
    }
    
    // Transformar dados em CSV
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => Object.values(item).join(','));
    const csv = [headers, ...rows].join('\n');
    
    // Criar e baixar arquivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Relatório ${filename} exportado com sucesso`);
  };
  
  // Componente para exibir quando não há dados
  const NoDataMessage = ({ message = "Não há dados para o período selecionado" }) => (
    <div className="flex flex-col justify-center items-center h-64 text-center p-4">
      <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
      <p className="text-muted-foreground">{message}</p>
      <Button 
        className="mt-4" 
        variant="outline"
        onClick={() => {
          setDateRange({
            from: subMonths(new Date(), 12),
            to: new Date()
          });
          toast.info('Período expandido para os últimos 12 meses');
        }}
      >
        Expandir período (12 meses)
      </Button>
    </div>
  );
  
  // Componente de carregamento
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin mr-2" />
      <p>Carregando dados...</p>
    </div>
  );
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-glow">
            <span className="text-gradient">Relatórios</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe métricas e evolução dos seus clientes e faturamento
          </p>
        </div>
        
        {/* Filtros */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Defina o período para análise</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium block mb-2">Período</label>
                <DatePickerWithRange 
                  date={dateRange} 
                  setDate={setDateRange} 
                />
              </div>
              
              {isAdmin && (
                <div>
                  <label className="text-sm font-medium block mb-2">Usuário</label>
                  <Select 
                    value={userFilter} 
                    onValueChange={setUserFilter}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Selecione um usuário" />
                    </SelectTrigger>
                    <SelectContent className="bg-pagora-dark border-white/10">
                      <SelectGroup>
                        <SelectItem value="all">Todos</SelectItem>
                        {/* Idealmente aqui teria uma lista de usuários */}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={fetchData}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Atualizar dados
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Tabs para navegar entre relatórios */}
        <Tabs defaultValue="geral" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-black/20 border-white/10 mb-6">
            <TabsTrigger className="flex-1" value="geral">Visão Geral</TabsTrigger>
            <TabsTrigger className="flex-1" value="clientes">Clientes</TabsTrigger>
            <TabsTrigger className="flex-1" value="faturas">Faturas</TabsTrigger>
          </TabsList>
          
          {/* Tab Visão Geral */}
          <TabsContent value="geral">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Card de Total de Clientes */}
              <StatusCard
                title="Total de Clientes"
                value={clientStats?.totalClients?.toString() || "0"}
                icon={<Users size={20} />}
                variant="default"
                showProgress={false}
              />
              
              {/* Card de Total de Faturas */}
              <StatusCard
                title="Total de Faturas"
                value={invoiceStats?.totalInvoices?.toString() || "0"}
                icon={<FileText size={20} />}
                variant="default"
                showProgress={false}
              />
              
              {/* Card de Valor Total */}
              <StatusCard
                title="Valor Total"
                value={formatCurrency(invoiceStats?.totalValue || 0)}
                icon={<CircleDollarSign size={20} />}
                variant="success"
                showProgress={false}
              />
              
              {/* Card de Tempo Médio de Pagamento */}
              <StatusCard
                title="Tempo Médio de Pagamento"
                value={`${Math.round(invoiceStats?.avgPaymentDays || 0)} dias`}
                icon={<Clock3 size={20} />}
                variant="pending"
                showProgress={false}
              />
            </div>
            
            <div className="grid gap-6 mt-6 md:grid-cols-2">
              {/* Status Chart */}
              <Card className="bg-black/20 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Status das Faturas</CardTitle>
                    <CardDescription>Distribuição dos status de pagamento</CardDescription>
                  </div>
                  <PieChartIcon className="text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <LoadingSpinner />
                  ) : statusData && statusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="status"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip formatter={(value) => [`${value} faturas`, 'Quantidade']} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <NoDataMessage />
                  )}
                </CardContent>
              </Card>
              
              {/* Monthly Chart */}
              <Card className="bg-black/20 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Faturamento Mensal</CardTitle>
                    <CardDescription>Valores recebidos por mês</CardDescription>
                  </div>
                  <BarChart2 className="text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <LoadingSpinner />
                  ) : monthlyData && monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={monthlyData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={tick => formatCurrency(tick)} />
                        <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Valor']} />
                        <Legend />
                        <Bar dataKey="valor" fill="#8884d8" name="Valor recebido" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <NoDataMessage />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Tab Clientes */}
          <TabsContent value="clientes">
            <div className="grid gap-6">
              {/* Crescimento de Clientes */}
              <Card className="bg-black/20 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Crescimento de Clientes</CardTitle>
                    <CardDescription>Evolução mensal de novos clientes</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => clientStats?.monthlyGrowth && exportData(clientStats.monthlyGrowth, 'crescimento-clientes')}
                      disabled={!clientStats?.monthlyGrowth || clientStats.monthlyGrowth.length === 0}
                    >
                      <Download size={16} className="mr-2" />
                      Exportar
                    </Button>
                    <LineChartIcon className="text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <LoadingSpinner />
                  ) : clientStats?.monthlyGrowth && clientStats.monthlyGrowth.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart
                        data={clientStats.monthlyGrowth.map(item => ({
                          ...item,
                          month: format(new Date(item.month + "-01"), 'MMM/yy', { locale: ptBR })
                        }))}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="count" name="Novos Clientes" stroke="#8884d8" fill="#8884d8" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <NoDataMessage />
                  )}
                </CardContent>
              </Card>
              
              {/* Top Clientes */}
              <Card className="bg-black/20 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Top 10 Clientes</CardTitle>
                    <CardDescription>Clientes com maior valor em faturas</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => clientStats?.topClients && exportData(clientStats.topClients, 'top-clientes')}
                    disabled={!clientStats?.topClients || clientStats.topClients.length === 0}
                  >
                    <Download size={16} className="mr-2" />
                    Exportar
                  </Button>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <LoadingSpinner />
                  ) : clientStats?.topClients && clientStats.topClients.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead className="text-right">Valor Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clientStats.topClients.map((client) => (
                            <TableRow key={client.id}>
                              <TableCell>{client.nome}</TableCell>
                              <TableCell className="text-right">{formatCurrency(client.total)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <NoDataMessage />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Tab Faturas */}
          <TabsContent value="faturas">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Valor médio mensal */}
              <Card className="bg-black/20 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Valor Médio de Faturas</CardTitle>
                    <CardDescription>Evolução mensal do valor médio</CardDescription>
                  </div>
                  <LineChartIcon className="text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <LoadingSpinner />
                  ) : invoiceStats?.monthlyValues && invoiceStats.monthlyValues.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart
                        data={invoiceStats.monthlyValues.map(item => ({
                          ...item,
                          month: format(new Date(item.month + "-01"), 'MMM/yy', { locale: ptBR }),
                          average: invoiceStats.totalInvoices > 0 ? item.value / invoiceStats.totalInvoices : 0
                        }))}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={tick => formatCurrency(tick)} />
                        <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Valor Médio']} />
                        <Legend />
                        <Line type="monotone" dataKey="average" name="Valor Médio" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <NoDataMessage />
                  )}
                </CardContent>
              </Card>
              
              {/* Distribuição por faixa de valor */}
              <Card className="bg-black/20 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Distribuição por Faixa de Valor</CardTitle>
                    <CardDescription>Quantidade de faturas por faixa</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => invoiceStats?.valueRanges && exportData(invoiceStats.valueRanges, 'faixas-valor')}
                    disabled={!invoiceStats?.valueRanges || invoiceStats.valueRanges.length === 0}
                  >
                    <Download size={16} className="mr-2" />
                    Exportar
                  </Button>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <LoadingSpinner />
                  ) : invoiceStats?.valueRanges && invoiceStats.valueRanges.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={invoiceStats.valueRanges}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} faturas`, 'Quantidade']} />
                        <Legend />
                        <Bar dataKey="count" name="Quantidade" fill="#FF5733" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <NoDataMessage />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Relatorios;
