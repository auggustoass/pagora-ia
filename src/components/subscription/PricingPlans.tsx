
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../auth/AuthProvider';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

export function PricingPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [hasMpCredentials, setHasMpCredentials] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
    if (user) {
      checkMercadoPagoCredentials();
    }
  }, [user]);

  async function fetchPlans() {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('price');
        
      if (error) {
        throw error;
      }
      
      if (data) {
        const formattedPlans = data.map(plan => ({
          ...plan,
          features: plan.features as unknown as string[]
        }));
        setPlans(formattedPlans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  }
  
  async function checkMercadoPagoCredentials() {
    try {
      const { data, error } = await supabase
        .from('mercado_pago_credentials')
        .select('access_token')
        .eq('user_id', user!.id)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking Mercado Pago credentials:', error);
      }
      
      setHasMpCredentials(!!data?.access_token);
    } catch (error) {
      console.error('Error checking Mercado Pago credentials:', error);
    }
  }

  async function handleSubscribe(planId: string) {
    if (!user) {
      toast.error('Você precisa estar logado para assinar um plano');
      navigate('/auth');
      return;
    }
    
    setProcessingPlanId(planId);
    
    try {
      // First, check if user has Mercado Pago credentials
      if (!hasMpCredentials) {
        toast.warning('Você precisa configurar suas credenciais do Mercado Pago antes de assinar um plano');
        navigate('/configuracoes');
        return;
      }
      
      // Check if user already has a subscription
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'trial'])
        .maybeSingle();
        
      if (existingSubscription) {
        // User already has an active subscription, redirect to subscription details
        toast.info('Você já possui uma assinatura ativa.');
        navigate('/configuracoes/assinatura');
        return;
      }
      
      // Calculate trial end date (30 days from now)
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 30);
      
      // Create trial subscription in database
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_id: planId,
          status: 'trial',
          trial_ends_at: trialEndsAt.toISOString()
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Setup Mercado Pago subscription for automatic billing after trial
      await createMercadoPagoSubscription(subscription.id, planId);
      
    } catch (error: any) {
      console.error('Error subscribing to plan:', error);
      toast.error(`Erro ao assinar plano: ${error.message || 'Tente novamente mais tarde'}`);
      setProcessingPlanId(null);
    }
  }
  
  async function createMercadoPagoSubscription(subscriptionId: string, planId: string) {
    try {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        throw new Error('Sessão expirada');
      }
      
      console.log('Creating Mercado Pago subscription...');
      
      // Call our edge function to create the Mercado Pago subscription
      const response = await supabase.functions.invoke('create-subscription', {
        body: {
          planId,
          userId: user!.id,
          token: authData.session.access_token
        },
      });
      
      console.log('Edge function response:', response);
      
      if (response.error) {
        throw new Error(response.error || 'Falha ao processar assinatura');
      }
      
      if (response.data.checkout_url) {
        // Redirect to Mercado Pago checkout
        toast.success('Assinatura criada com sucesso! Redirecionando para pagamento...');
        window.location.href = response.data.checkout_url;
      } else {
        throw new Error('URL de checkout não recebida');
      }
      
    } catch (error: any) {
      console.error('Error creating Mercado Pago subscription:', error);
      
      // More descriptive error message based on the actual error
      let errorMessage = error.message;
      if (errorMessage.includes('access_token')) {
        errorMessage = 'Credenciais do Mercado Pago inválidas. Verifique suas configurações.';
      } else if (errorMessage.includes('credenciais') || errorMessage.includes('Credenciais')) {
        errorMessage = 'Configure suas credenciais do Mercado Pago em Configurações.';
      }
      
      toast.error(`Erro ao configurar pagamento: ${errorMessage}`);
      
      // Delete the subscription if we couldn't set up payment
      if (subscriptionId) {
        await supabase
          .from('subscriptions')
          .delete()
          .eq('id', subscriptionId);
      }
      
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

  // Function to get the color scheme for each plan
  const getPlanColorScheme = (planName: string) => {
    switch (planName) {
      case 'Basic':
        return {
          gradientClass: 'from-purple-600 to-purple-400',
          badgeClass: 'bg-purple-600',
          hoverClass: 'hover:bg-purple-700'
        };
      case 'Pro':
        return {
          gradientClass: 'from-blue-600 to-blue-400',
          badgeClass: 'bg-blue-600',
          hoverClass: 'hover:bg-blue-700'
        };
      case 'Enterprise':
        return {
          gradientClass: 'from-yellow-600 to-yellow-400',
          badgeClass: 'bg-yellow-600',
          hoverClass: 'hover:bg-yellow-700'
        };
      default:
        return {
          gradientClass: 'from-pagora-purple to-pagora-purple/80',
          badgeClass: 'bg-pagora-purple',
          hoverClass: 'hover:bg-pagora-purple/90'
        };
    }
  };

  return (
    <div className="space-y-6">
      {user && !hasMpCredentials && (
        <Alert className="bg-yellow-500/10 border-yellow-500/20">
          <AlertDescription className="text-yellow-500">
            Você precisa configurar suas credenciais do Mercado Pago antes de assinar um plano. 
            <Button 
              variant="link" 
              className="text-yellow-500 p-0 h-auto ml-1"
              onClick={() => navigate('/configuracoes')}
            >
              Ir para Configurações
            </Button>
          </AlertDescription>
        </Alert>
      )}
    
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const colorScheme = getPlanColorScheme(plan.name);
          const isProcessing = processingPlanId === plan.id;
          
          return (
            <Card key={plan.id} className="glass-card flex flex-col hover-float relative overflow-hidden">
              {/* Plan badge */}
              <div className={`absolute top-0 right-0 p-2 px-4 text-white ${colorScheme.badgeClass}`}>
                {plan.name === 'Basic' && '🟣'}
                {plan.name === 'Pro' && '🔵'}
                {plan.name === 'Enterprise' && '🟡'}
                {' '}{plan.name}
              </div>
              
              <CardHeader className="pt-16">
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">R${plan.price}</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-pagora-success mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-sm text-muted-foreground flex items-center justify-center space-x-2">
                  <span>🔒 Sem contrato</span>
                  <span>|</span>
                  <span>✅ 30 dias grátis</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleSubscribe(plan.id)} 
                  className={`w-full bg-gradient-to-r ${colorScheme.gradientClass} ${colorScheme.hoverClass}`}
                  disabled={isProcessing || (user && !hasMpCredentials)}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Começar Teste Gratuito'
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
