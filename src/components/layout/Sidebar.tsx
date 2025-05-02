
import React from 'react';
import { 
  Home, 
  Users, 
  FileText, 
  PieChart, 
  Settings, 
  HelpCircle, 
  MessageSquare, 
  CreditCard, 
  LogOut, 
  Shield,
  ChevronRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useState } from 'react';

interface SidebarProps {
  className?: string;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  isActive?: boolean;
  onClick?: () => void;
}

const NavItem = ({
  icon,
  label,
  to,
  isActive = false,
  onClick
}: NavItemProps) => (
  <TooltipProvider delayDuration={300}>
    <Tooltip>
      <TooltipTrigger asChild>
        <li className="mb-2">
          {onClick ? (
            <Button
              variant="ghost"
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all justify-start font-normal",
                isActive
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
              onClick={onClick}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {icon}
              </div>
              <span className="ml-1">{label}</span>
            </Button>
          ) : (
            <Link
              to={to}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all",
                isActive
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {icon}
              </div>
              <span className="ml-1">{label}</span>
              {isActive && <div className="ml-auto w-1 h-6 bg-primary rounded-full"></div>}
            </Link>
          )}
        </li>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className={cn(
      "h-full flex flex-col bg-sidebar border-r border-white/5 relative",
      collapsed ? "w-20" : "w-60",
      "transition-all duration-300 ease-in-out",
      className
    )}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute -right-3 top-8 bg-background border border-white/5 rounded-full hover:bg-white/5 z-10"
        onClick={() => setCollapsed(!collapsed)}
      >
        <ChevronRight className={cn(
          "h-4 w-4 transition-transform", 
          collapsed ? "" : "rotate-180"
        )} />
      </Button>

      <div className={cn(
        "px-4 py-6 flex items-center",
        collapsed ? "justify-center" : "justify-start"
      )}>
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          collapsed ? "scale-0 w-0" : "scale-100 w-auto"
        )}>
          <h2 className="text-2xl font-bold text-gradient text-glow mb-1">HBLACKPIX</h2>
          <p className="text-xs text-muted-foreground">Assistente de Cobrança</p>
        </div>
        <div className={cn(
          "transition-all duration-300 ease-in-out text-3xl font-bold text-primary",
          collapsed ? "scale-100" : "scale-0 w-0"
        )}>
          H
        </div>
      </div>
      
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
        <ul className="space-y-1">
          <NavItem 
            icon={<Home size={18} />} 
            label="Dashboard" 
            to="/" 
            isActive={location.pathname === '/'} 
          />
          
          <NavItem 
            icon={<Users size={18} />} 
            label="Clientes" 
            to="/clientes" 
            isActive={location.pathname === '/clientes'} 
          />
          
          <NavItem 
            icon={<FileText size={18} />} 
            label="Faturas" 
            to="/faturas" 
            isActive={location.pathname === '/faturas'} 
          />
          
          <NavItem 
            icon={<PieChart size={18} />} 
            label="Relatórios" 
            to="/relatorios" 
            isActive={location.pathname === '/relatorios'} 
          />
          
          <NavItem 
            icon={<CreditCard size={18} />} 
            label="Planos" 
            to="/planos" 
            isActive={location.pathname === '/planos'} 
          />
          
          {isAdmin && (
            <NavItem 
              icon={<Shield size={18} />} 
              label="Admin" 
              to="/admin" 
              isActive={location.pathname === '/admin'} 
            />
          )}
          
          <NavItem 
            icon={<Settings size={18} />} 
            label="Configurações" 
            to="/configuracoes" 
            isActive={location.pathname === '/configuracoes'} 
          />
          
          <NavItem 
            icon={<HelpCircle size={18} />} 
            label="Ajuda" 
            to="/ajuda" 
            isActive={location.pathname === '/ajuda'} 
          />
          
          {user && (
            <NavItem 
              icon={<LogOut size={18} />} 
              label="Sair" 
              to="#" 
              onClick={handleSignOut} 
            />
          )}
        </ul>
      </nav>
      
      <div className={cn(
        "p-4 mt-auto",
        collapsed ? "hidden" : "block"
      )}>
        <div className="glass-card p-4 text-center bg-gradient-to-br from-black/40 to-black/10">
          <p className="text-sm text-muted-foreground mb-2">Precisa de ajuda?</p>
          <a 
            href="https://wa.me/5511998115159" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-primary text-white px-4 py-2 rounded-md w-full block hover:opacity-90 transition-all btn-hover-fx"
          >
            <div className="flex items-center justify-center gap-2">
              <MessageSquare size={16} />
              Fale com o Suporte
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
