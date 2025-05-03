
import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  invoicesPerMonth: number;
  popular: boolean;
  features: PlanFeature[];
}

const plans: PricingPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 49,
    invoicesPerMonth: 5,
    popular: false,
    features: [
      { text: "Cobranças automáticas via WhatsApp", included: true },
      { text: "Pagamento via Pix", included: true },
      { text: "Dashboard básico", included: true },
      { text: "Suporte por e-mail", included: true },
      { text: "IA para geração de mensagens", included: false },
      { text: "Relatórios avançados", included: false },
    ]
  },
  {
    id: "pro",
    name: "Pro",
    price: 97,
    invoicesPerMonth: 15,
    popular: true,
    features: [
      { text: "Cobranças automáticas via WhatsApp", included: true },
      { text: "Pagamento via Pix", included: true },
      { text: "Dashboard completo", included: true },
      { text: "Suporte por chat", included: true },
      { text: "IA avançada para mensagens", included: true },
      { text: "Relatórios básicos", included: true },
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 197,
    invoicesPerMonth: 50,
    popular: false,
    features: [
      { text: "Cobranças automáticas via WhatsApp", included: true },
      { text: "Pagamento via Pix", included: true },
      { text: "Dashboard completo", included: true },
      { text: "Suporte prioritário", included: true },
      { text: "IA avançada personalizada", included: true },
      { text: "Relatórios exportáveis", included: true },
    ]
  }
];

export const PricingSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Escolha seu Plano</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Preços acessíveis para todos os tamanhos de negócio. Comece agora mesmo!
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={cn(
                "glass-card relative p-6 flex flex-col hover-float transition-all",
                plan.popular ? "border-primary ring-1 ring-primary" : ""
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-primary text-white px-3 py-1 rounded-full flex items-center text-sm font-medium">
                  <Star className="h-4 w-4 mr-1 fill-white" /> Mais vendido
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold">R${plan.price}</span>
                  <span className="text-muted-foreground ml-2">/mês</span>
                </div>
                <div className="mt-2 text-muted-foreground">
                  {plan.invoicesPerMonth} faturas/mês
                </div>
              </div>
              
              <div className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "flex items-center",
                      !feature.included && "text-muted-foreground/70"
                    )}
                  >
                    {feature.included ? (
                      <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border border-muted-foreground/40 mr-2 flex-shrink-0" />
                    )}
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                asChild 
                size="lg" 
                className={cn(
                  "w-full",
                  plan.popular 
                    ? "bg-primary hover:bg-primary/90" 
                    : "bg-primary/80 hover:bg-primary"
                )}
              >
                <Link to="/auth">
                  Começar agora
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
