
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { UserCredits } from '@/hooks/use-credits';

interface WarningBannersProps {
  user: any;
  hasMpCredentials: boolean;
  credits: UserCredits | null;
}

export const WarningBanners = ({ user, hasMpCredentials, credits }: WarningBannersProps) => {
  const navigate = useNavigate();

  return (
    <>
      {user && !hasMpCredentials && (
        <Alert className="bg-yellow-500/10 border-yellow-500/20">
          <AlertDescription className="text-yellow-500">
            Para comprar créditos, é necessário que você ou o administrador configure as credenciais do Mercado Pago.
            <Button 
              variant="link" 
              className="text-yellow-500 p-0 h-auto ml-1"
              onClick={() => navigate('/configuracoes')}
            >
              Ir para Configurações
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
    </>
  );
};
