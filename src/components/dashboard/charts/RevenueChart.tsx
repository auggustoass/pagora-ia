
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueData {
  date: string;
  received: number;
  pending: number;
}

const mockData: RevenueData[] = [
  { date: '1', received: 2400, pending: 800 },
  { date: '5', received: 1398, pending: 900 },
  { date: '10', received: 9800, pending: 1200 },
  { date: '15', received: 3908, pending: 600 },
  { date: '20', received: 4800, pending: 1100 },
  { date: '25', received: 3800, pending: 700 },
  { date: '30', received: 4300, pending: 950 },
];

export function RevenueChart() {
  return (
    <div className="glass-card bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-white/10 p-6 rounded-2xl">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Histórico Financeiro</h3>
        <p className="text-gray-400 text-sm">Últimos 30 dias - Recebimentos vs Pendentes</p>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="receivedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6b7280" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '12px',
                color: '#fff'
              }}
              formatter={(value: number, name: string) => [
                `R$ ${value.toLocaleString('pt-BR')}`,
                name === 'received' ? 'Recebido' : 'Pendente'
              ]}
              labelFormatter={(label) => `Dia ${label}`}
            />
            <Area 
              type="monotone" 
              dataKey="received" 
              stroke="#10b981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#receivedGradient)" 
            />
            <Area 
              type="monotone" 
              dataKey="pending" 
              stroke="#6b7280" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#pendingGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-300">Recebido</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          <span className="text-sm text-gray-300">Pendente</span>
        </div>
      </div>
    </div>
  );
}
