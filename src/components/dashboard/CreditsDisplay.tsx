
import React from 'react';
import { useCredits } from '@/hooks/use-credits';
import { Coins, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePlans } from '@/hooks/use-plans';

interface CreditsDisplayProps {
  showAlert?: boolean;
  className?: string;
}

export function CreditsDisplay({
  showAlert = true,
  className = ''
}: CreditsDisplayProps) {
  const {
    credits,
    loading
  } = useCredits();
  const { plans } = usePlans();
  const navigate = useNavigate();
  
  if (loading) {
    return <div className={`flex items-center ${className}`}>
        <Coins className="w-5 h-5 mr-2 text-yellow-500 animate-pulse" />
        <span>Carregando créditos...</span>
      </div>;
  }
  
  const creditsRemaining = credits?.credits_remaining || 0;
  const userPlanName = credits?.plan_id ? 
    plans.find(p => p.id === credits.plan_id)?.name || 'Basic' : 
    'Basic';
  const creditConsumption = plans.find(p => p.name === userPlanName)?.creditConsumption || 9;
  const lowCredits = creditsRemaining <= creditConsumption;
  const canGenerateInvoices = Math.floor(creditsRemaining / creditConsumption);
  
  return <div className={`space-y-2 ${className}`}>
      {showAlert && lowCredits && <Alert className="bg-red-500/10 border-red-500/20">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-sm text-red-500">
            Seus créditos estão acabando! 
            <Button variant="link" size="sm" className="px-1 h-auto text-red-500 font-medium" onClick={() => navigate('/planos')}>
              Compre mais créditos
            </Button>
          </AlertDescription>
        </Alert>}
      
      <div className="text-sm">
        <span className="font-medium">Créditos disponíveis:</span> {creditsRemaining}
        <br />
        <span className="text-muted-foreground">
          Faturas disponíveis: {canGenerateInvoices} ({creditConsumption} créditos por fatura)
        </span>
      </div>
      
      {showAlert && creditsRemaining === 0 && <Button size="sm" className="w-full bg-yellow-500 hover:bg-yellow-600" onClick={() => navigate('/planos')}>
          Comprar créditos agora
        </Button>}
    </div>;
}
