
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <Card key={plan.id} className="glass-card flex flex-col hover-float">
          <CardHeader>
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
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => handleSubscribe(plan.id)} 
              className="w-full pagora-gradient" 
              disabled={subscribing}
            >
              Começar Trial de 30 dias
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
