
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../auth/AuthProvider';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCredits } from '@/hooks/use-credits';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  invoiceCredits?: number;
}

export function PricingPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [hasMpCredentials, setHasMpCredentials] = useState(true); // Default to true initially
  const [hasAdminMpCredentials, setHasAdminMpCredentials] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { updateCredits, credits } = useCredits();

  // Credits per plan
  const creditsPerPlan = {
    Basic: 5,     // R$49 = R$9,80 per invoice
    Pro: 15,      // R$97 = R$6,46 per invoice
    Enterprise: 30 // R$197 = R$5,62 per invoice
  };

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
          features: plan.features as unknown as string[],
          // Add invoice credits based on plan name
          invoiceCredits: creditsPerPlan[plan.name as keyof typeof creditsPerPlan] || 0
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
      // First check if user has their own credentials
      const { data, error } = await supabase
        .from('mercado_pago_credentials')
        .select('access_token')
        .eq('user_id', user!.id)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking Mercado Pago credentials:', error);
      }
      
      const userHasCredentials = !!data?.access_token;
      setHasMpCredentials(userHasCredentials);
      
      // If user doesn't have credentials, check if admin credentials exist
      if (!userHasCredentials) {
        const { data: adminData, error: adminError } = await supabase
          .from('admin_mercado_pago_credentials')
          .select('access_token')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (adminError) {
          console.error('Error checking admin Mercado Pago credentials:', adminError);
        }
        
        setHasAdminMpCredentials(!!adminData?.access_token);
        // If admin has credentials, we can use them
        if (adminData?.access_token) {
          setHasMpCredentials(true);
        }
      }
    } catch (error) {
      console.error('Error checking Mercado Pago credentials:', error);
    }
  }

  async function handleSubscribe(planId: string, planName: string) {
    if (!user) {
      toast.error('Você precisa estar logado para comprar créditos');
      navigate('/auth');
      return;
    }
    
    setProcessingPlanId(planId);
    
    try {
      // Check if any credentials are available (user's own or admin's)
      if (!hasMpCredentials && !hasAdminMpCredentials) {
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

  // Function to get the color scheme for each plan
  function getPlanColorScheme(planName: string) {
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
  }

  return (
    <div className="space-y-6">
      {user && !hasMpCredentials && (
        <Alert className="bg-yellow-500/10 border-yellow-500/20">
          <AlertDescription className="text-yellow-500">
            Para comprar créditos, é necessário que você ou o administrador configure as credenciais do Mercado Pago.
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
      
      {user && credits && credits.credits_remaining > 0 && (
        <Alert className="bg-green-500/10 border-green-500/20">
          <AlertDescription className="text-green-500">
            Você já possui {credits.credits_remaining} crédito{credits.credits_remaining !== 1 ? 's' : ''} disponível{credits.credits_remaining !== 1 ? 'is' : ''} para gerar faturas.
          </AlertDescription>
        </Alert>
      )}
      
      <Alert className="bg-blue-500/10 border-blue-500/20">
        <AlertDescription className="text-blue-500">
          <div className="flex items-center">
            <Info className="mr-2 h-4 w-4" />
            Após a confirmação do pagamento pelo Mercado Pago, seus créditos serão adicionados automaticamente à sua conta.
          </div>
        </AlertDescription>
      </Alert>
    
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const colorScheme = getPlanColorScheme(plan.name);
          const isProcessing = processingPlanId === plan.id;
          const pricePerInvoice = plan.price / (plan.invoiceCredits || 1);
          
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
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  <span className="font-semibold">{plan.invoiceCredits} faturas</span> (R${pricePerInvoice.toFixed(2)} por fatura)
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
                <div className="mt-4 text-sm text-muted-foreground flex items-center justify-center">
                  <span className="flex items-center">
                    🔒 Sem contrato 
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="ml-1 h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Créditos adicionados após confirmação do pagamento</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleSubscribe(plan.id, plan.name)} 
                  className={`w-full bg-gradient-to-r ${colorScheme.gradientClass} ${colorScheme.hoverClass}`}
                  disabled={isProcessing || (user && !hasMpCredentials)}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    `Comprar ${plan.invoiceCredits} créditos`
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
