import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { CreditCard, ExternalLink, AlertCircle, Loader2, Info, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Form validation schema with more flexible token validation
const mercadoPagoSchema = z.object({
  access_token: z.string().min(10, {
    message: 'O Access Token é obrigatório e deve ter pelo menos 10 caracteres',
  }).refine(val => val.startsWith('APP_USR-'), {
    message: 'O Access Token deve começar com APP_USR-',
  }).refine(val => val.length >= 60, {
    message: 'O Access Token parece estar incompleto (deve ter pelo menos 60 caracteres)',
  }),
  public_key: z.string().min(10, {
    message: 'A Public Key é obrigatória e deve ter pelo menos 10 caracteres',
  }).refine(val => val.startsWith('APP_USR-'), {
    message: 'A Public Key deve começar com APP_USR-',
  }),
  user_mercado_pago_id: z.string().min(1, {
    message: 'O User ID é obrigatório',
  }),
  environment: z.enum(['production', 'sandbox', 'auto']).default('auto'),
});

type MercadoPagoFormValues = z.infer<typeof mercadoPagoSchema>;

interface MercadoPagoFormProps {
  hasUserCredentials: boolean;
  hasGlobalCredentials: boolean;
  credentialsSource: string;
  onCredentialsUpdate: () => void;
}

export function MercadoPagoForm({ 
  hasUserCredentials, 
  hasGlobalCredentials, 
  credentialsSource,
  onCredentialsUpdate 
}: MercadoPagoFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<MercadoPagoFormValues>({
    resolver: zodResolver(mercadoPagoSchema),
    defaultValues: {
      access_token: '',
      public_key: '',
      user_mercado_pago_id: '',
      environment: 'auto',
    },
  });

  // Fetch existing Mercado Pago configuration from Supabase
  React.useEffect(() => {
    const fetchMercadoPagoConfig = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('mercado_pago_credentials')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          if (error.code !== 'PGRST116') {
            console.error('Error fetching Mercado Pago config:', error);
          }
          return;
        }
        
        if (data) {
          form.setValue('access_token', data.access_token || '');
          form.setValue('public_key', data.public_key || '');
          form.setValue('user_mercado_pago_id', data.user_mercado_pago_id || '');
          // Use 'auto' as default since environment column doesn't exist yet
          form.setValue('environment', 'auto');
        }
      } catch (error) {
        console.error('Error fetching Mercado Pago config:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMercadoPagoConfig();
  }, [form, user]);

  const onSubmit = async (values: MercadoPagoFormValues) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para salvar configurações.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // For now, we'll save without the environment field since it doesn't exist in the table
      const { error } = await supabase
        .from('mercado_pago_credentials')
        .upsert(
          {
            user_id: user.id,
            access_token: values.access_token,
            public_key: values.public_key,
            user_mercado_pago_id: values.user_mercado_pago_id,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        );
        
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Suas credenciais do Mercado Pago foram salvas com sucesso.",
      });
      
      onCredentialsUpdate();
      setTestResult(null);
    } catch (error) {
      console.error('Error saving Mercado Pago config:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao tentar salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const values = form.getValues();
      
      if (!values.access_token) {
        throw new Error('Access Token não informado');
      }

      console.log('Testing Mercado Pago connection with token:', values.access_token.substring(0, 20) + '...');
      console.log('Token length:', values.access_token.length);

      // Validate token format before sending with updated validation
      const tokenValidation = mercadoPagoSchema.pick({ access_token: true }).safeParse({
        access_token: values.access_token
      });

      if (!tokenValidation.success) {
        const error = tokenValidation.error.errors[0];
        console.error('Token validation failed:', error.message);
        throw new Error(error.message);
      }
      
      const { data, error } = await supabase.functions.invoke('test-mercado-pago-credentials', {
        body: { 
          access_token: values.access_token,
          environment: values.environment 
        }
      });
      
      console.log('Test function response:', { data, error });
      
      if (error) {
        console.error('Error calling test function:', error);
        throw new Error(`Erro ao chamar função de teste: ${error.message}`);
      }
      
      if (!data.success) {
        setTestResult({ success: false, ...data });
        throw new Error(data.details || data.error || 'Credenciais inválidas');
      }
      
      const userData = data.user;
      setTestResult({ success: true, ...data });
      
      if (userData.id && values.user_mercado_pago_id !== userData.id.toString()) {
        form.setValue('user_mercado_pago_id', userData.id.toString());
        toast({
          title: "ID atualizado",
          description: `O ID do usuário foi atualizado para ${userData.id} conforme informações da API.`,
        });
      }
      
      toast({
        title: "Conexão bem-sucedida",
        description: data.message || `Conectado como ${userData.first_name} ${userData.last_name} (${userData.email})`,
      });
    } catch (error) {
      console.error('Error testing connection:', error);
      toast({
        title: "Erro na conexão",
        description: error instanceof Error ? error.message : 'Não foi possível conectar ao Mercado Pago. Verifique suas credenciais.',
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Mercado Pago
        </CardTitle>
        <CardDescription>
          Configure sua integração com o Mercado Pago para receber pagamentos diretamente em sua conta.
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Status das credenciais */}
            <div className={`flex items-center gap-2 mb-6 p-3 rounded-md border ${
              hasUserCredentials 
                ? 'bg-green-500/10 border-green-500/20' 
                : hasGlobalCredentials 
                  ? 'bg-blue-500/10 border-blue-500/20'
                  : 'bg-red-500/10 border-red-500/20'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                hasUserCredentials 
                  ? 'bg-green-500/20' 
                  : hasGlobalCredentials 
                    ? 'bg-blue-500/20'
                    : 'bg-red-500/20'
              }`}>
                {hasUserCredentials ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : hasGlobalCredentials ? (
                  <Info className="w-4 h-4 text-blue-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {hasUserCredentials 
                    ? "Credenciais pessoais configuradas"
                    : hasGlobalCredentials 
                      ? "Usando credenciais globais"
                      : "Nenhuma credencial configurada"
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  {hasUserCredentials 
                    ? "Suas credenciais pessoais estão ativas. Elas têm prioridade sobre credenciais globais."
                    : hasGlobalCredentials 
                      ? "Não há credenciais pessoais configuradas. O sistema está usando credenciais globais do administrador."
                      : "Configure suas credenciais pessoais ou solicite ao administrador para configurar credenciais globais."
                  }
                </p>
              </div>
            </div>

            {/* Test result */}
            {testResult && (
              <Alert className={testResult.success ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">
                      {testResult.success ? "✅ Teste bem-sucedido" : "❌ Teste falhou"}
                    </p>
                    {testResult.environment && (
                      <p className="text-sm">
                        Ambiente: {testResult.environment === 'production' ? 'Produção' : 'Teste'}
                      </p>
                    )}
                    {testResult.message && (
                      <p className="text-sm">{testResult.message}</p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Alert className="bg-blue-500/10 border-blue-500/20 mb-4">
              <AlertDescription className="flex flex-col gap-2">
                <p className="text-blue-500 font-medium">Sistema de Credenciais Hierárquico</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• <strong>Credenciais Pessoais:</strong> Têm prioridade máxima quando configuradas</p>
                  <p>• <strong>Credenciais Globais:</strong> Usadas automaticamente se você não tiver credenciais pessoais</p>
                  <p>• Configure suas credenciais pessoais para maior controle e recebimento direto</p>
                </div>
              </AlertDescription>
            </Alert>

            <Alert className="bg-blue-500/10 border-blue-500/20 mb-4">
              <AlertDescription className="flex flex-col gap-2">
                <p className="text-blue-500 font-medium">Onde encontrar suas credenciais?</p>
                <p className="text-sm text-muted-foreground">
                  1. Acesse o <a 
                    href="https://www.mercadopago.com.br/developers/panel/app" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline inline-flex items-center"
                  >
                    Painel de Desenvolvedores do Mercado Pago 
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </p>
                <p className="text-sm text-muted-foreground">
                  2. Na seção "Suas integrações", selecione ou crie uma nova aplicação
                </p>
                <p className="text-sm text-muted-foreground">
                  3. Acesse "Credenciais de produção" para obter o Access Token e Public Key
                </p>
              </AlertDescription>
            </Alert>

            <FormField
              control={form.control}
              name="environment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ambiente</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Selecione o ambiente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="auto">Detectar automaticamente</SelectItem>
                      <SelectItem value="production">Produção</SelectItem>
                      <SelectItem value="sandbox">Teste (Sandbox)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs">
                    O sistema pode detectar automaticamente se as credenciais são de produção ou teste.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="access_token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Token</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      className="bg-white/5 border-white/10 font-mono text-sm"
                      placeholder="APP_USR-0000000000000000-000000-00000000000000000000000000000000-000000000"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    O token de acesso é necessário para criar preferências de pagamento. Certifique-se de copiar o token completo.
                    <br />
                    <span className="text-muted-foreground">
                      Tokens válidos têm entre 60-150 caracteres e começam com APP_USR-
                    </span>
                  </FormDescription>
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
                      className="bg-white/5 border-white/10 font-mono text-sm"
                      placeholder="APP_USR-00000000-0000-0000-0000-000000000000"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    A chave pública é usada para interações do cliente com o Mercado Pago.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="user_mercado_pago_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID do Usuário</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-white/5 border-white/10 font-mono text-sm"
                      placeholder="000000000"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Este campo será preenchido automaticamente ao testar a conexão.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button 
              type="submit" 
              className="bg-pagora-purple hover:bg-pagora-purple/90 w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : 'Salvar credenciais'}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="border-white/10 w-full sm:w-auto"
              onClick={testConnection}
              disabled={isTesting || !form.getValues().access_token}
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : 'Testar conexão'}
            </Button>
            
            <Button 
              type="button"
              variant="ghost"
              className="w-full sm:w-auto"
              onClick={() => window.open('https://www.mercadopago.com.br/developers/panel/app', '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Acessar Mercado Pago
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
