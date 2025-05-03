
import React from 'react';
import { Repeat, Briefcase, BookOpen, FileText } from 'lucide-react';

export const ChargeTypesSection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Funciona para todo tipo de cobrança</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nossa plataforma se adapta facilmente ao seu modelo de negócio e tipo de cobrança.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {/* Charge Type 1 */}
          <div className="glass-card p-6 hover:border-primary/30 transition-all hover-float">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
              <Repeat className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Planos mensais</h3>
            <p className="text-muted-foreground">
              Ideal para assinaturas, mensalidades e serviços de consultoria recorrentes.
            </p>
            <div className="mt-4 text-sm font-medium text-primary">
              Exemplo: Consultoria mensal, SaaS, assinaturas
            </div>
          </div>
          
          {/* Charge Type 2 */}
          <div className="glass-card p-6 hover:border-primary/30 transition-all hover-float">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Serviços avulsos</h3>
            <p className="text-muted-foreground">
              Perfeito para cobranças únicas de projetos e entregas específicas.
            </p>
            <div className="mt-4 text-sm font-medium text-primary">
              Exemplo: Design, marketing, eventos, projetos
            </div>
          </div>
          
          {/* Charge Type 3 */}
          <div className="glass-card p-6 hover:border-primary/30 transition-all hover-float">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Cursos e mentorias</h3>
            <p className="text-muted-foreground">
              Ideal para pagamentos de cursos, mentorias e aulas particulares.
            </p>
            <div className="mt-4 text-sm font-medium text-primary">
              Exemplo: Aulas online, mentorias, workshops
            </div>
          </div>
          
          {/* Charge Type 4 */}
          <div className="glass-card p-6 hover:border-primary/30 transition-all hover-float">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Boletos convertidos</h3>
            <p className="text-muted-foreground">
              Converta boletos antigos em Pix e aumente suas chances de recebimento.
            </p>
            <div className="mt-4 text-sm font-medium text-primary">
              Exemplo: Faturas vencidas, renegociações, acordos
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
