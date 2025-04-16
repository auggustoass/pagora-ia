import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Plus, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface SuggestionButtonProps {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

const SuggestionButton = ({ label, icon, onClick }: SuggestionButtonProps) => (
  <Button 
    variant="outline" 
    size="sm" 
    className="border-white/10 bg-white/5 hover:bg-white/10 transition-all"
    onClick={onClick}
  >
    {icon && <span className="mr-2">{icon}</span>}
    {label}
  </Button>
);

export function ChatAssistant() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Olá! Sou o assistente virtual do PAGORA. Como posso ajudar você hoje?',
      sender: 'assistant',
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    processUserMessage(input);
  };
  
  const processUserMessage = async (userInput: string) => {
    setIsLoading(true);
    
    try {
      let context = '';
      
      try {
        const { data: pendentes, error: errorPendentes } = await supabase
          .from('faturas')
          .select('*')
          .eq('status', 'pendente');
          
        const { data: aprovadas, error: errorAprovadas } = await supabase
          .from('faturas')
          .select('*')
          .eq('status', 'aprovado');
          
        const { data: rejeitadas, error: errorRejeitadas } = await supabase
          .from('faturas')
          .select('*')
          .eq('status', 'rejeitado');
          
        if (!errorPendentes && !errorAprovadas && !errorRejeitadas) {
          context = `Há ${pendentes?.length || 0} faturas pendentes, ${aprovadas?.length || 0} faturas aprovadas e ${rejeitadas?.length || 0} faturas rejeitadas no sistema.`;
        }
      } catch (error) {
        console.error('Error fetching context data:', error);
      }
      
      const { data, error } = await supabase.functions.invoke('process-chat', {
        body: { message: userInput, context },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || 'Desculpe, não consegui processar sua solicitação.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      
      toast({
        title: "Erro",
        description: "Houve um problema ao processar sua mensagem. Tente novamente.",
        variant: "destructive",
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    
    setTimeout(() => {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: suggestion,
        sender: 'user',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      processUserMessage(suggestion);
    }, 100);
    
    setInput('');
  };
  
  return (
    <div className="glass-card h-full flex flex-col">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-pagora-purple flex items-center justify-center">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="font-medium">Assistente PAGORA</h3>
            <p className="text-xs text-muted-foreground">Sempre online</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-white"
          onClick={() => {
            setMessages([
              {
                id: '1',
                content: 'Olá! Sou o assistente virtual do PAGORA. Como posso ajudar você hoje?',
                sender: 'assistant',
                timestamp: new Date(),
              }
            ]);
          }}
        >
          <RefreshCw size={18} />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-4 space-y-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={cn(
                "flex items-start gap-3 max-w-[85%] animate-fade-in",
                message.sender === 'assistant' ? "mr-auto" : "ml-auto flex-row-reverse"
              )}
            >
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  message.sender === 'assistant' ? "bg-pagora-purple" : "bg-pagora-blue"
                )}
              >
                {message.sender === 'assistant' ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div 
                className={cn(
                  "rounded-2xl px-4 py-3",
                  message.sender === 'assistant' 
                    ? "bg-white/5 border border-white/10" 
                    : "bg-pagora-blue text-white"
                )}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-thin">
          <SuggestionButton 
            label="Cadastrar novo cliente" 
            icon={<Plus size={16} />}
            onClick={() => handleSuggestionClick('Como faço para cadastrar um novo cliente?')}
          />
          <SuggestionButton 
            label="Gerar fatura" 
            icon={<Plus size={16} />}
            onClick={() => handleSuggestionClick('Quero gerar uma nova fatura')}
          />
          <SuggestionButton 
            label="Ver status das cobranças" 
            onClick={() => handleSuggestionClick('Qual o status das minhas cobranças?')}
          />
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Digite sua mensagem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-white/5 border-white/10"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            disabled={isLoading}
          />
          <Button 
            type="button"
            onClick={handleSendMessage}
            className="bg-pagora-purple hover:bg-pagora-purple/90"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </Button>
        </div>
      </div>
    </div>
  );
}
