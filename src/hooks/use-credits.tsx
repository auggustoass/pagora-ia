
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from '@/components/ui/use-toast';

export interface UserCredits {
  id: string;
  credits_remaining: number;
  plan_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useCredits() {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch user credits
  const fetchCredits = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_invoice_credits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching credits:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar seus créditos.',
          variant: 'destructive',
        });
      }
      
      setCredits(data || null);
    } catch (error) {
      console.error('Error in fetchCredits:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create or update user credits
  const updateCredits = async (creditsToAdd: number) => {
    if (!user) return null;
    
    try {
      // Check if user already has credits
      if (credits) {
        const newTotal = credits.credits_remaining + creditsToAdd;
        
        const { data, error } = await supabase
          .from('user_invoice_credits')
          .update({ 
            credits_remaining: newTotal,
            updated_at: new Date().toISOString()
          })
          .eq('id', credits.id)
          .select()
          .single();
          
        if (error) throw error;
        
        setCredits(data);
        return data;
      } else {
        // Create new credits entry for user
        const { data, error } = await supabase
          .from('user_invoice_credits')
          .insert({ 
            user_id: user.id,
            credits_remaining: creditsToAdd
          })
          .select()
          .single();
          
        if (error) throw error;
        
        setCredits(data);
        return data;
      }
    } catch (error) {
      console.error('Error updating credits:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar seus créditos.',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Consume credit (returns true if successful)
  const consumeCredit = async (amount: number = 1) => {
    if (!user || !credits) return false;
    
    if (credits.credits_remaining < amount) {
      toast({
        title: 'Sem créditos',
        description: `Você não tem créditos suficientes. Necessário: ${amount} créditos.`,
        variant: 'destructive',
      });
      return false;
    }
    
    try {
      const newTotal = credits.credits_remaining - amount;
      
      const { data, error } = await supabase
        .from('user_invoice_credits')
        .update({ 
          credits_remaining: newTotal,
          updated_at: new Date().toISOString()
        })
        .eq('id', credits.id)
        .select()
        .single();
        
      if (error) throw error;
      
      setCredits(data);
      return true;
    } catch (error) {
      console.error('Error consuming credit:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível consumir os créditos.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Add free credit for new users
  const addFreeCredit = async () => {
    if (!user) return null;
    
    try {
      // Check if user already has credits
      const { data: existingCredits, error: checkError } = await supabase
        .from('user_invoice_credits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      // If user already has credits, don't add free one
      if (existingCredits) return existingCredits;
      
      // Add free credit for new user
      const { data, error } = await supabase
        .from('user_invoice_credits')
        .insert({ 
          user_id: user.id,
          credits_remaining: 9 // One free invoice worth of credits for Basic plan
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setCredits(data);
      return data;
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
    fetchCredits,
    updateCredits,
    consumeCredit,
    addFreeCredit,
  };
}
