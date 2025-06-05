
import React from 'react';
import { useCredits } from '@/hooks/use-credits';
import { Coins, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreditsDisplayProps {
  showAlert?: boolean;
  className?: string;
}

export function CreditsDisplay({
  showAlert = true,
  className = ''
}: CreditsDisplayProps) {
  const { credits, loading } = useCredits();
  const navigate = useNavigate();
  
  if (loading) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center">
            <Coins className="w-5 h-5 mr-2 text-green-400 animate-pulse" />
            <span className="text-white">Carregando créditos...</span>
          </div>
        </div>
      </div>
    );
  }
  
  const creditsRemaining = credits?.credits_remaining || 0;
  const lowCredits = creditsRemaining <= 1;
  
  return (
    <div className={`space-y-3 ${className}`}>
      {showAlert && lowCredits && (
        <Alert className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 border border-gray-500/30 rounded-xl backdrop-blur-sm">
          <AlertCircle className="h-4 w-4 text-gray-400" />
          <AlertDescription className="text-sm text-gray-300">
            <div className="flex items-center justify-between">
              <span>Seus créditos estão acabando!</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-3 border-green-500/30 bg-green-500/10 text-green-300 hover:bg-green-500/20 hover:text-green-200 transition-all duration-200" 
                onClick={() => navigate('/planos')}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Comprar créditos
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {showAlert && creditsRemaining === 0 && (
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 border border-gray-500/30 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-gray-300 font-medium">Créditos esgotados</p>
                <p className="text-gray-400 text-sm">Adquira mais créditos para continuar gerando faturas</p>
              </div>
            </div>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white shadow-lg"
              onClick={() => navigate('/planos')}
            >
              <Coins className="w-4 h-4 mr-1" />
              Adquirir agora
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
