
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plan } from '@/components/subscription/types';
import { toast } from 'sonner';

// Credits per plan
const creditsPerPlan = {
  Basic: 5,     // R$49 = R$9,80 per invoice
  Pro: 15,      // R$97 = R$6,46 per invoice
  Enterprise: 30 // R$197 = R$5,62 per invoice
};

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchPlans() {
    try {
      setLoading(true);
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

  // Fetch plans on component mount
  useEffect(() => {
    fetchPlans();
  }, []);

  return { plans, loading, fetchPlans };
}
