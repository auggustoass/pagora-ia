
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Copy, Send } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

interface ApiResponse {
  status: number;
  data?: any;
  error?: any;
  timestamp: string;
}

export function ApiEndpointTester() {
  const [endpoint, setEndpoint] = useState('');
  const [method, setMethod] = useState('POST');
  const [payload, setPayload] = useState('{}');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const predefinedEndpoints = [
    {
      name: 'Generate Invoice Payment',
      endpoint: 'generate-invoice-payment',
      method: 'POST',
      payload: '{"invoiceId": "uuid-here"}'
    },
    {
      name: 'Process Payment Webhook',
      endpoint: 'process-payment-webhook',
      method: 'POST',
      payload: '{"type": "payment", "data": {}}'
    },
    {
      name: 'Generate Notification',
      endpoint: 'generate-notification',
      method: 'POST',
      payload: '{"userId": "uuid-here", "type": "info", "title": "Test", "content": "Test notification"}'
    },
    {
      name: 'Check Notification Triggers',
      endpoint: 'check-notification-triggers',
      method: 'POST',
      payload: '{}'
    },
    {
      name: 'Process Chat',
      endpoint: 'process-chat',
      method: 'POST',
      payload: '{"message": "Hello", "conversationId": "test"}'
    }
  ];

  const handleTestEndpoint = async () => {
    if (!endpoint.trim()) {
      toast.error('Digite o nome do endpoint');
      return;
    }

    setIsLoading(true);
    
    try {
      let parsedPayload = {};
      if (payload.trim()) {
        try {
          parsedPayload = JSON.parse(payload);
        } catch {
          throw new Error('Payload JSON inválido');
        }
      }

      const startTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: parsedPayload
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (error) {
        setResponse({
          status: error.status || 400,
          error: error,
          timestamp: new Date().toISOString()
        });
      } else {
        setResponse({
          status: 200,
          data: data,
          timestamp: new Date().toISOString()
        });
      }

      console.log(`API call completed in ${responseTime}ms`);
    } catch (error) {
      console.error('Error testing endpoint:', error);
      setResponse({
        status: 500,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência');
  };

  const loadPredefinedEndpoint = (predefined: typeof predefinedEndpoints[0]) => {
    setEndpoint(predefined.endpoint);
    setMethod(predefined.method);
    setPayload(predefined.payload);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Testador de Endpoints
          </CardTitle>
          <CardDescription>
            Teste os endpoints da aplicação diretamente pelo painel admin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endpoint">Endpoint</Label>
              <Input
                id="endpoint"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="nome-do-endpoint"
                className="font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="method">Método</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payload">Payload (JSON)</Label>
            <Textarea
              id="payload"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              placeholder='{"key": "value"}'
              rows={4}
              className="font-mono text-sm"
            />
          </div>

          <Button 
            onClick={handleTestEndpoint} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Testando...' : 'Testar Endpoint'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endpoints Predefinidos</CardTitle>
          <CardDescription>
            Clique em um endpoint para carregar automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {predefinedEndpoints.map((predefined, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => loadPredefinedEndpoint(predefined)}
                className="justify-start"
              >
                <Badge variant="secondary" className="mr-2">
                  {predefined.method}
                </Badge>
                {predefined.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {response && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {response.status >= 200 && response.status < 300 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                Resposta
              </span>
              <div className="flex items-center gap-2">
                <Badge variant={response.status >= 200 && response.status < 300 ? "default" : "destructive"}>
                  {response.status}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(JSON.stringify(response, null, 2))}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">
                  Timestamp: {new Date(response.timestamp).toLocaleString()}
                </Label>
              </div>
              
              <div className="space-y-2">
                <Label>Dados de Resposta:</Label>
                <pre className="bg-muted p-3 rounded-md text-sm overflow-auto max-h-96">
                  {JSON.stringify(response.data || response.error, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Este testador utiliza as edge functions do Supabase. 
          Certifique-se de que as funções estão deployadas e funcionando corretamente.
        </AlertDescription>
      </Alert>
    </div>
  );
}
