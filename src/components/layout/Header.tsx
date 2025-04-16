
import React from 'react';
import { Bell, MessageSquare, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function Header() {
  return (
    <header className="px-6 py-4 flex items-center justify-between border-b border-white/10">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-white flex items-center">
          <span className="text-pagora-purple mr-2">PAGORA</span>
          <span className="text-sm text-muted-foreground">Assistente de Cobrança Inteligente</span>
        </h1>
      </div>
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                <Bell size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notificações</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                <MessageSquare size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mensagens</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                <Settings size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Configurações</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
}
