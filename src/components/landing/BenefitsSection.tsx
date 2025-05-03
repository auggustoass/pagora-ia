
import React from 'react';
import { MessageSquare, Brain, BarChart2, Link2, Shield, X } from 'lucide-react';

export const BenefitsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background/95 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Sua cobrança recorrente e avulsa 100% automatizada</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Elimine o trabalho manual e recupere seu tempo valioso com nossas automações inteligentes.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Benefit 1 */}
          <div className="glass-card p-6 hover:border-primary/30 transition-all hover-float">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">IA que escreve e envia a cobrança</h3>
            <p className="text-muted-foreground">
              Nossa inteligência artificial escreve mensagens personalizadas para seus clientes com o tom perfeito.
            </p>
          </div>
          
          {/* Benefit 2 */}
          <div className="glass-card p-6 hover:border-primary/30 transition-all hover-float">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Lembrete automático no WhatsApp</h3>
            <p className="text-muted-foreground">
              Envio programado de lembretes de pagamento sem você precisar se preocupar.
            </p>
          </div>
          
          {/* Benefit 3 */}
          <div className="glass-card p-6 hover:border-primary/30 transition-all hover-float">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
              <Link2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Link de pagamento Pix único ou recorrente</h3>
            <p className="text-muted-foreground">
              Gere links de pagamento Pix para cobranças únicas ou recorrentes em segundos.
            </p>
          </div>
          
          {/* Benefit 4 */}
          <div className="glass-card p-6 hover:border-primary/30 transition-all hover-float">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
              <BarChart2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Relatórios de quem pagou ou não</h3>
            <p className="text-muted-foreground">
              Acompanhe em tempo real quem pagou, quem está atrasado e quanto você já recebeu.
            </p>
          </div>
          
          {/* Benefit 5 */}
          <div className="glass-card p-6 hover:border-primary/30 transition-all hover-float">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Recebimento direto via Mercado Pago</h3>
            <p className="text-muted-foreground">
              Seu dinheiro cai diretamente na sua conta do Mercado Pago com total segurança.
            </p>
          </div>
          
          {/* Benefit 6 */}
          <div className="glass-card p-6 hover:border-primary/30 transition-all hover-float">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
              <X className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Sem % sobre seus pagamentos</h3>
            <p className="text-muted-foreground">
              Diferente de outras plataformas, não cobramos comissão sobre seus recebimentos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
