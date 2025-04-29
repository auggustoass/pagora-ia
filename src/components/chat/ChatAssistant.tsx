import React from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';

interface ChatAssistantProps {
  className?: string;
}

export function ChatAssistant({ className }: ChatAssistantProps) {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        throw new Error('Failed to get response from chat API');
      }

      const data = await res.json();
      setResponse(data.response);
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card flex flex-col h-full">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold">Assistente Virtual</h2>
        <p className="text-muted-foreground mt-1">Envie uma mensagem para obter ajuda.</p>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {response && (
          <div className="mt-4 p-3 rounded-md bg-white/5 text-white">
            {response}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-white/10">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="bg-white/5 border-white/10 flex-1"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="bg-pagora-purple hover:bg-pagora-purple/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
