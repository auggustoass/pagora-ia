
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

interface MercadoPagoStatus {
  hasUserCredentials: boolean;
  hasGlobalCredentials: boolean;
  canGeneratePayments: boolean;
  credentialsSource: 'user' | 'global' | 'none';
}

export function useMercadoPago() {
  const [status, setStatus] = useState<MercadoPagoStatus>({
    hasUserCredentials: false,
    hasGlobalCredentials: false,
    canGeneratePayments: false,
    credentialsSource: 'none'
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  async function checkMercadoPagoCredentials() {
    try {
      setIsLoading(true);
      if (!user) {
        setStatus({
          hasUserCredentials: false,
          hasGlobalCredentials: false,
          canGeneratePayments: false,
          credentialsSource: 'none'
        });
        return;
      }
      
      // Check user's individual credentials first
      const { data: userCredentials, error: userError } = await supabase
        .from('mercado_pago_credentials')
        .select('access_token')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (userError && userError.code !== 'PGRST116') {
        console.error('Error checking user Mercado Pago credentials:', userError);
      }
      
      const hasUserCredentials = !!userCredentials?.access_token;
      
      // Check if global admin credentials exist
      const { data: globalCredentials, error: globalError } = await supabase
        .from('admin_mercado_pago_credentials')
        .select('access_token')
        .limit(1)
        .maybeSingle();
        
      if (globalError && globalError.code !== 'PGRST116') {
        console.error('Error checking global Mercado Pago credentials:', globalError);
      }
      
      const hasGlobalCredentials = !!globalCredentials?.access_token;
      
      // Determine final status based on hierarchy
      const canGeneratePayments = hasUserCredentials || hasGlobalCredentials;
      const credentialsSource = hasUserCredentials ? 'user' : (hasGlobalCredentials ? 'global' : 'none');
      
      setStatus({
        hasUserCredentials,
        hasGlobalCredentials,
        canGeneratePayments,
        credentialsSource
      });
      
    } catch (error) {
      console.error('Error checking Mercado Pago credentials:', error);
      setStatus({
        hasUserCredentials: false,
        hasGlobalCredentials: false,
        canGeneratePayments: false,
        credentialsSource: 'none'
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Load credentials when user changes
  useEffect(() => {
    checkMercadoPagoCredentials();
  }, [user]);

  return { 
    ...status,
    isLoading, 
    checkMercadoPagoCredentials,
    // Backward compatibility
    hasMpCredentials: status.canGeneratePayments
  };
}
