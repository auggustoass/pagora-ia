
import React from 'react';
import { MessageSquare, Settings, Search, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useAuth } from '../auth/AuthProvider';
import { Badge } from '../ui/badge';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useCredits } from '@/hooks/use-credits';
import { NotificationsDropdown } from '@/components/notifications/NotificationsDropdown';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export function Header() {
  const { user } = useAuth();
  const { credits } = useCredits();
  const isMobile = useIsMobile();

  return (
    <header className={cn(
      "sticky top-0 z-10 px-6 py-4 flex items-center justify-between",
      "bg-background border-b border-border backdrop-blur-xl",
      "transition-all duration-300"
    )}>
      <div className="flex items-center gap-4">
        <div className="relative w-64 hidden md:flex">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar..."
            className="pl-10 bg-background border-border"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {user && (
          <Link to="/configuracoes/assinatura">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 border-border hover:bg-accent hover:text-accent-foreground"
            >
              <Coins size={16} />
              <Badge variant="outline" className="text-xs">
                {credits?.credits_remaining || 0} CRÉDITOS
              </Badge>
            </Button>
          </Link>
        )}
        
        <ThemeToggle />
        
        <div className="h-6 w-px bg-border"></div>
        
        {user && (
          <NotificationsDropdown />
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-foreground"
              >
                <MessageSquare size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mensagens</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Link to="/configuracoes">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Settings size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Configurações</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Link>
      </div>
    </header>
  );
}
