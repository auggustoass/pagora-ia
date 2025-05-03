
import React, { useEffect, useState } from 'react';
import { Bell, CreditCard, MessageSquare, Settings, Search, Menu, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useAuth } from '../auth/AuthProvider';
import { Badge } from '../ui/badge';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useCredits } from '@/hooks/use-credits';

export function Header() {
  const { user } = useAuth();
  const { credits } = useCredits();

  return (
    <header className="px-6 py-4 flex items-center justify-between border-b border-border backdrop-blur-md bg-background/50">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground">
          <Menu size={20} />
        </Button>
        
        <div className="relative w-64 hidden md:flex">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Pesquisar..."
            className="pl-9 bg-secondary/20 border-border/50 h-9"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        {user && (
          <Link to="/configuracoes/assinatura">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 border-border h-auto py-1.5"
            >
              <Coins size={16} className="text-yellow-400" />
              <Badge variant="outline" className="text-xs">
                {credits?.credits_remaining || 0} crédito{credits?.credits_remaining !== 1 ? 's' : ''}
              </Badge>
            </Button>
          </Link>
        )}
        
        <ThemeToggle />
        
        <div className="h-6 w-[1px] bg-border"></div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative bg-secondary/20 rounded-full h-9 w-9">
                <Bell size={18} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-card border-border">
              <p>Notificações</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground bg-secondary/20 rounded-full h-9 w-9">
                <MessageSquare size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-card border-border">
              <p>Mensagens</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Link to="/configuracoes">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground bg-secondary/20 rounded-full h-9 w-9">
                  <Settings size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-card border-border">
                <p>Configurações</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Link>
      </div>
    </header>
  );
}
