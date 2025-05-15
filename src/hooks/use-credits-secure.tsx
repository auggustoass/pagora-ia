
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { CreditsService } from '@/services/CreditsService';
import { toast } from 'sonner';

export interface UserCredits {
  id?: string;
  credits_remaining: number;
  plan_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export function useSecureCredits() {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Fetch user credits using the secure API endpoint
  const fetchCredits = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userCredits = await CreditsService.getCredits();
      setCredits(userCredits);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao buscar créditos');
      setError(error);
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  // Consume credits and update local state
  const consumeCredit = async (amount: number = 1) => {
    if (!user || !credits) return false;
    
    if (credits.credits_remaining < amount) {
      toast.error(`Você não tem créditos suficientes. Necessário: ${amount} créditos.`);
      return false;
    }
    
    try {
      const result = await CreditsService.consumeCredits(amount);
      
      if (result.success) {
        // Update local state with the new credits amount
        setCredits(prev => prev ? {
          ...prev,
          credits_remaining: result.credits_remaining ?? prev.credits_remaining - amount
        } : null);
        return true;
      } else {
        toast.error('Não foi possível consumir os créditos.');
        return false;
      }
    } catch (error) {
      console.error('Error consuming credit:', error);
      return false;
    }
  };

  // Add free credits for new users
  const addFreeCredit = async () => {
    if (!user) return null;
    
    try {
      // We'll call the same endpoint but with a negative amount to add credits
      const result = await ApiService.makeAuthenticatedRequest('credits/add_free', 'POST', { 
        amount: 10 // 10 free credits for new users
      });
      
      if (result && result.success) {
        toast.success('Você recebeu 10 créditos gratuitos para começar!');
        // Refresh credits after adding
        await fetchCredits();
        return credits;
      }
      return null;
    } catch (error) {
      console.error('Error adding free credit:', error);
      return null;
    }
  };

  // Load credits when user changes
  useEffect(() => {
    if (user) {
      fetchCredits();
    } else {
      setCredits(null);
    }
  }, [user]);

  return {
    credits,
    loading,
    error,
    fetchCredits,
    consumeCredit,
    addFreeCredit,
  };
}
