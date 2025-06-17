
import React from 'react';
import { StatusCard } from '@/components/dashboard/StatusCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, CircleDollarSign, Clock3, PieChartIcon, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { StatusCount, ClientStatistics, InvoiceStatistics } from '@/types/reports';
import { LoadingSpinner } from './LoadingSpinner';
import { NoDataMessage } from './NoDataMessage';
import { formatCurrency } from '@/utils/reportUtils';

const COLORS = ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F5', '#33FFF5', '#8E33FF'];

interface OverviewTabProps {
  loading: boolean;
  clientStats: ClientStatistics | null;
  invoiceStats: InvoiceStatistics | null;
  statusData: StatusCount[];
  monthlyData: any[];
  onExpandPeriod: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  loading,
  clientStats,
  invoiceStats,
  statusData,
  monthlyData,
  onExpandPeriod
}) => {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="Total de Clientes"
          value={clientStats?.totalClients?.toString() || "0"}
          icon={<Users size={20} />}
          variant="default"
          showProgress={false}
        />
        
        <StatusCard
          title="Total de Faturas"
          value={invoiceStats?.totalInvoices?.toString() || "0"}
          icon={<FileText size={20} />}
          variant="default"
          showProgress={false}
        />
        
        <StatusCard
          title="Valor Total"
          value={formatCurrency(invoiceStats?.totalValue || 0)}
          icon={<CircleDollarSign size={20} />}
          variant="success"
          showProgress={false}
        />
        
        <StatusCard
          title="Tempo Médio de Pagamento"
          value={`${Math.round(invoiceStats?.avgPaymentDays || 0)} dias`}
          icon={<Clock3 size={20} />}
          variant="pending"
          showProgress={false}
        />
      </div>
      
      <div className="grid gap-6 mt-6 md:grid-cols-2">
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
              <NoDataMessage onExpandPeriod={onExpandPeriod} />
            )}
          </CardContent>
        </Card>
        
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
              <NoDataMessage onExpandPeriod={onExpandPeriod} />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};
