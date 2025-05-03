
import React from 'react';
import { Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  company: string;
  text: string;
  imageUrl?: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Carlos Silva",
    company: "CS Contabilidade",
    text: "Reduzi 80% da inadimplência em 30 dias. Os clientes adoram a facilidade do pagamento por Pix.",
  },
  {
    name: "Ana Ferreira",
    company: "AF Arquitetura",
    text: "Economizo mais de 4h por semana com as automações. O sistema é extremamente intuitivo.",
  },
  {
    name: "Roberto Oliveira",
    company: "RO Consultoria",
    text: "Deixei de usar 3 ferramentas diferentes e centralizei tudo na plataforma. Controle total!",
  },
];

export const TestimonialSection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">O Que Dizem Nossos Clientes</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Veja como a HBlackPix tem transformado negócios por todo o Brasil.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="glass-card p-6 hover:border-primary/30 transition-all hover-float">
              <Quote className="h-8 w-8 text-primary/50 mb-4" />
              <p className="text-lg mb-6 italic">"{testimonial.text}"</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold mr-4">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Company logos */}
        <div className="mt-16 max-w-5xl mx-auto">
          <p className="text-center text-muted-foreground mb-6">Empresas que confiam em nós</p>
          <div className="flex flex-wrap justify-center gap-8 opacity-70">
            {/* Example company logos - replace with actual company logos */}
            <div className="h-12 w-24 bg-muted-foreground/20 rounded flex items-center justify-center">Logo 1</div>
            <div className="h-12 w-24 bg-muted-foreground/20 rounded flex items-center justify-center">Logo 2</div>
            <div className="h-12 w-24 bg-muted-foreground/20 rounded flex items-center justify-center">Logo 3</div>
            <div className="h-12 w-24 bg-muted-foreground/20 rounded flex items-center justify-center">Logo 4</div>
          </div>
        </div>
      </div>
    </section>
  );
};
