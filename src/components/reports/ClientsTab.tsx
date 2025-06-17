
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Download, LineChartIcon } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ClientStatistics } from '@/types/reports';
import { LoadingSpinner } from './LoadingSpinner';
import { NoDataMessage } from './NoDataMessage';
import { exportData, formatCurrency } from '@/utils/reportUtils';

interface ClientsTabProps {
  loading: boolean;
  clientStats: ClientStatistics | null;
  onExpandPeriod: () => void;
}

export const ClientsTab: React.FC<ClientsTabProps> = ({
  loading,
  clientStats,
  onExpandPeriod
}) => {
  return (
    <div className="grid gap-6">
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
            <NoDataMessage onExpandPeriod={onExpandPeriod} />
          )}
        </CardContent>
      </Card>
      
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
            <NoDataMessage onExpandPeriod={onExpandPeriod} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
