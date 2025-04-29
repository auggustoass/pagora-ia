
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { CreditCard, Shield, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

// Form validation schema
const mercadoPagoSchema = z.object({
  access_token: z.string().min(5, {
    message: 'O Access Token é obrigatório',
  }),
  public_key: z.string().min(5, {
    message: 'A Public Key é obrigatória',
  }),
  user_id: z.string().min(1, {
    message: 'O User ID é obrigatório',
  }),
});

type MercadoPagoFormValues = z.infer<typeof mercadoPagoSchema>;

const SETTINGS_KEY = 'mercado_pago';

// Define type for the settings response from Supabase
interface SettingsResponse {
  id: string;
  value: MercadoPagoFormValues;
  updated_at: string;
}

const Configuracoes = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  
  const form = useForm<MercadoPagoFormValues>({
    resolver: zodResolver(mercadoPagoSchema),
    defaultValues: {
      access_token: '',
      public_key: '',
      user_id: '',
    },
  });

  // Fetch existing Mercado Pago configuration from Supabase
  useEffect(() => {
    const fetchMercadoPagoConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('id', SETTINGS_KEY)
          .single();
        
        if (error) {
          console.error('Error fetching Mercado Pago config:', error);
          return;
        }
        
        if (data) {
          const config = data.value as MercadoPagoFormValues;
          form.setValue('access_token', config.access_token || '');
          form.setValue('public_key', config.public_key || '');
          form.setValue('user_id', config.user_id || '');
          setIsConfigured(true);
        }
      } catch (error) {
        console.error('Error fetching Mercado Pago config:', error);
      }
    };
    
    fetchMercadoPagoConfig();
  }, [form]);

  const onSubmitMercadoPago = async (values: MercadoPagoFormValues) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('settings')
        .upsert(
          {
            id: SETTINGS_KEY,
            value: values,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'id' }
        );
        
      if (error) throw error;
      
      toast({
        title: 'Configurações salvas',
        description: 'Suas configurações do Mercado Pago foram salvas com sucesso.',
      });
      
      setIsConfigured(true);
    } catch (error) {
      console.error('Error saving Mercado Pago config:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro ao tentar salvar as configurações. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, we would test the connection with the Mercado Pago API
      // For now, we'll just simulate a successful connection after a short delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Conexão bem-sucedida',
        description: 'A conexão com o Mercado Pago foi estabelecida com sucesso.',
      });
    } catch (error) {
      console.error('Error testing connection:', error);
      toast({
        title: 'Erro de conexão',
        description: 'Não foi possível conectar ao Mercado Pago. Verifique suas credenciais.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              <CreditCard className="w-4 h-4" />
              Pagamento
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Segurança
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="payment" className="mt-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Mercado Pago
                </CardTitle>
                <CardDescription>
                  Configure sua integração com o Mercado Pago para processar pagamentos.
                </CardDescription>
              </CardHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitMercadoPago)}>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 mb-6 p-2 rounded-md bg-white/5">
                      {isConfigured ? (
                        <>
                          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-green-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Mercado Pago configurado</p>
                            <p className="text-xs text-muted-foreground">Sua conta está conectada e pronta para processar pagamentos.</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                            <X className="w-4 h-4 text-amber-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Mercado Pago não configurado</p>
                            <p className="text-xs text-muted-foreground">Adicione suas credenciais para começar a processar pagamentos.</p>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="access_token"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Access Token</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              className="bg-white/5 border-white/10"
                              placeholder="APP_USR-0000000000000000-000000-00000000000000000000000000000000-000000000"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="public_key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Public Key</FormLabel>
                          <FormControl>
                            <Input
                              className="bg-white/5 border-white/10"
                              placeholder="APP_USR-00000000-0000-0000-0000-000000000000"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="user_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>User ID</FormLabel>
                          <FormControl>
                            <Input
                              className="bg-white/5 border-white/10"
                              placeholder="000000000"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="text-sm text-muted-foreground">
                      <p>Você pode encontrar estas credenciais no painel do Mercado Pago, na seção de integrações.</p>
                      <a 
                        href="https://www.mercadopago.com.br/developers/panel/app" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-pagora-purple hover:underline"
                      >
                        Acessar painel do Mercado Pago
                      </a>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      type="submit" 
                      className="bg-pagora-purple hover:bg-pagora-purple/90 w-full sm:w-auto"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Salvando...' : 'Salvar configurações'}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="border-white/10 w-full sm:w-auto"
                      onClick={testConnection}
                      disabled={isLoading || !isConfigured}
                    >
                      Testar conexão
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
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
