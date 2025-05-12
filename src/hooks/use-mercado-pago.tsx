
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export function useMercadoPago() {
  const [hasMpCredentials, setHasMpCredentials] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  async function checkMercadoPagoCredentials() {
    try {
      setIsLoading(true);
      if (!user) {
        setHasMpCredentials(false);
        return;
      }
      
      // Only check if user has their own credentials (no admin fallback)
      const { data, error } = await supabase
        .from('mercado_pago_credentials')
        .select('access_token')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking Mercado Pago credentials:', error);
      }
      
      // User has credentials only if they have set up their own
      setHasMpCredentials(!!data?.access_token);
    } catch (error) {
      console.error('Error checking Mercado Pago credentials:', error);
      setHasMpCredentials(false);
    } finally {
      setIsLoading(false);
    }
  }

  // Load credentials when user changes
  useEffect(() => {
    checkMercadoPagoCredentials();
  }, [user]);

  return { hasMpCredentials, isLoading, checkMercadoPagoCredentials };
}
