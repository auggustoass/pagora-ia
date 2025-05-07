
import React from 'react';
import { Plan, PlanColorScheme } from './types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PlanCardProps {
  plan: Plan;
  isProcessing: boolean;
  disabled: boolean;
  onSubscribe: (planId: string, planName: string) => void;
}

export const PlanCard = ({ plan, isProcessing, disabled, onSubscribe }: PlanCardProps) => {
  const colorScheme = getPlanColorScheme(plan.name);
  const creditsPerInvoice = plan.creditConsumption || 9;
  const totalInvoices = Math.floor((plan.invoiceCredits || 0) / creditsPerInvoice);
  const pricePerInvoice = plan.price / totalInvoices;

  return (
    <Card className="glass-card flex flex-col hover-float relative overflow-hidden">
      {/* Plan badge */}
      <div className={`absolute top-0 right-0 p-2 px-4 text-white ${colorScheme.badgeClass}`}>
        {plan.name === 'Basic' && '🟣'}
        {plan.name === 'Pro' && '🔵'}
        {plan.name === 'Enterprise' && '🟡'}
        {' '}{plan.name}
      </div>
      
      <CardHeader className="pt-16">
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">R${plan.price}</span>
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          <span className="font-semibold">{totalInvoices} faturas</span> (R${pricePerInvoice.toFixed(2)} por fatura)
        </div>
      </CardHeader>
      
      <CardContent className="flex-1">
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-5 w-5 text-pagora-success mr-2" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 text-sm text-muted-foreground">
          <span className="font-semibold">Consumo: {creditsPerInvoice} créditos por fatura</span>
        </div>
        <div className="mt-2 text-sm text-muted-foreground flex items-center justify-center">
          <span className="flex items-center">
            🔒 Sem contrato 
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="ml-1 h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Créditos adicionados após confirmação do pagamento</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={() => onSubscribe(plan.id, plan.name)} 
          className={`w-full bg-gradient-to-r ${colorScheme.gradientClass} ${colorScheme.hoverClass}`}
          disabled={isProcessing || disabled}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            `Comprar ${plan.invoiceCredits} créditos`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Function to get the color scheme for each plan
export function getPlanColorScheme(planName: string): PlanColorScheme {
  switch (planName) {
    case 'Basic':
      return {
        gradientClass: 'from-purple-600 to-purple-400',
        badgeClass: 'bg-purple-600',
        hoverClass: 'hover:bg-purple-700'
      };
    case 'Pro':
      return {
        gradientClass: 'from-blue-600 to-blue-400',
        badgeClass: 'bg-blue-600',
        hoverClass: 'hover:bg-blue-700'
      };
    case 'Enterprise':
      return {
        gradientClass: 'from-yellow-600 to-yellow-400',
        badgeClass: 'bg-yellow-600',
        hoverClass: 'hover:bg-yellow-700'
      };
    default:
      return {
        gradientClass: 'from-pagora-purple to-pagora-purple/80',
        badgeClass: 'bg-pagora-purple',
        hoverClass: 'hover:bg-pagora-purple/90'
      };
  }
}
