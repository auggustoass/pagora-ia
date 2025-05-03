
import React from 'react';
import { CheckCircle, Lock, Shield } from 'lucide-react';

export const SecuritySection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">Tranquilidade e Segurança</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Seu negócio protegido com as melhores práticas de segurança.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Item 1 */}
            <div className="glass-card p-6 hover:border-primary/30 transition-all hover-float">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sem contrato fixo</h3>
              <p className="text-muted-foreground">
                Cancele quando quiser. Sem multas ou taxas escondidas.
              </p>
            </div>
            
            {/* Item 2 */}
            <div className="glass-card p-6 hover:border-primary/30 transition-all hover-float">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
                <Lock size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dados protegidos</h3>
              <p className="text-muted-foreground">
                Seus dados e de seus clientes protegidos com criptografia avançada.
              </p>
            </div>
            
            {/* Item 3 */}
            <div className="glass-card p-6 hover:border-primary/30 transition-all hover-float">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Suporte humano</h3>
              <p className="text-muted-foreground">
                Equipe de suporte disponível para ajudar quando precisar.
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <div className="inline-flex items-center justify-center gap-4 p-4 border border-primary/20 rounded-lg">
              <img 
                src="/images/mercadopago-logo.png" 
                alt="Mercado Pago" 
                className="h-10"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/200x100/10b981/FFFFFF?text=Mercado+Pago';
                }}
              />
              <div className="text-left">
                <h4 className="font-semibold">Segurança Mercado Pago</h4>
                <p className="text-sm text-muted-foreground">Pagamentos processados com segurança</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
