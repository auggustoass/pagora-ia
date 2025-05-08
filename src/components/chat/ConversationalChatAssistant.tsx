
import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { ChatFooter } from './components/ChatFooter';
import { Message, ConversationState } from './types';

export function ConversationalChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>({
    mode: 'chat',
    step: 'initial',
    data: {}
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  // Add initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        text: `Olá${user ? ` ${user.user_metadata?.first_name || ''}` : ''}! Sou o assistente virtual do HBLACKPIX. Como posso ajudar hoje? Você pode me pedir para cadastrar um cliente, gerar uma fatura ou criar relatórios financeiros.`,
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, [user]);

  // Extract report credit cost from message text
  const extractReportCreditCost = (text: string): number | undefined => {
    const costMatch = text.match(/Custo: (\d+) créditos/);
    return costMatch ? parseInt(costMatch[1], 10) : undefined;
  };

  // Extract report type from message text
  const extractReportType = (text: string): string | undefined => {
    if (text.includes('Status de Pagamentos')) return 'payment_status';
    if (text.includes('Relatório Mensal')) return 'monthly';
    if (text.includes('Relatório Trimestral')) return 'quarterly';
    if (text.includes('Relatório Anual')) return 'yearly';
    if (text.includes('Demonstrativo de Resultado')) return 'dre';
    if (text.includes('Previsão de Faturamento')) return 'forecast';
    if (text.includes('Análise de Atrasos')) return 'delay_analysis';
    if (text.includes('Histórico do Cliente')) return 'client_history';
    return undefined;
  };

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
        // This would be handled by the MessagesEndRef in MessageList now
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
        const responseText = data.response;
        
        // Extract report metadata if present
        const reportType = extractReportType(responseText);
        const creditCost = extractReportCreditCost(responseText);
        
        // Add assistant's response
        const assistantMessage: Message = {
          text: responseText,
          isUser: false,
          timestamp: new Date(),
          metadata: {
            reportType,
            creditCost
          }
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

  return (
    <div className="glass-card flex flex-col h-full">
      <ChatHeader 
        conversationState={conversationState}
        setConversationState={setConversationState}
        setMessages={setMessages}
      />
      
      <MessageList 
        messages={messages} 
        isLoading={isLoading} 
      />
      
      <ChatFooter 
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        isLoading={isLoading}
        inputRef={inputRef}
      />
    </div>
  );
}
