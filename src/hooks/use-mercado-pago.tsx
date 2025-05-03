
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export function useMercadoPago() {
  const [hasMpCredentials, setHasMpCredentials] = useState(true);
  const [hasAdminMpCredentials, setHasAdminMpCredentials] = useState(false);
  const { user } = useAuth();

  async function checkMercadoPagoCredentials() {
    try {
      if (!user) return;
      
      // First check if user has their own credentials
      const { data, error } = await supabase
        .from('mercado_pago_credentials')
        .select('access_token')
        .eq('user_id', user.id)
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

  // Load credentials when user changes
  useEffect(() => {
    if (user) {
      checkMercadoPagoCredentials();
    }
  }, [user]);

  return { hasMpCredentials, hasAdminMpCredentials, checkMercadoPagoCredentials };
}
