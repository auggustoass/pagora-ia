
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCredits } from '@/hooks/use-credits';
import { usePlans } from '@/hooks/use-plans';
import { useMercadoPago } from '@/hooks/use-mercado-pago';
import { PlanGrid } from './PlanGrid';
import { WarningBanners } from './WarningBanners';
import { PlanInfoBanner } from './PlanInfoBanner';

export function PricingPlans() {
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { updateCredits, credits } = useCredits();
  const { plans, loading } = usePlans();
  const { hasMpCredentials } = useMercadoPago();

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
      
      // Get invoice credits for this plan
      const plan = plans.find(p => p.id === planId);
      if (!plan || !plan.invoiceCredits) {
        toast.error('Plano não encontrado ou inválido');
        return;
      }

      // Get auth session
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        throw new Error('Sessão expirada');
      }
      
      console.log('Creating Mercado Pago payment...');
      
      // Call our edge function to create the Mercado Pago payment
      const response = await supabase.functions.invoke('create-subscription', {
        body: {
          planId,
          userId: user.id,
          token: authData.session.access_token
        },
      });
      
      console.log('Edge function response:', response);
      
      if (response.error) {
        throw new Error(response.error || 'Falha ao processar pagamento');
      }
      
      if (response.data.checkout_url) {
        // Redirect to Mercado Pago checkout
        toast.success('Redirecionando para pagamento...');
        window.location.href = response.data.checkout_url;
      } else {
        throw new Error('URL de checkout não recebida');
      }
      
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
