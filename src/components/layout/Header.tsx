
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
      "sticky top-0 z-10 px-6 py-4 flex items-center justify-between border-b border-green-500/20 backdrop-blur-xl bg-black/90",
      "transition-all duration-300 relative overflow-hidden"
    )}>
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-50"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      {/* Scan line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent animate-pulse"></div>
      
      <div className="relative flex items-center gap-4">
        <div className="relative w-64 hidden md:flex group">
          {/* Search container with hexagonal effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-transparent to-green-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-4 h-4 group-hover:text-green-300 transition-colors duration-300" />
            <Input
              placeholder="// SEARCH_DATABASE..."
              className="pl-10 bg-black border border-green-500/30 text-white placeholder-gray-500 focus:border-green-400/60 focus:ring-green-400/20 rounded-lg font-mono text-sm h-10 transition-all duration-300 hover:border-green-400/40 hover:shadow-lg hover:shadow-green-400/10"
            />
            
            {/* Inner glow effect */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-400/0 via-green-400/5 to-green-400/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
          
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-green-400/50"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-green-400/50"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-green-400/50"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-green-400/50"></div>
        </div>
      </div>
      
      <div className="relative flex items-center space-x-4">
        {user && (
          <Link to="/configuracoes/assinatura">
            <Button 
              variant="outline" 
              size="sm"
              className="group relative overflow-hidden flex items-center gap-2 bg-black border border-green-500/30 text-green-400 hover:text-white hover:border-green-400/60 transition-all duration-300 h-auto py-2 px-4 font-mono tracking-wider hover:shadow-lg hover:shadow-green-400/25"
            >
              {/* Scan line effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <Coins size={16} className="relative text-green-400 group-hover:text-white transition-colors duration-300" />
              <Badge variant="outline" className="relative text-xs bg-black border-green-500/30 text-green-400 font-mono">
                {credits?.credits_remaining || 0} CREDIT{credits?.credits_remaining !== 1 ? 'S' : ''}
              </Badge>
              
              {/* Corner cuts */}
              <div className="absolute top-0 left-0 w-1 h-1 bg-black transform rotate-45 -translate-x-0.5 -translate-y-0.5"></div>
              <div className="absolute top-0 right-0 w-1 h-1 bg-black transform rotate-45 translate-x-0.5 -translate-y-0.5"></div>
            </Button>
          </Link>
        )}
        
        <ThemeToggle />
        
        <div className="h-6 w-px bg-green-500/30"></div>
        
        {user && (
          <NotificationsDropdown />
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="group relative text-gray-400 hover:text-white bg-black border border-green-500/20 hover:border-green-400/40 rounded-lg h-9 w-9 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20 overflow-hidden"
              >
                {/* Scan line effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <MessageSquare size={18} className="relative" />
                
                {/* Corner cuts */}
                <div className="absolute top-0 left-0 w-1 h-1 bg-black transform rotate-45 -translate-x-0.5 -translate-y-0.5"></div>
                <div className="absolute top-0 right-0 w-1 h-1 bg-black transform rotate-45 translate-x-0.5 -translate-y-0.5"></div>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-black border border-green-500/30 text-green-400 font-mono">
              <p>// MESSAGES</p>
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
                  className="group relative text-gray-400 hover:text-white bg-black border border-green-500/20 hover:border-green-400/40 rounded-lg h-9 w-9 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20 overflow-hidden"
                >
                  {/* Scan line effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <Settings size={18} className="relative" />
                  
                  {/* Corner cuts */}
                  <div className="absolute top-0 left-0 w-1 h-1 bg-black transform rotate-45 -translate-x-0.5 -translate-y-0.5"></div>
                  <div className="absolute top-0 right-0 w-1 h-1 bg-black transform rotate-45 translate-x-0.5 -translate-y-0.5"></div>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-black border border-green-500/30 text-green-400 font-mono">
                <p>// SETTINGS</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Link>
      </div>
      
      {/* Bottom scan line */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent"></div>
    </header>
  );
}
