
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
    <div className="relative bg-black border border-green-500/20 rounded-2xl overflow-hidden group hover:border-green-400/30 transition-all duration-500">
      {/* Cyber grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
      
      <div className="relative p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-transparent animate-pulse"></div>
            <div>
              <h3 className="text-xl font-mono font-bold text-white tracking-wider">FINANCIAL_ANALYTICS</h3>
              <p className="text-green-400/70 text-sm font-mono tracking-widest">// LAST_30_DAYS_PROTOCOL</p>
            </div>
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-mono text-green-400 tracking-wider">ONLINE</span>
          </div>
        </div>
        
        <div className="h-64 relative">
          {/* Chart glow background */}
          <div className="absolute inset-0 bg-gradient-to-t from-green-400/5 to-transparent rounded-lg"></div>
          
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="receivedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff41" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#00ff41" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6b7280" stopOpacity={0}/>
                </linearGradient>
                
                {/* Glow effects */}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="2 4" 
                stroke="#00ff41" 
                strokeOpacity={0.1}
                horizontal={true}
                vertical={false}
              />
              
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'monospace' }}
                tickFormatter={(value) => `D${value}`}
              />
              
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'monospace' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
              />
              
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#000000',
                  border: '1px solid #00ff41',
                  borderRadius: '8px',
                  color: '#fff',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  boxShadow: '0 0 20px rgba(0,255,65,0.3)'
                }}
                formatter={(value: number, name: string) => [
                  `R$ ${value.toLocaleString('pt-BR')}`,
                  name === 'received' ? '>> RECEIVED' : '>> PENDING'
                ]}
                labelFormatter={(label) => `// DAY_${label}`}
              />
              
              <Area 
                type="monotone" 
                dataKey="received" 
                stroke="#00ff41" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#receivedGradient)" 
                filter="url(#glow)"
              />
              
              <Area 
                type="monotone" 
                dataKey="pending" 
                stroke="#6b7280" 
                strokeWidth={1}
                strokeDasharray="5 5"
                fillOpacity={1} 
                fill="url(#pendingGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center justify-center gap-8 mt-6 pt-4 border-t border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-mono text-green-400 tracking-wider">RECEIVED</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-gray-500 rounded-full opacity-70"></div>
            <span className="text-sm font-mono text-gray-400 tracking-wider">PENDING</span>
          </div>
        </div>
      </div>
      
      {/* Corner cuts */}
      <div className="absolute top-0 left-0 w-4 h-4 bg-black transform rotate-45 -translate-x-2 -translate-y-2"></div>
      <div className="absolute top-0 right-0 w-4 h-4 bg-black transform rotate-45 translate-x-2 -translate-y-2"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 bg-black transform rotate-45 -translate-x-2 translate-y-2"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 bg-black transform rotate-45 translate-x-2 translate-y-2"></div>
    </div>
  );
}
