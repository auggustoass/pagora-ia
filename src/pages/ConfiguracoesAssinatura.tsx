
import React, { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { SubscriptionDetails } from '@/components/subscription/SubscriptionDetails';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const ConfiguracoesAssinatura = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has Mercado Pago credentials configured
    if (user) {
      checkMercadoPagoCredentials();
    }
  }, [user]);

  const checkMercadoPagoCredentials = async () => {
    try {
      if (!user || !user.id) {
        console.error('User not authenticated');
        return;
      }
      
      const { data, error } = await supabase
        .from('mercado_pago_credentials')
        .select('access_token')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking MP credentials:', error);
      }
      
      // If no credentials are found, show a toast with a link to the config page
      if (!data?.access_token) {
        toast({
          title: 'Configuração necessária',
          description: 'Configure suas credenciais do Mercado Pago para ativar os pagamentos',
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/configuracoes')}
            >
              Configurar
            </Button>
          ),
          duration: 10000,
        });
      }
    } catch (error) {
      console.error('Error checking MP credentials:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gerenciar Assinatura</h1>
          <p className="text-muted-foreground">
            Visualize detalhes de sua assinatura atual, gerencie pagamentos e veja o histórico de transações.
          </p>
        </div>
        
        <SubscriptionDetails />
      </div>
    </Layout>
  );
};

export default ConfiguracoesAssinatura;
