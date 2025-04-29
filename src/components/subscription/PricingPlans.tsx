
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../auth/AuthProvider';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
  const [subscribing, setSubscribing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

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

  async function handleSubscribe(planId: string) {
    if (!user) {
      toast.error('Você precisa estar logado para assinar um plano');
      navigate('/auth');
      return;
    }
    
    setSubscribing(true);
    
    try {
      // Calculate trial end date (30 days from now)
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 30);
      
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_id: planId,
          status: 'trial',
          trial_ends_at: trialEndsAt.toISOString()
        });
        
      if (error) {
        throw error;
      }
      
      toast.success('Plano assinado com sucesso! Aproveite seus 30 dias grátis.');
      navigate('/');
    } catch (error: any) {
      console.error('Error subscribing to plan:', error);
      toast.error(`Erro ao assinar plano: ${error.message || 'Tente novamente mais tarde'}`);
    } finally {
      setSubscribing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Carregando planos...</p>
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => {
        const colorScheme = getPlanColorScheme(plan.name);
        
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
                disabled={subscribing}
              >
                Começar Teste Gratuito
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
