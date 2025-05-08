
import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, PieChart, CreditCard, UserPlus, RefreshCw, FileText, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/components/auth/AuthProvider';
import { CreditsDisplay } from '@/components/dashboard/CreditsDisplay';
import { usePlans } from '@/hooks/use-plans';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

type Message = {
  text: string;
  isUser: boolean;
  timestamp: Date;
};

type ConversationState = {
  mode: 'chat' | 'client_registration' | 'invoice_creation' | 'report_generation';
  step: string;
  data: Record<string, any>;
};

export function ConversationalChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversationState, setConversationState] = useState<ConversationState>({
    mode: 'chat',
    step: 'initial',
    data: {}
  });
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { plans } = usePlans();
  const inputRef = useRef<HTMLInputElement>(null);

  // Add initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        text: `Olá${user ? ` ${user.user_metadata?.first_name || ''}` : ''}! Sou o assistente virtual do PAGORA. Como posso ajudar hoje? Você pode me pedir para cadastrar um cliente, gerar uma fatura ou criar relatórios financeiros.`,
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, [user]);

  // Scroll to bottom of chat when new message arrives
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMessage = input;
    setInput('');
    const newMessage: Message = {
      text: userMessage,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);
    try {
      // Optional: Add typing indicator
      const typingTimer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: 'smooth'
        });
      }, 100);

      // Call the edge function with the user's message and current conversation state
      const { data, error } = await supabase.functions.invoke('process-chat', {
        body: {
          message: userMessage,
          context: user ? `Usuário autenticado como ${user.email}` : 'Usuário não autenticado',
          conversationState: conversationState
        },
        headers: user ? {
          Authorization: `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token)}`
        } : undefined
      });

      // Clear typing indicator
      clearTimeout(typingTimer);

      if (error) throw error;
      if (data) {
        // Add assistant's response
        const assistantMessage: Message = {
          text: data.response,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Update conversation state if it was changed
        if (data.conversationState) {
          setConversationState(data.conversationState);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível processar sua mensagem. Tente novamente mais tarde.',
        variant: 'destructive'
      });
      setMessages(prev => [...prev, {
        text: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente mais tarde.',
        isUser: false,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

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
        return 'Assistente PAGORA';
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

  // Quick action buttons
  const quickActions = [
    { 
      label: 'Novo Cliente', 
      icon: <UserPlus className="h-3 w-3 mr-1" />, 
      action: 'Cadastrar cliente',
      tooltip: 'Iniciar cadastro de um novo cliente' 
    },
    { 
      label: 'Nova Fatura', 
      icon: <FileText className="h-3 w-3 mr-1" />, 
      action: 'Gerar fatura',
      tooltip: 'Criar uma nova fatura para um cliente' 
    },
    { 
      label: 'Relatório', 
      icon: <PieChart className="h-3 w-3 mr-1" />, 
      action: 'Gerar relatório',
      tooltip: 'Gerar um relatório financeiro' 
    },
    { 
      label: 'Previsão', 
      icon: <RefreshCw className="h-3 w-3 mr-1" />, 
      action: 'Fazer previsão de faturamento',
      tooltip: 'Criar uma previsão de faturamento futuro' 
    }
  ];

  return (
    <div className="glass-card flex flex-col h-full">
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
      
      <ScrollArea className="flex-1 p-2 md:p-4 overflow-y-auto">
        <div className="space-y-3 md:space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`${isMobile ? 'max-w-[90%]' : 'max-w-[80%]'} rounded-lg px-3 py-2 md:px-4 md:py-2 ${
                  message.isUser ? 'bg-pagora-purple text-white' : 'bg-white/10 text-white'
                }`}
              >
                <p className="whitespace-pre-wrap text-gray-50 text-sm md:text-base">{message.text}</p>
                <p className="text-[10px] md:text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 rounded-lg px-3 py-2 md:px-4 md:py-2 text-white flex items-center space-x-2">
                <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                <p className="text-sm md:text-base">Processando...</p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-2 md:p-4 border-t border-white/10">
        {user && (
          <div className="md:hidden mb-2">
            <CreditsDisplay showAlert={false} className="text-xs" />
          </div>
        )}
        
        <div className="flex flex-row gap-1 mb-2 flex-wrap">
          {quickActions.map((action, index) => (
            <Button 
              key={index}
              variant="outline" 
              size="sm"
              className="text-xs mb-1"
              onClick={() => {
                setInput(action.action);
                setTimeout(() => {
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }, 10);
              }}
              title={action.tooltip}
            >
              {action.icon} {action.label}
            </Button>
          ))}
        </div>
        
        <form onSubmit={sendMessage} className="flex space-x-2">
          <Input 
            ref={inputRef}
            value={input} 
            onChange={e => setInput(e.target.value)} 
            placeholder="Digite sua mensagem..." 
            className="assistant-input bg-white/5 border-white/10 flex-1 h-9 md:h-10 text-sm md:text-base" 
            disabled={isLoading} 
          />
          <Button 
            type="submit" 
            size={isMobile ? "sm" : "icon"} 
            className="bg-pagora-purple hover:bg-pagora-purple/90 h-9 md:h-10" 
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" /> 
            ) : (
              <Send className="h-3 w-3 md:h-4 md:w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
