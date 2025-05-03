
import React, { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PlanosObrigado = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mb-4">
          <Clock className="h-10 w-10 text-yellow-500" />
        </div>
        
        <h1 className="text-3xl font-bold">Pagamento em Processamento</h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl">
          Seu pedido de créditos foi registrado e está aguardando confirmação de pagamento.
        </p>
        
        <Alert className="bg-blue-500/10 border-blue-500/20 max-w-2xl">
          <AlertDescription className="text-blue-500">
            Seus créditos serão adicionados à sua conta automaticamente assim que o pagamento for confirmado pelo Mercado Pago. Este processo pode levar alguns minutos.
          </AlertDescription>
        </Alert>
        
        <div className="glass-card p-6 max-w-xl w-full">
          <h2 className="text-xl font-semibold mb-4">O que acontece agora?</h2>
          
          <ul className="space-y-3 text-left">
            <li className="flex items-start">
              <div className="bg-yellow-500/20 rounded-full p-1 mr-3 mt-1">
                <Clock className="h-4 w-4 text-yellow-500" />
              </div>
              <span>O Mercado Pago está <strong>processando seu pagamento</strong>. O tempo de confirmação varia conforme o método de pagamento escolhido.</span>
            </li>
            <li className="flex items-start">
              <div className="bg-pagora-success/20 rounded-full p-1 mr-3 mt-1">
                <CheckCircle className="h-4 w-4 text-pagora-success" />
              </div>
              <span>Quando o pagamento for confirmado, seus créditos serão <strong>adicionados automaticamente</strong> à sua conta.</span>
            </li>
            <li className="flex items-start">
              <div className="bg-pagora-success/20 rounded-full p-1 mr-3 mt-1">
                <CheckCircle className="h-4 w-4 text-pagora-success" />
              </div>
              <span>Você pode verificar seu saldo de créditos a qualquer momento no dashboard ou na página de configurações da assinatura.</span>
            </li>
          </ul>
        </div>
        
        <div className="flex space-x-4 pt-4">
          <Button
            onClick={() => navigate('/configuracoes/assinatura')}
            variant="outline"
            className="border-pagora-purple text-pagora-purple hover:bg-pagora-purple/10"
          >
            Verificar Status dos Créditos
          </Button>
          
          <Button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-pagora-purple to-pagora-purple/80 hover:bg-pagora-purple/90"
          >
            Ir para Dashboard
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default PlanosObrigado;
