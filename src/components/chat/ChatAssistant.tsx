import React, { useState } from 'react';
import { Send, Bot, User, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

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
    
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Estou processando sua solicitação. Em um sistema completo, eu usaria a API do OpenAI e do Supabase para responder adequadamente às suas perguntas e executar ações no banco de dados.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
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
      
      setTimeout(() => {
        let responseContent = '';
        
        if (suggestion.includes('novo cliente')) {
          responseContent = 'Para cadastrar um novo cliente, preciso das seguintes informações: nome completo, e-mail, WhatsApp com DDD e DDI, e CPF ou CNPJ. Você pode fornecer esses dados?';
        } else if (suggestion.includes('gerar fatura')) {
          responseContent = 'Para gerar uma nova fatura, preciso saber: o cliente (você pode informar o nome ou e-mail), valor, data de vencimento e descrição do serviço ou produto.';
        } else if (suggestion.includes('status')) {
          responseContent = 'Você tem 3 faturas pendentes, 1 fatura aprovada e 0 faturas rejeitadas. Gostaria de ver mais detalhes sobre alguma delas?';
        }
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: responseContent,
          sender: 'assistant',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }, 1000);
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
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
          <RefreshCw size={18} />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
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
      </div>
      
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
          />
          <Button 
            type="button"
            onClick={handleSendMessage}
            className="bg-pagora-purple hover:bg-pagora-purple/90"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
