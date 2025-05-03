
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ProblemSection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold">Cansado desses problemas?</h2>
          </div>
          
          <div className="space-y-6">
            <div className="glass-card p-6 hover:border-primary/30 transition-all">
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-red-500 mr-2">●</span>
                Você perde tempo cobrando clientes no WhatsApp?
              </h3>
              <p className="text-muted-foreground">
                Enviar mensagens manualmente para cada cliente é trabalhoso e ineficiente.
              </p>
            </div>
            
            <div className="glass-card p-6 hover:border-primary/30 transition-all">
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-red-500 mr-2">●</span>
                Tem boletos vencendo sem pagamento?
              </h3>
              <p className="text-muted-foreground">
                Inadimplência aumenta quando não há um sistema eficiente de lembretes e cobranças.
              </p>
            </div>
            
            <div className="glass-card p-6 hover:border-primary/30 transition-all">
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <span className="text-red-500 mr-2">●</span>
                Cansado de planilhas manuais e lembretes?
              </h3>
              <p className="text-muted-foreground">
                Gerenciar cobranças em planilhas é complicado e sujeito a erros.
              </p>
            </div>
            
            <div className="mt-12 text-center">
              <Button asChild size="lg" className="bg-[#aaff00] hover:bg-[#88cc00] text-black font-medium">
                <Link to="/auth">
                  👉 Quero parar de cobrar na mão
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
