
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export const PlanInfoBanner = () => {
  return (
    <Alert className="bg-blue-500/10 border-blue-500/20">
      <AlertDescription className="text-blue-500">
        <div className="flex items-center">
          <Info className="mr-2 h-4 w-4" />
          Após a confirmação do pagamento pelo Mercado Pago, seus créditos serão adicionados automaticamente à sua conta.
        </div>
      </AlertDescription>
    </Alert>
  );
};
