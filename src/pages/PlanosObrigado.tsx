
import React, { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const PlanosObrigado = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-pagora-success/20 flex items-center justify-center mb-4">
          <CheckCircle className="h-10 w-10 text-pagora-success" />
        </div>
        
        <h1 className="text-3xl font-bold">Créditos Adicionados com Sucesso!</h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl">
          Obrigado por adquirir créditos. Seus créditos já estão disponíveis para uso!
        </p>
        
        <div className="glass-card p-6 max-w-xl w-full">
          <h2 className="text-xl font-semibold mb-4">O que acontece agora?</h2>
          
          <ul className="space-y-3 text-left">
            <li className="flex items-start">
              <div className="bg-pagora-success/20 rounded-full p-1 mr-3 mt-1">
                <CheckCircle className="h-4 w-4 text-pagora-success" />
              </div>
              <span>Você tem <strong>acesso imediato</strong> aos créditos adquiridos para gerar faturas.</span>
            </li>
            <li className="flex items-start">
              <div className="bg-pagora-success/20 rounded-full p-1 mr-3 mt-1">
                <CheckCircle className="h-4 w-4 text-pagora-success" />
              </div>
              <span>Cada crédito permite gerar uma nova fatura. Quando seus créditos acabarem, basta adquirir mais.</span>
            </li>
            <li className="flex items-start">
              <div className="bg-pagora-success/20 rounded-full p-1 mr-3 mt-1">
                <CheckCircle className="h-4 w-4 text-pagora-success" />
              </div>
              <span>Você pode verificar seu saldo de créditos no dashboard ou configurações.</span>
            </li>
          </ul>
        </div>
        
        <div className="flex space-x-4 pt-4">
          <Button
            onClick={() => navigate('/configuracoes/assinatura')}
            variant="outline"
            className="border-pagora-purple text-pagora-purple hover:bg-pagora-purple/10"
          >
            Gerenciar Assinatura
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
