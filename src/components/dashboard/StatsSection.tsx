
import React from 'react';
import { FileText, Clock, Wallet, Coins } from 'lucide-react';
import { ModernStatusCard } from './ModernStatusCard';
import { useCredits } from '@/hooks/use-credits';

interface StatsSectionProps {
  stats: {
    total: number;
    pendentes: number;
    aprovadas: number;
    totalRecebido: number;
  };
  loading: boolean;
  formatCurrency: (value: number) => string;
}

export function StatsSection({ stats, loading, formatCurrency }: StatsSectionProps) {
  const { credits, loading: creditsLoading } = useCredits();

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <ModernStatusCard 
        title="Créditos Disponíveis" 
        value={creditsLoading ? "..." : String(credits?.credits_remaining || 0)} 
        icon={Coins} 
        description="Para geração de faturas" 
        variant="info" 
        trend={{
          value: 12,
          isPositive: true
        }} 
      />
      <ModernStatusCard 
        title="Total de Faturas" 
        value={loading ? "..." : String(stats.total)} 
        icon={FileText} 
        variant="default" 
      />
      <ModernStatusCard 
        title="Faturas Pendentes" 
        value={loading ? "..." : String(stats.pendentes)} 
        icon={Clock} 
        variant="pending" 
        description="Aguardando pagamento" 
      />
      <ModernStatusCard 
        title="Total Recebido" 
        value={loading ? "..." : formatCurrency(stats.totalRecebido)} 
        icon={Wallet} 
        description="Valor total recebido" 
        variant="success" 
        trend={{
          value: 8.2,
          isPositive: true
        }} 
      />
    </div>
  );
}
