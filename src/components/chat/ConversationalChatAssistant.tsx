import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
type Message = {
  text: string;
  isUser: boolean;
  timestamp: Date;
};
type ConversationState = {
  mode: 'chat' | 'client_registration' | 'invoice_creation';
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
  const {
    toast
  } = useToast();

  // Add initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        text: 'Olá! Sou o assistente virtual do PAGORA. Como posso ajudar hoje? Você pode me pedir para cadastrar um cliente ou gerar uma fatura.',
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, []);

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
      // Call the edge function with the user's message and current conversation state
      const {
        data,
        error
      } = await supabase.functions.invoke('process-chat', {
        body: {
          message: userMessage,
          context: 'Usuário está usando o sistema de gestão de cobranças PAGORA',
          conversationState: conversationState
        }
      });
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
  return <div className="glass-card flex flex-col h-full">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold">Assistente PAGORA</h2>
        {conversationState.mode !== 'chat' && <div className="text-xs text-muted-foreground mt-1">
            {conversationState.mode === 'client_registration' ? 'Cadastrando novo cliente...' : 'Gerando nova fatura...'}
          </div>}
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message, index) => <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg px-4 py-2 ${message.isUser ? 'bg-pagora-purple text-white' : 'bg-white/10 text-white'}`}>
              <p className="whitespace-pre-wrap text-gray-50">{message.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
              </p>
            </div>
          </div>)}
        
        {isLoading && <div className="flex justify-start">
            <div className="bg-white/10 rounded-lg px-4 py-2 text-white flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p>Digitando...</p>
            </div>
          </div>}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-white/10">
        <form onSubmit={sendMessage} className="flex space-x-2">
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Digite sua mensagem..." className="bg-white/5 border-white/10 flex-1" disabled={isLoading} />
          <Button type="submit" size="icon" className="bg-pagora-purple hover:bg-pagora-purple/90" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>;
}