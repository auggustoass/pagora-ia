
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export function AdminMercadoPago() {
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [userId, setUserId] = useState('');
  const [hasCredentials, setHasCredentials] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCredentials();
    }
  }, [user]);

  const fetchCredentials = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('admin-mercado-pago', {
        body: { action: 'get' }
      });

      if (error) {
        console.error('Error fetching credentials:', error);
        return;
      }

      if (data && data.has_credentials) {
        setPublicKey(data.public_key);
        setUserId(data.user_mercado_pago_id);
        setHasCredentials(true);
        setAccessToken(''); // Don't set the actual token for security
      }
    } catch (error) {
      console.error('Error fetching credentials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!accessToken) {
      toast.error('Por favor, insira um token de acesso');
      return;
    }

    try {
      setIsTesting(true);
      const { data, error } = await supabase.functions.invoke('admin-mercado-pago', {
        body: { action: 'test', access_token: accessToken }
      });

      if (error) {
        toast.error('Erro ao testar credenciais: ' + error.message);
        return;
      }

      if (data.success) {
        toast.success('Credenciais válidas!');
      } else {
        toast.error('Credenciais inválidas');
      }
    } catch (error) {
      console.error('Error testing credentials:', error);
      toast.error('Erro ao testar credenciais');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!accessToken || !publicKey || !userId) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-mercado-pago', {
        body: {
          action: 'create',
          access_token: accessToken,
          public_key: publicKey,
          user_mercado_pago_id: userId
        }
      });

      if (error) {
        toast.error('Erro ao salvar credenciais: ' + error.message);
        return;
      }

      toast.success('Credenciais salvas com sucesso!');
      setHasCredentials(true);
      setAccessToken(''); // Clear for security
    } catch (error) {
      console.error('Error saving credentials:', error);
      toast.error('Erro ao salvar credenciais');
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
                {isTesting ? 'Testando...' : 'Testar'}
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
          {isLoading ? 'Salvando...' : hasCredentials ? 'Atualizar Credenciais' : 'Salvar Credenciais'}
        </Button>
      </CardContent>
    </Card>
  );
}
