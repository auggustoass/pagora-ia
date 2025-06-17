
import React from 'react';
import { FileText, Clock, Wallet, Coins } from 'lucide-react';
import { CyberStatusCard } from './CyberStatusCard';
import { useCredits } from '@/hooks/use-credits';

interface CyberStatsSectionProps {
  stats: {
    total: number;
    pendentes: number;
    aprovadas: number;
    totalRecebido: number;
  };
  loading: boolean;
  formatCurrency: (value: number) => string;
}

export function CyberStatsSection({ stats, loading, formatCurrency }: CyberStatsSectionProps) {
  const { credits, loading: creditsLoading } = useCredits();

  return (
    <div className="relative">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      <div className="relative grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <CyberStatusCard 
          title="CREDITS_AVAILABLE" 
          value={creditsLoading ? "..." : String(credits?.credits_remaining || 0)} 
          icon={Coins} 
          description="// INVOICE_GENERATION_FUEL" 
          variant="info" 
          trend={{
            value: 12,
            isPositive: true
          }} 
        />
        
        <CyberStatusCard 
          title="TOTAL_INVOICES" 
          value={loading ? "..." : String(stats.total)} 
          icon={FileText} 
          variant="default" 
          description="// SYSTEM_RECORDS"
        />
        
        <CyberStatusCard 
          title="PENDING_STATUS" 
          value={loading ? "..." : String(stats.pendentes)} 
          icon={Clock} 
          variant="pending" 
          description="// AWAITING_PAYMENT_CONFIRMATION" 
        />
        
        <CyberStatusCard 
          title="TOTAL_RECEIVED" 
          value={loading ? "..." : formatCurrency(stats.totalRecebido)} 
          icon={Wallet} 
          description="// CONFIRMED_TRANSACTIONS" 
          variant="success" 
          trend={{
            value: 8.2,
            isPositive: true
          }} 
        />
      </div>
    </div>
  );
}
