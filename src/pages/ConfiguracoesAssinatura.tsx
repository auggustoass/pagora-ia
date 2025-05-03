
import React, { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, CreditCard, AlertCircle } from 'lucide-react';
import { CreditsDisplay } from '@/components/dashboard/CreditsDisplay';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
          <h1 className="text-3xl font-bold mb-2">Créditos de Faturas</h1>
          <p className="text-muted-foreground">
            Gerencie seus créditos para geração de faturas. Cada fatura gerada consume um crédito.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-400" />
                Meus Créditos
              </CardTitle>
              <CardDescription>
                Status atual dos seus créditos de faturas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CreditsDisplay className="pb-4" />
              
              <Alert className="bg-blue-500/10 border-blue-500/20">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-sm text-blue-500">
                  Após a compra, seus créditos serão adicionados assim que o pagamento for confirmado pelo Mercado Pago.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={() => navigate('/planos')} 
                className="w-full bg-gradient-to-r from-pagora-purple to-pagora-purple/80 hover:bg-pagora-purple/90"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Comprar mais créditos
              </Button>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Como funciona</CardTitle>
              <CardDescription>
                Entenda o sistema de créditos para faturas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Créditos de faturas</h3>
                <p className="text-sm text-muted-foreground">
                  Cada fatura que você gera consome 1 crédito da sua conta. Você pode comprar pacotes de créditos com diferentes valores:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                  <li>Plano Básico: 5 faturas por R$49 (R$9,80 por fatura)</li>
                  <li>Plano Pro: 15 faturas por R$97 (R$6,46 por fatura)</li>
                  <li>Plano Enterprise: 30 faturas por R$197 (R$5,62 por fatura)</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Processo de pagamento</h3>
                <p className="text-sm text-muted-foreground">
                  Ao comprar créditos, você será redirecionado para o Mercado Pago para completar o pagamento.
                  Seus créditos serão adicionados automaticamente à sua conta assim que o pagamento for confirmado.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Fatura de teste gratuita</h3>
                <p className="text-sm text-muted-foreground">
                  Todos os novos usuários recebem 1 crédito gratuito para testar o sistema.
                  Após usar seu crédito gratuito, é necessário comprar mais créditos para continuar gerando faturas.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ConfiguracoesAssinatura;
