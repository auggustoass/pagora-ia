
import React, { useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageItem } from './MessageItem';
import { useIsMobile } from '@/hooks/use-mobile';

interface MessageListProps {
  messages: Array<{
    text: string;
    isUser: boolean;
    timestamp: Date;
    metadata?: {
      reportType?: string;
      creditCost?: number;
    };
  }>;
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of chat when new message arrives
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }, [messages]);
  
  return (
    <ScrollArea className="flex-1 p-2 md:p-4 overflow-y-auto">
      <div className="space-y-3 md:space-y-4">
        {messages.map((message, index) => (
          <MessageItem key={index} message={message} />
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
  );
}
