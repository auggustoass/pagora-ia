
import React from 'react';
import { Users, FileText, MessageSquare } from 'lucide-react';

export const HowItWorks = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Como Funciona</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Automatize suas cobranças em 3 passos simples e pare de perder tempo com cobranças manuais.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Passo 1 */}
          <div className="glass-card p-6 space-y-4 hover-float transition-all">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold">
              1
            </div>
            <div className="h-16 flex items-center justify-center text-primary">
              <Users size={48} />
            </div>
            <h3 className="text-xl font-semibold">Cadastre seu cliente</h3>
            <p className="text-muted-foreground">
              Informe apenas nome, CPF e número do WhatsApp do seu cliente.
            </p>
          </div>
          
          {/* Passo 2 */}
          <div className="glass-card p-6 space-y-4 hover-float transition-all">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold">
              2
            </div>
            <div className="h-16 flex items-center justify-center text-primary">
              <FileText size={48} />
            </div>
            <h3 className="text-xl font-semibold">Gere a fatura</h3>
            <p className="text-muted-foreground">
              Crie a fatura em segundos com nossa ferramenta inteligente.
            </p>
          </div>
          
          {/* Passo 3 */}
          <div className="glass-card p-6 space-y-4 hover-float transition-all">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold">
              3
            </div>
            <div className="h-16 flex items-center justify-center text-primary">
              <MessageSquare size={48} />
            </div>
            <h3 className="text-xl font-semibold">Cobrança automática</h3>
            <p className="text-muted-foreground">
              A fatura é enviada via WhatsApp com link para pagamento Pix.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
