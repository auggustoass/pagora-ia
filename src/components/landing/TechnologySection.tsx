
import React from 'react';
import { Brain, MessageSquare, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const TechnologySection = () => {
  const scrollToDemo = () => {
    const demoSection = document.getElementById('demo-section');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">Tecnologia que trabalha por você</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Combinamos tecnologias avançadas para criar a mais completa solução de cobrança automatizada.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Technology 1 */}
            <div className="glass-card p-6 hover:border-primary/30 transition-all hover-float">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
                <Link2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Integração com Mercado Pago</h3>
              <p className="text-muted-foreground">
                Receba pagamentos diretamente na sua conta do Mercado Pago sem taxas adicionais além das do próprio serviço.
              </p>
              <img 
                src="/images/mercadopago-logo.png" 
                alt="Mercado Pago" 
                className="h-8 mt-4 opacity-80"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/160x40/1a1a1a/88cc00?text=Mercado+Pago';
                }}
              />
            </div>
            
            {/* Technology 2 */}
            <div className="glass-card p-6 hover:border-primary/30 transition-all hover-float">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">IA que entende seu cliente</h3>
              <p className="text-muted-foreground">
                Nossa inteligência artificial analisa o histórico do cliente e cria mensagens personalizadas para aumentar suas chances de recebimento.
              </p>
              <div className="mt-4 p-2 rounded bg-primary/10 text-xs">
                "Olá João, notamos que seu pagamento de R$297 venceu ontem. Poderia verificar? Segue o link do Pix para facilitar..."
              </div>
            </div>
            
            {/* Technology 3 */}
            <div className="glass-card p-6 hover:border-primary/30 transition-all hover-float">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">WhatsApp com API oficial</h3>
              <p className="text-muted-foreground">
                Utilizamos a Evolution API para garantir o envio seguro e confiável de mensagens sem risco de bloqueio.
              </p>
              <img 
                src="/images/whatsapp-logo.png" 
                alt="WhatsApp API" 
                className="h-8 mt-4 opacity-80"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/160x40/1a1a1a/88cc00?text=WhatsApp+API';
                }}
              />
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Button
              variant="outline"
              onClick={scrollToDemo}
              className="border-primary hover:bg-primary/10"
            >
              Ver como funciona
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
