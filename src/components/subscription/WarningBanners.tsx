
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { UserCredits } from '@/hooks/use-credits';
import { AlertCircle, CreditCard } from 'lucide-react';

interface WarningBannersProps {
  user: any;
  hasMpCredentials: boolean;
  credits: UserCredits | null;
}

export const WarningBanners = ({ user, hasMpCredentials, credits }: WarningBannersProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {user && !hasMpCredentials && (
        <Alert className="bg-red-500/10 border-red-500/20">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertTitle className="text-red-500">Credenciais do Mercado Pago não configuradas</AlertTitle>
          <AlertDescription className="text-red-500/90">
            <p className="mb-2">
              Para receber pagamentos em seu próprio Mercado Pago, é necessário configurar suas credenciais.
              Sem essa configuração, não será possível gerar links de pagamento para as faturas.
            </p>
            <Button 
              variant="outline" 
              className="bg-red-500/20 border-red-500/30 text-red-500 hover:bg-red-500/30 mt-1"
              onClick={() => navigate('/configuracoes')}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Configurar Mercado Pago
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {user && credits && credits.credits_remaining > 0 && (
        <Alert className="bg-green-500/10 border-green-500/20">
          <AlertDescription className="text-green-500">
            Você já possui {credits.credits_remaining} crédito{credits.credits_remaining !== 1 ? 's' : ''} disponível{credits.credits_remaining !== 1 ? 'is' : ''} para gerar faturas.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
