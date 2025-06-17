
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, LineChartIcon } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { InvoiceStatistics } from '@/types/reports';
import { LoadingSpinner } from './LoadingSpinner';
import { NoDataMessage } from './NoDataMessage';
import { exportData, formatCurrency } from '@/utils/reportUtils';

interface InvoicesTabProps {
  loading: boolean;
  invoiceStats: InvoiceStatistics | null;
  onExpandPeriod: () => void;
}

export const InvoicesTab: React.FC<InvoicesTabProps> = ({
  loading,
  invoiceStats,
  onExpandPeriod
}) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
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
            <NoDataMessage onExpandPeriod={onExpandPeriod} />
          )}
        </CardContent>
      </Card>
      
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
            <NoDataMessage onExpandPeriod={onExpandPeriod} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
