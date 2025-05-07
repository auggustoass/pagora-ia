
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plan } from '@/components/subscription/types';
import { toast } from 'sonner';

// Credits per plan
const creditsPerPlan = {
  Basic: 45,     // 5 invoices × 9 credits = 45 credits
  Pro: 90,       // 15 invoices × 6 credits = 90 credits
  Enterprise: 150 // 30 invoices × 5 credits = 150 credits
};

// Credits consumption per invoice by plan
const creditsConsumptionPerPlan = {
  Basic: 9,     // 9 credits per invoice
  Pro: 6,       // 6 credits per invoice
  Enterprise: 5 // 5 credits per invoice
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
          invoiceCredits: creditsPerPlan[plan.name as keyof typeof creditsPerPlan] || 0,
          // Add consumption rate based on plan name
          creditConsumption: creditsConsumptionPerPlan[plan.name as keyof typeof creditsConsumptionPerPlan] || 9
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
