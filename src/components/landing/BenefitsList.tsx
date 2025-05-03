
import React from 'react';
import { MessageSquare, Brain, BarChart2, Lock, Monitor } from 'lucide-react';

export const BenefitsList = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background/95 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Benefícios da Plataforma</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nossa plataforma foi construída para otimizar seus processos de cobrança e maximizar seus resultados.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Benefit 1 */}
          <div className="glass-card p-6 hover:border-primary/30 transition-all hover-float">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">WhatsApp Automático</h3>
            <p className="text-muted-foreground">
              Envio automático de cobranças via WhatsApp para seus clientes no momento certo.
            </p>
          </div>
          
          {/* Benefit 2 */}
          <div className="glass-card p-6 hover:border-primary/30 transition-all hover-float">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
              <Brain size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Assistente com IA</h3>
            <p className="text-muted-foreground">
              Nosso assistente com IA escreve mensagens personalizadas para cada cliente e situação.
            </p>
          </div>
          
          {/* Benefit 3 */}
          <div className="glass-card p-6 hover:border-primary/30 transition-all hover-float">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
              <BarChart2 size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Relatórios e Insights</h3>
            <p className="text-muted-foreground">
              Acompanhe resultados e métricas importantes do seu faturamento em tempo real.
            </p>
          </div>
          
          {/* Benefit 4 */}
          <div className="glass-card p-6 hover:border-primary/30 transition-all hover-float">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
              <Lock size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Segurança Mercado Pago</h3>
            <p className="text-muted-foreground">
              Tranquilidade com pagamentos via Pix processados com a segurança do Mercado Pago.
            </p>
          </div>
          
          {/* Benefit 5 */}
          <div className="glass-card p-6 hover:border-primary/30 transition-all hover-float">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
              <Monitor size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Dashboard Completo</h3>
            <p className="text-muted-foreground">
              Visualize todas suas cobranças, pagamentos e status em um painel intuitivo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
