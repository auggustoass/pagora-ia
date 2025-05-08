
import React from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: (e?: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
}

export function ChatInput({ input, setInput, sendMessage, isLoading, inputRef }: ChatInputProps) {
  const isMobile = useIsMobile();
  
  return (
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
        className="bg-hblackpix-purple hover:bg-hblackpix-purple/90 h-9 md:h-10" 
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" /> 
        ) : (
          <Send className="h-3 w-3 md:h-4 md:w-4" />
        )}
      </Button>
    </form>
  );
}
