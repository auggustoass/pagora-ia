
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Shield } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useMercadoPago } from '@/hooks/use-mercado-pago';
import { MercadoPagoForm } from '@/components/forms/MercadoPagoForm';

const Configuracoes = () => {
  const { hasUserCredentials, hasGlobalCredentials, credentialsSource, checkMercadoPagoCredentials } = useMercadoPago();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações do seu sistema de cobrança.</p>
        </div>
        
        <Tabs defaultValue="payment">
          <TabsList className="glass-card">
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Pagamento
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Segurança
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="payment" className="mt-4">
            <MercadoPagoForm
              hasUserCredentials={hasUserCredentials}
              hasGlobalCredentials={hasGlobalCredentials}
              credentialsSource={credentialsSource}
              onCredentialsUpdate={checkMercadoPagoCredentials}
            />
          </TabsContent>
          
          <TabsContent value="security" className="mt-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Segurança
                </CardTitle>
                <CardDescription>
                  Configure opções de segurança para o seu sistema.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <p className="text-muted-foreground text-sm">Configurações de segurança serão adicionadas em breve.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Configuracoes;
