import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Check, AlertCircle, Info } from 'lucide-react';
import { PlanService } from '@/services/PlanService';
import { CreditsService } from '@/services/CreditsService';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EndpointTestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

export function ApiEndpointTester() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, EndpointTestResult | null>>({});

  // Test the plan listing endpoint
  const testListPlans = async () => {
    setLoading(prev => ({ ...prev, listPlans: true }));
    setResults(prev => ({ ...prev, listPlans: null }));
    
    try {
      const plans = await PlanService.getPlans();
      
      if (Array.isArray(plans) && plans.length > 0) {
        setResults(prev => ({
          ...prev, 
          listPlans: {
            success: true,
            message: `Sucesso! Recuperados ${plans.length} planos.`,
            data: plans
          }
        }));
        toast.success(`Endpoint de listagem de planos funcionando corretamente!`);
      } else {
        setResults(prev => ({
          ...prev, 
          listPlans: {
            success: false,
            message: 'O endpoint retornou uma resposta vazia ou inválida',
            data: plans
          }
        }));
        toast.error('Endpoint de listagem de planos retornou dados inválidos');
      }
    } catch (error: any) {
      console.error('Error testing plans/list endpoint:', error);
      setResults(prev => ({
        ...prev, 
        listPlans: {
          success: false,
          message: error.message || 'Erro ao testar o endpoint',
          error
        }
      }));
      toast.error(`Falha no endpoint de listagem de planos: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, listPlans: false }));
    }
  };

  // Test credits fetch endpoint
  const testGetCredits = async () => {
    setLoading(prev => ({ ...prev, getCredits: true }));
    setResults(prev => ({ ...prev, getCredits: null }));
    
    try {
      const credits = await CreditsService.getCredits();
      
      if (credits && (typeof credits === 'object')) {
        setResults(prev => ({
          ...prev, 
          getCredits: {
            success: true,
            message: 'Sucesso! Créditos recuperados.',
            data: credits
          }
        }));
        toast.success('Endpoint de consulta de créditos funcionando corretamente!');
      } else {
        setResults(prev => ({
          ...prev, 
          getCredits: {
            success: false,
            message: 'O endpoint retornou uma resposta inválida',
            data: credits
          }
        }));
        toast.error('Endpoint de consulta de créditos retornou dados inválidos');
      }
    } catch (error: any) {
      console.error('Error testing credits/get endpoint:', error);
      setResults(prev => ({
        ...prev, 
        getCredits: {
          success: false,
          message: error.message || 'Erro ao testar o endpoint',
          error
        }
      }));
      toast.error(`Falha no endpoint de consulta de créditos: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, getCredits: false }));
    }
  };

  // Test credit consumption endpoint with a minimal amount (just for testing)
  const testConsumeCredits = async () => {
    setLoading(prev => ({ ...prev, consumeCredits: true }));
    setResults(prev => ({ ...prev, consumeCredits: null }));
    
    try {
      // Use a very small amount just for testing
      const testAmount = 1;
      const result = await CreditsService.consumeCredits(testAmount);
      
      if (result) {
        setResults(prev => ({
          ...prev, 
          consumeCredits: {
            success: true,
            message: `Sucesso! ${testAmount} crédito consumido para teste.`,
            data: result
          }
        }));
        toast.success('Endpoint de consumo de créditos funcionando corretamente!');
      } else {
        setResults(prev => ({
          ...prev, 
          consumeCredits: {
            success: false,
            message: 'O endpoint retornou uma resposta inválida',
            data: result
          }
        }));
        toast.error('Endpoint de consumo de créditos retornou dados inválidos');
      }
    } catch (error: any) {
      console.error('Error testing credits/consume endpoint:', error);
      setResults(prev => ({
        ...prev, 
        consumeCredits: {
          success: false,
          message: error.message || 'Erro ao testar o endpoint',
          error
        }
      }));
      toast.error(`Falha no endpoint de consumo de créditos: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, consumeCredits: false }));
    }
  };

  // Test plan subscription endpoint (new function)
  const testSubscribeToPlan = async () => {
    setLoading(prev => ({ ...prev, subscribeToPlan: true }));
    setResults(prev => ({ ...prev, subscribeToPlan: null }));
    
    try {
      // For testing purposes, we'll use a test plan ID and user ID
      // In a real scenario, these would come from the authenticated user and selected plan
      const testPlanId = 'test-plan-id';
      const testUserId = 'test-user-id'; 
      
      // Call the subscribe endpoint
      const checkoutUrl = await PlanService.subscribeToPlan(testPlanId, testUserId);
      
      if (checkoutUrl) {
        setResults(prev => ({
          ...prev, 
          subscribeToPlan: {
            success: true,
            message: 'Sucesso! URL de checkout do Mercado Pago gerada.',
            data: { url: checkoutUrl }
          }
        }));
        toast.success('Endpoint de assinatura de plano funcionando corretamente!');
      } else {
        setResults(prev => ({
          ...prev, 
          subscribeToPlan: {
            success: false,
            message: 'O endpoint retornou uma resposta inválida ou vazia',
            data: { url: checkoutUrl }
          }
        }));
        toast.error('Endpoint de assinatura de plano retornou dados inválidos');
      }
    } catch (error: any) {
      console.error('Error testing plans/subscribe endpoint:', error);
      setResults(prev => ({
        ...prev, 
        subscribeToPlan: {
          success: false,
          message: error.message || 'Erro ao testar o endpoint',
          error
        }
      }));
      toast.error(`Falha no endpoint de assinatura de plano: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, subscribeToPlan: false }));
    }
  };

  // Render test result as an alert component
  const renderTestResult = (endpointKey: string) => {
    const result = results[endpointKey];
    
    if (!result) return null;
    
    return (
      <Alert className={`mt-4 ${result.success ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
        {result.success ? 
          <Check className="h-4 w-4 text-green-500" /> : 
          <AlertCircle className="h-4 w-4 text-red-500" />
        }
        <AlertDescription className={result.success ? 'text-green-500' : 'text-red-500'}>
          {result.message}
          {result.data && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm">Ver detalhes da resposta</summary>
              <pre className="mt-2 p-2 bg-black/20 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </details>
          )}
          {result.error && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm">Ver detalhes do erro</summary>
              <pre className="mt-2 p-2 bg-black/20 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(result.error, null, 2)}
              </pre>
            </details>
          )}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tester de Endpoints n8n</CardTitle>
          <CardDescription>
            Use esta ferramenta para verificar se os endpoints da API do n8n estão funcionando corretamente
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Esta ferramenta é apenas para teste e diagnóstico. Pequenas quantidades de recursos podem ser utilizadas durante os testes.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Endpoint de Listagem de Planos</h3>
              <p className="text-sm text-muted-foreground mb-2">Testa o endpoint que recupera os planos disponíveis</p>
              <Button 
                onClick={testListPlans} 
                disabled={loading.listPlans}
                variant="outline"
              >
                {loading.listPlans ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testando...
                  </>
                ) : "Testar Listagem de Planos"}
              </Button>
              {renderTestResult('listPlans')}
            </div>

            <div>
              <h3 className="text-lg font-medium">Endpoint de Consulta de Créditos</h3>
              <p className="text-sm text-muted-foreground mb-2">Testa o endpoint que recupera os créditos do usuário</p>
              <Button 
                onClick={testGetCredits} 
                disabled={loading.getCredits}
                variant="outline"
              >
                {loading.getCredits ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testando...
                  </>
                ) : "Testar Consulta de Créditos"}
              </Button>
              {renderTestResult('getCredits')}
            </div>

            <div>
              <h3 className="text-lg font-medium">Endpoint de Consumo de Créditos</h3>
              <p className="text-sm text-muted-foreground mb-2">Testa o endpoint que consome créditos (usa 1 crédito para teste)</p>
              <Button 
                onClick={testConsumeCredits} 
                disabled={loading.consumeCredits}
                variant="outline"
              >
                {loading.consumeCredits ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testando...
                  </>
                ) : "Testar Consumo de Créditos"}
              </Button>
              {renderTestResult('consumeCredits')}
            </div>

            {/* New section for Subscribe to Plan endpoint */}
            <div>
              <h3 className="text-lg font-medium">Endpoint de Assinatura de Plano</h3>
              <p className="text-sm text-muted-foreground mb-2">Testa o endpoint que processa a assinatura de um plano</p>
              <Button 
                onClick={testSubscribeToPlan} 
                disabled={loading.subscribeToPlan}
                variant="outline"
              >
                {loading.subscribeToPlan ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testando...
                  </>
                ) : "Testar Assinatura de Plano"}
              </Button>
              {renderTestResult('subscribeToPlan')}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Os testes enviaram requisições reais para a API n8n
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
