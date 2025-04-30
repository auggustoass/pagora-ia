
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { addDays, format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

// Cores para os gráficos
const COLORS = ['#FF5733', '#33FF57', '#3357FF', '#F3FF33'];

interface StatusCount {
  status: string;
  count: number;
}

const Relatorios = () => {
  // Estado para o filtro de usuário (admin apenas)
  const [userFilter, setUserFilter] = useState<string>('all');
  
  // Estado para a data
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date()
  });
  
  // Estado para os dados do gráfico
  const [statusData, setStatusData] = useState<StatusCount[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  
  // Estado de carregamento
  const [loading, setLoading] = useState<boolean>(true);
  
  // Auth context
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    fetchData();
  }, [dateRange, userFilter, user]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const startDate = dateRange?.from || new Date();
      const endDate = dateRange?.to || new Date();
      
      // Use a Edge Function para buscar os dados agrupados por status
      const { data, error } = await supabase.functions.invoke('get_invoice_status_counts', {
        body: {
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(addDays(endDate, 1), 'yyyy-MM-dd'), // Add 1 day to include the end date
          user_filter: userFilter === 'all' ? null : userFilter
        }
      });
      
      if (error) throw error;
      
      if (data) {
        setStatusData(data.map((item: any) => ({
          status: item.status,
          count: item.count
        })));
      }
      
      // Query for monthly totals (approved invoices)
      let monthlyQuery = supabase.from('faturas')
        .select('created_at, valor')
        .eq('status', 'aprovado')
        .gte('created_at', new Date(startDate.getFullYear(), startDate.getMonth() - 6, 1).toISOString());
        
      if (!isAdmin && user) {
        monthlyQuery = monthlyQuery.eq('user_id', user.id);
      }
      
      const { data: monthlyValues, error: monthlyError } = await monthlyQuery;
      
      if (monthlyError) throw monthlyError;
      
      // Processa os dados mensais para o gráfico de barras
      const months: Record<string, number> = {};
      
      monthlyValues?.forEach(invoice => {
        const date = new Date(invoice.created_at);
        const monthKey = format(date, 'yyyy-MM');
        const monthName = format(date, 'MMM', { locale: ptBR });
        
        if (!months[monthKey]) {
          months[monthKey] = 0;
        }
        
        months[monthKey] += Number(invoice.valor);
      });
      
      const monthlyDataFormatted = Object.keys(months).sort().map(monthKey => {
        const date = new Date(monthKey);
        return {
          month: format(date, 'MMM', { locale: ptBR }),
          valor: months[monthKey]
        };
      });
      
      setMonthlyData(monthlyDataFormatted);
      
    } catch (error) {
      console.error('Erro ao buscar dados para relatórios:', error);
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
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-glow">
            <span className="text-gradient">Relatórios</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe métricas e evolução dos seus pagamentos
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Filtros */}
          <Card className="bg-black/20 border-white/10">
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>Defina o período para análise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
          
          {/* Status Chart */}
          <Card className="bg-black/20 border-white/10">
            <CardHeader>
              <CardTitle>Status das Faturas</CardTitle>
              <CardDescription>Distribuição dos status de pagamento</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Carregando dados...</p>
                </div>
              ) : statusData.length > 0 ? (
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
                <div className="flex justify-center items-center h-64">
                  <p>Não há dados para o período selecionado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Monthly Chart */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle>Faturamento Mensal</CardTitle>
            <CardDescription>Valores recebidos por mês</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p>Carregando dados...</p>
              </div>
            ) : monthlyData.length > 0 ? (
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
              <div className="flex justify-center items-center h-64">
                <p>Não há dados para o período selecionado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Relatorios;
