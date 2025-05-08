
import React from 'react';
import { Coins } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

interface MessageItemProps {
  message: {
    text: string;
    isUser: boolean;
    timestamp: Date;
    metadata?: {
      reportType?: string;
      creditCost?: number;
    };
  };
}

export function MessageItem({ message }: MessageItemProps) {
  const isMobile = useIsMobile();

  // Render credit cost badge if message has credit cost metadata
  const renderCreditCostBadge = () => {
    if (message.isUser || !message.metadata?.creditCost) return null;
    
    return (
      <div className="mt-2 flex items-center gap-1">
        <Badge variant="outline" className="text-[10px] bg-amber-500/10 border-amber-500/20 text-amber-300">
          <Coins className="h-2.5 w-2.5 mr-1" />
          {message.metadata.creditCost} créditos
        </Badge>
      </div>
    );
  };
  
  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`${isMobile ? 'max-w-[90%]' : 'max-w-[80%]'} rounded-lg px-3 py-2 md:px-4 md:py-2 ${
          message.isUser ? 'bg-hblackpix-purple text-white' : 'bg-white/10 text-white'
        }`}
      >
        <p className="whitespace-pre-wrap text-gray-50 text-sm md:text-base">{message.text}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-[10px] md:text-xs opacity-70">
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          {renderCreditCostBadge()}
        </div>
      </div>
    </div>
  );
}
