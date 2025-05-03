
import React from 'react';
import { Quote, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Testimonial {
  name: string;
  company: string;
  text: string;
  imageUrl?: string;
  rating: number;
  industry: string;
}

const testimonials: Testimonial[] = [
  {
    name: "João Silva",
    company: "Agência Criativa",
    industry: "Marketing Digital",
    text: "Economizei 10h/mês só com o lembrete automático. O sistema se paga sozinho só pela economia de tempo.",
    rating: 5
  },
  {
    name: "Larissa Oliveira",
    company: "LO Consultoria",
    industry: "Consultoria RH",
    text: "Finalmente parei de mandar Pix no dedo todo mês. Meus clientes adoram a praticidade e eu não preciso mais cobrar manualmente.",
    rating: 5
  },
  {
    name: "Felipe Santos",
    company: "FS Design",
    industry: "Design Freelancer",
    text: "Com 2 cliques gero tudo que preciso. O que mais me impressionou foi a IA que escreve as mensagens de cobrança.",
    rating: 5
  },
];

export const TestimonialSection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Empresas e freelancers que automatizaram suas cobranças</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Veja como a HBlackPix tem transformado negócios por todo o Brasil.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="glass-card p-6 hover:border-primary/30 transition-all hover-float relative">
              <div className="absolute top-6 right-6 flex">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-[#aaff00] fill-[#aaff00]" />
                ))}
              </div>
              
              <Quote className="h-8 w-8 text-primary/50 mb-4" />
              <p className="text-lg mb-6 italic">"{testimonial.text}"</p>
              
              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-4 border-2 border-[#aaff00]">
                  {testimonial.imageUrl ? (
                    <AvatarImage src={testimonial.imageUrl} alt={testimonial.name} />
                  ) : (
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {testimonial.name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                  <p className="text-xs text-primary">{testimonial.industry}</p>
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
            <div className="h-12 w-36 bg-muted-foreground/10 rounded flex items-center justify-center">Logo 1</div>
            <div className="h-12 w-36 bg-muted-foreground/10 rounded flex items-center justify-center">Logo 2</div>
            <div className="h-12 w-36 bg-muted-foreground/10 rounded flex items-center justify-center">Logo 3</div>
            <div className="h-12 w-36 bg-muted-foreground/10 rounded flex items-center justify-center">Logo 4</div>
          </div>
        </div>
      </div>
    </section>
  );
};
