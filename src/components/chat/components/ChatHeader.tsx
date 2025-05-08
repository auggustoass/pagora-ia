
import React from 'react';
import { UserPlus, FileText, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditsDisplay } from '@/components/dashboard/CreditsDisplay';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/components/auth/AuthProvider';

interface ChatHeaderProps {
  conversationState: {
    mode: 'chat' | 'client_registration' | 'invoice_creation' | 'report_generation';
    step: string;
    data: Record<string, any>;
  };
  setConversationState: React.Dispatch<React.SetStateAction<{
    mode: 'chat' | 'client_registration' | 'invoice_creation' | 'report_generation';
    step: string;
    data: Record<string, any>;
  }>>;
  setMessages: React.Dispatch<React.SetStateAction<Array<{
    text: string;
    isUser: boolean;
    timestamp: Date;
    metadata?: {
      reportType?: string;
      creditCost?: number;
    };
  }>>>;
}

export function ChatHeader({ conversationState, setConversationState, setMessages }: ChatHeaderProps) {
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // Get conversation mode display name
  const getModeName = () => {
    switch(conversationState.mode) {
      case 'client_registration':
        return 'Cadastro de Cliente';
      case 'invoice_creation':
        return 'Geração de Fatura';
      case 'report_generation':
        return 'Relatório Financeiro';
      default:
        return 'Assistente HBLACKPIX';
    }
  };

  // Helper function to get an icon for the current mode
  const getModeIcon = () => {
    switch(conversationState.mode) {
      case 'client_registration':
        return <UserPlus className="h-5 w-5 text-blue-400" />;
      case 'invoice_creation':
        return <FileText className="h-5 w-5 text-green-400" />;
      case 'report_generation':
        return <BarChart3 className="h-5 w-5 text-yellow-400" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="p-3 md:p-4 border-b border-white/10">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {getModeIcon()}
          <div>
            <h2 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>{getModeName()}</h2>
            {conversationState.mode !== 'chat' && (
              <div className="text-xs text-muted-foreground mt-1">
                {conversationState.mode === 'client_registration' && 'Cadastrando novo cliente...'}
                {conversationState.mode === 'invoice_creation' && 'Gerando nova fatura...'}
                {conversationState.mode === 'report_generation' && 'Gerando relatório financeiro...'}
              </div>
            )}
          </div>
        </div>
        {user && (
          <div className="hidden md:block">
            <CreditsDisplay showAlert={false} className="text-right" />
          </div>
        )}
      </div>
      
      {!user && (
        <Alert className="mt-2 bg-amber-500/10 border-amber-500/20">
          <AlertDescription className="text-xs text-amber-200">
            Para usar todas as funcionalidades do assistente, faça login na sua conta.
          </AlertDescription>
        </Alert>
      )}
      
      {conversationState.mode !== 'chat' && (
        <Badge 
          variant="outline" 
          className="mt-2 cursor-pointer hover:bg-primary/10 transition-colors" 
          onClick={() => {
            setConversationState({
              mode: 'chat',
              step: 'initial',
              data: {}
            });
            setMessages(prev => [...prev, {
              text: 'Operação cancelada. Como posso ajudar?',
              isUser: false,
              timestamp: new Date()
            }]);
          }}
        >
          Cancelar {
            conversationState.mode === 'client_registration' ? 'cadastro' : 
            conversationState.mode === 'invoice_creation' ? 'fatura' : 'relatório'
          }
        </Badge>
      )}
    </div>
  );
}
