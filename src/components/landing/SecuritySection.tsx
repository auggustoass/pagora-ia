
import React from 'react';
import { Shield, Lock, Brain, MessageSquare } from 'lucide-react';

export const SecuritySection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">Seu dinheiro e seus dados seguros</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Priorizamos a segurança em todos os aspectos da nossa plataforma.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Security Item 1 */}
            <div className="glass-card p-6 hover:border-primary/30 transition-all hover-float">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pix direto para sua conta</h3>
              <p className="text-muted-foreground">
                Os pagamentos são processados diretamente para sua conta do Mercado Pago sem intermediários.
              </p>
            </div>
            
            {/* Security Item 2 */}
            <div className="glass-card p-6 hover:border-primary/30 transition-all hover-float">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Segurança com Supabase</h3>
              <p className="text-muted-foreground">
                Seus dados são protegidos com criptografia avançada e armazenados com segurança na Supabase.
              </p>
            </div>
            
            {/* Security Item 3 */}
            <div className="glass-card p-6 hover:border-primary/30 transition-all hover-float">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">IA auditável</h3>
              <p className="text-muted-foreground">
                Nossa IA é transparente e você pode revisar todas as mensagens antes que sejam enviadas.
              </p>
            </div>
            
            {/* Security Item 4 */}
            <div className="glass-card p-6 hover:border-primary/30 transition-all hover-float">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Suporte real</h3>
              <p className="text-muted-foreground">
                Conte com suporte humano por WhatsApp e chat para resolver qualquer questão.
              </p>
            </div>
          </div>
          
          <div className="mt-12 p-6 glass-card border-[#aaff00]/30 max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-shrink-0">
                <Shield className="h-12 w-12 text-[#aaff00]" />
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">Compromisso com sua segurança</h4>
                <p className="text-muted-foreground">
                  Seguimos as melhores práticas de segurança e estamos em conformidade com a LGPD. Seus dados nunca são compartilhados com terceiros sem seu consentimento expresso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
