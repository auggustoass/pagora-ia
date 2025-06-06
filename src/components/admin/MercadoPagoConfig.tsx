
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MercadoPagoCredentials {
  access_token: string;
  public_key: string;
  user_mercado_pago_id: string;
}

export function MercadoPagoConfig() {
  const [credentials, setCredentials] = useState<MercadoPagoCredentials>({
    access_token: '',
    public_key: '',
    user_mercado_pago_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCredentials();
  }, []);

  async function loadCredentials() {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-mercado-pago', {
        body: { action: 'get' }
      });

      if (error) {
        console.error('Erro ao carregar credenciais:', error);
        return;
      }

      if (data?.has_credentials) {
        setHasCredentials(true);
        setCredentials({
          access_token: data.access_token || '',
          public_key: data.public_key || '',
          user_mercado_pago_id: data.user_mercado_pago_id || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar credenciais:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar credenciais do Mercado Pago",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  async function testCredentials() {
    if (!credentials.access_token) {
      toast({
        title: "Erro",
        description: "Access Token é obrigatório para o teste",
        variant: "destructive"
      });
      return;
    }

    try {
      setTesting(true);
      setTestResult(null);

      const { data, error } = await supabase.functions.invoke('admin-mercado-pago', {
        body: { 
          action: 'test',
          access_token: credentials.access_token
        }
      });

      if (error) {
        setTestResult({
          success: false,
          message: `Erro no teste: ${error.message}`
        });
        return;
      }

      if (data?.success) {
        setTestResult({
          success: true,
          message: `Credenciais válidas! Usuário: ${data.user?.first_name || 'N/A'}`
        });
      } else {
        setTestResult({
          success: false,
          message: data?.error || 'Credenciais inválidas'
        });
      }
    } catch (error) {
      console.error('Erro ao testar credenciais:', error);
      setTestResult({
        success: false,
        message: 'Falha ao testar credenciais'
      });
    } finally {
      setTesting(false);
    }
  }

  async function saveCredentials() {
    if (!credentials.access_token || !credentials.public_key || !credentials.user_mercado_pago_id) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('admin-mercado-pago', {
        body: { 
          action: 'create',
          ...credentials
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        setHasCredentials(true);
        toast({
          title: "Sucesso",
          description: "Credenciais do Mercado Pago salvas com sucesso"
        });
      } else {
        throw new Error(data?.error || 'Erro ao salvar credenciais');
      }
    } catch (error) {
      console.error('Erro ao salvar credenciais:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar credenciais do Mercado Pago",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (field: keyof MercadoPagoCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    setTestResult(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Configuração do Mercado Pago
          </CardTitle>
          <CardDescription>
            Configure as credenciais globais do Mercado Pago para o sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="access_token">Access Token</Label>
            <Input
              id="access_token"
              type="password"
              placeholder="APP_USR-..."
              value={credentials.access_token}
              onChange={(e) => handleInputChange('access_token', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="public_key">Public Key</Label>
            <Input
              id="public_key"
              placeholder="APP_USR-..."
              value={credentials.public_key}
              onChange={(e) => handleInputChange('public_key', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user_mercado_pago_id">User ID do Mercado Pago</Label>
            <Input
              id="user_mercado_pago_id"
              placeholder="123456789"
              value={credentials.user_mercado_pago_id}
              onChange={(e) => handleInputChange('user_mercado_pago_id', e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={testCredentials}
              disabled={testing || !credentials.access_token}
              variant="outline"
            >
              {testing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Testar Credenciais
            </Button>

            <Button
              onClick={saveCredentials}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {hasCredentials ? 'Atualizar' : 'Salvar'} Credenciais
            </Button>
          </div>

          {testResult && (
            <Alert className={testResult.success ? "border-green-500/50 bg-green-500/10" : "border-gray-500/50 bg-gray-500/10"}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-400" />
              )}
              <AlertDescription className={testResult.success ? "text-green-300" : "text-gray-300"}>
                {testResult.message}
              </AlertDescription>
            </Alert>
          )}

          {hasCredentials && (
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-300">
                Credenciais do Mercado Pago já foram configuradas no sistema
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
