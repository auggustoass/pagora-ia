
import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
      { text: "5 cobranças/mês", included: true },
      { text: "Cobranças via WhatsApp", included: true },
      { text: "Pagamento via Pix", included: true },
      { text: "IA básica para mensagens", included: true },
      { text: "Suporte por e-mail", included: true },
      { text: "Dashboard básico", included: true },
    ]
  },
  {
    id: "pro",
    name: "Pro",
    price: 97,
    invoicesPerMonth: 15,
    popular: true,
    features: [
      { text: "15 cobranças/mês", included: true },
      { text: "Cobranças via WhatsApp", included: true },
      { text: "Pagamento via Pix", included: true },
      { text: "IA avançada para mensagens", included: true },
      { text: "Lembretes automáticos", included: true },
      { text: "Suporte por chat", included: true },
      { text: "Dashboard completo", included: true },
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 197,
    invoicesPerMonth: 50,
    popular: false,
    features: [
      { text: "50 cobranças/mês", included: true },
      { text: "Cobranças via WhatsApp", included: true },
      { text: "Pagamento via Pix", included: true },
      { text: "IA avançada personalizada", included: true },
      { text: "Lembretes programáveis", included: true },
      { text: "Suporte prioritário", included: true },
      { text: "Dashboard completo + Relatórios exportáveis", included: true },
    ]
  }
];

export const PricingSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Planos para quem quer parar de perder tempo cobrando</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para o seu negócio e comece a automatizar suas cobranças hoje mesmo.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={cn(
                "glass-card relative p-6 flex flex-col hover-float transition-all",
                plan.popular ? "border-[#aaff00] ring-1 ring-[#aaff00]" : ""
              )}
            >
              {plan.popular && (
                <Badge className="absolute top-0 right-6 -translate-y-1/2 bg-[#aaff00] text-black px-3 py-1 flex items-center text-sm font-medium">
                  <Star className="h-4 w-4 mr-1 fill-current" /> Mais vendido
                </Badge>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold">R${plan.price}</span>
                  <span className="text-muted-foreground ml-2">/mês</span>
                </div>
                <div className="mt-2 text-muted-foreground">
                  {plan.invoicesPerMonth} cobranças/mês
                </div>
              </div>
              
              <div className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="flex items-center"
                  >
                    <Check className="h-5 w-5 text-[#aaff00] mr-2 flex-shrink-0" />
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
                    ? "bg-[#aaff00] hover:bg-[#88cc00] text-black" 
                    : "bg-primary/80 hover:bg-primary"
                )}
              >
                <Link to="/auth?tab=signup">
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
