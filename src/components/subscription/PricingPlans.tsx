
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useCredits } from '@/hooks/use-credits';
import { usePlans } from '@/hooks/use-plans';
import { useMercadoPago } from '@/hooks/use-mercado-pago';
import { PlanGrid } from './PlanGrid';
import { WarningBanners } from './WarningBanners';
import { PlanInfoBanner } from './PlanInfoBanner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { PlanService } from '@/services/PlanService';

export function PricingPlans() {
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { updateCredits, credits, addFreeCredit } = useCredits();
  const { plans, loading } = usePlans();
  const { hasMpCredentials } = useMercadoPago();
  const [showFreeCreditsInfo, setShowFreeCreditsInfo] = useState(false);
  
  useEffect(() => {
    // Check if we should show the free credits info
    // If the user has credits but they're a new user (credits <= 10)
    if (user && credits && credits.credits_remaining <= 10 && credits.credits_remaining > 0) {
      setShowFreeCreditsInfo(true);
    } else {
      setShowFreeCreditsInfo(false);
    }
    
    // For new users that don't have credits yet, automatically add them
    const addInitialCredits = async () => {
      if (user && !credits) {
        await addFreeCredit();
      }
    };
    
    if (user) {
      addInitialCredits();
    }
  }, [user, credits, addFreeCredit]);

  async function handleSubscribe(planId: string, planName: string) {
    if (!user) {
      toast.error('Você precisa estar logado para comprar créditos');
      navigate('/auth');
      return;
    }
    
    setProcessingPlanId(planId);
    
    try {
      // Check if any credentials are available
      if (!hasMpCredentials) {
        toast.warning('Credenciais do Mercado Pago não configuradas. Configure suas credenciais em Configurações.');
        navigate('/configuracoes');
        return;
      }
      
      // Use the new PlanService to get checkout URL via n8n
      const checkoutUrl = await PlanService.subscribeToPlan(planId, user.id);
      
      if (!checkoutUrl) {
        throw new Error('URL de checkout não recebida');
      }
      
      // Redirect to Mercado Pago checkout
      toast.success('Redirecionando para pagamento...');
      window.location.href = checkoutUrl;
      
    } catch (error: any) {
      console.error('Error creating Mercado Pago payment:', error);
      
      // More descriptive error message based on the actual error
      let errorMessage = error.message;
      if (errorMessage.includes('access_token')) {
        errorMessage = 'Credenciais do Mercado Pago inválidas. Verifique suas configurações.';
      } else if (errorMessage.includes('credenciais') || errorMessage.includes('Credenciais')) {
        errorMessage = 'Configure suas credenciais do Mercado Pago em Configurações.';
      }
      
      toast.error(`Erro ao configurar pagamento: ${errorMessage}`);
      setProcessingPlanId(null);
      
      // Redirect to config if it's a credentials issue
      if (errorMessage.includes('credenciais') || errorMessage.includes('Credenciais')) {
        navigate('/configuracoes');
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-pagora-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Free Credits Info Alert */}
      {showFreeCreditsInfo && (
        <Alert className="bg-green-500/10 border-green-500/20">
          <InfoIcon className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-500">Você tem créditos gratuitos!</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Você recebeu 10 créditos gratuitos para começar a usar o sistema. Use-os para gerar suas primeiras faturas!
          </AlertDescription>
        </Alert>
      )}
      
      <WarningBanners 
        user={user} 
        hasMpCredentials={hasMpCredentials}
        credits={credits}
      />
      
      <PlanInfoBanner />
    
      <PlanGrid 
        plans={plans}
        processingPlanId={processingPlanId}
        hasMpCredentials={hasMpCredentials}
        onSubscribe={handleSubscribe}
      />
    </div>
  );
}
