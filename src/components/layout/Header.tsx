
import React from 'react';
import { Bell, MessageSquare, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function Header() {
  return (
    <header className="px-6 py-5 flex items-center justify-between border-b border-white/10 dark:border-white/10 border-gray-200 backdrop-blur-md bg-black/10">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-white dark:text-white flex items-center">
          <span className="text-gradient text-glow text-2xl mr-2">PAGORA</span>
          <span className="text-sm text-muted-foreground">Assistente de Cobrança Inteligente</span>
        </h1>
      </div>
      <div className="flex items-center space-x-3">
        <ThemeToggle />
        
        <div className="h-6 w-[1px] bg-white/10"></div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-pagora-purple rounded-full"></span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-pagora-dark border-white/10">
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
            <TooltipContent className="bg-pagora-dark border-white/10">
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
            <TooltipContent className="bg-pagora-dark border-white/10">
              <p>Configurações</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
}
