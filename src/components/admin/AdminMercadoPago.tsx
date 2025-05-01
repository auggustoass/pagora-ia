
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export function AdminMercadoPago() {
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [userId, setUserId] = useState('');
  const [hasCredentials, setHasCredentials] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCredentials();
    }
  }, [user]);

  const fetchCredentials = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setErrorMessage('Sessão expirada. Por favor, faça login novamente.');
        return;
      }

      const { data, error } = await supabase.functions.invoke('admin-mercado-pago', {
        body: { action: 'get' },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Error fetching credentials:', error);
        setErrorMessage(`Erro ao buscar credenciais: ${error.message || 'Erro desconhecido'}`);
        return;
      }

      if (data && data.has_credentials) {
        setPublicKey(data.public_key);
        setUserId(data.user_mercado_pago_id);
        setHasCredentials(true);
        setAccessToken(''); // Don't set the actual token for security
      } else {
        // No credentials found, but this is not an error
        setHasCredentials(false);
        setPublicKey('');
        setUserId('');
        setAccessToken('');
      }
    } catch (error: any) {
      console.error('Error fetching credentials:', error);
      setErrorMessage(`Erro ao buscar credenciais: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!accessToken) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira um token de acesso',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsTesting(true);
      setErrorMessage(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Erro',
          description: 'Sessão expirada. Por favor, faça login novamente.',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('admin-mercado-pago', {
        body: { action: 'test', access_token: accessToken },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Error response from function:', error);
        toast({
          title: 'Erro ao testar credenciais',
          description: error.message || 'Falha ao verificar credenciais',
          variant: 'destructive',
        });
        return;
      }

      if (data.success) {
        toast({
          title: 'Sucesso',
          description: 'Credenciais válidas!',
        });
      } else if (data.error) {
        toast({
          title: 'Credenciais inválidas',
          description: data.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Resultado inesperado',
          description: 'Não foi possível determinar a validade das credenciais',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error testing credentials:', error);
      toast({
        title: 'Erro',
        description: `Erro ao testar credenciais: ${error.message || 'Erro desconhecido'}`,
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!accessToken || !publicKey || !userId) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Erro',
          description: 'Sessão expirada. Por favor, faça login novamente.',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('admin-mercado-pago', {
        body: {
          action: 'create',
          access_token: accessToken,
          public_key: publicKey,
          user_mercado_pago_id: userId
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Error from edge function:', error);
        toast({
          title: 'Erro',
          description: `Erro ao salvar credenciais: ${error.message || 'Erro desconhecido'}`,
          variant: 'destructive',
        });
        return;
      }

      if (data.error) {
        toast({
          title: 'Erro',
          description: `Falha ao salvar: ${data.error}`,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Sucesso',
        description: 'Credenciais salvas com sucesso!',
      });
      
      setHasCredentials(true);
      setAccessToken(''); // Clear for security
    } catch (error: any) {
      console.error('Error saving credentials:', error);
      toast({
        title: 'Erro',
        description: `Erro ao salvar credenciais: ${error.message || 'Erro desconhecido'}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" />
          Configuração do Mercado Pago (Administrador)
        </CardTitle>
        <CardDescription>
          Configure as credenciais do Mercado Pago para processar pagamentos quando usuários não têm suas próprias credenciais.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {errorMessage && (
          <div className="flex items-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-500">{errorMessage}</p>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accessToken">Token de Acesso</Label>
            <div className="relative">
              <Input
                id="accessToken"
                type="password"
                placeholder={hasCredentials ? "••••••••••••••••••••" : "APP_USR-0000000000000000-000000-00000000000000000000000000000000-000000000"}
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8"
                onClick={handleTest}
                disabled={isTesting || !accessToken}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testando...
                  </>
                ) : 'Testar'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Encontre este token em https://www.mercadopago.com.br/developers/panel/credentials
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="publicKey">Chave Pública</Label>
            <Input
              id="publicKey"
              placeholder={hasCredentials ? "••••••••••••••••••••" : "APP_USR-00000000-0000-0000-0000-000000000000"}
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="userId">ID do Usuário Mercado Pago</Label>
            <Input
              id="userId"
              placeholder={hasCredentials ? "••••••••••••••••••••" : "0000000000"}
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
        </div>
        
        {hasCredentials && (
          <div className="flex items-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-sm text-green-500">
              Credenciais do Mercado Pago configuradas
            </p>
          </div>
        )}
        
        <Button 
          className="w-full"
          disabled={isLoading}
          onClick={handleSave}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (hasCredentials ? 'Atualizar Credenciais' : 'Salvar Credenciais')}
        </Button>
      </CardContent>
    </Card>
  );
}
