
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
  ChevronRight,
  MessagesSquare
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  className?: string;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  isActive?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
}

const NavItem = ({
  icon,
  label,
  to,
  isActive = false,
  onClick,
  collapsed = false
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
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              onClick={onClick}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {icon}
              </div>
              {!collapsed && <span className="ml-1">{label}</span>}
              {isActive && !collapsed && <div className="ml-auto w-1 h-6 bg-primary rounded-full"></div>}
            </Button>
          ) : (
            <Link
              to={to}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {icon}
              </div>
              {!collapsed && <span className="ml-1">{label}</span>}
              {isActive && !collapsed && <div className="ml-auto w-1 h-6 bg-primary rounded-full"></div>}
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
  const isMobile = useIsMobile();
  
  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className={cn(
      "h-screen fixed left-0 top-0 flex flex-col bg-sidebar border-r border-border",
      collapsed ? "w-20" : "w-60",
      "transition-all duration-300 ease-in-out z-20",
      className
    )}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute -right-3 top-8 bg-background border border-border rounded-full hover:bg-secondary z-10"
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
        {collapsed ? (
          <div className="w-10 h-10 rounded-full overflow-hidden bg-primary flex items-center justify-center">
            <img src="/placeholder.svg" alt="HBLACKPIX" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="flex flex-col items-start">
            <div className="h-10 w-full flex items-center">
              <img src="/placeholder.svg" alt="HBLACKPIX" className="h-8 mr-2" />
              <h2 className="text-2xl font-bold text-gradient text-glow">HBLACKPIX</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Assistente de Cobrança</p>
          </div>
        )}
      </div>
      
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin">
        <ul className="space-y-1">
          <NavItem 
            icon={<Home size={18} />} 
            label="Dashboard" 
            to="/dashboard" 
            isActive={location.pathname === '/dashboard'}
            collapsed={collapsed}
          />
          
          <NavItem 
            icon={<Users size={18} />} 
            label="Clientes" 
            to="/clientes" 
            isActive={location.pathname === '/clientes'}
            collapsed={collapsed}
          />
          
          <NavItem 
            icon={<FileText size={18} />} 
            label="Faturas" 
            to="/faturas" 
            isActive={location.pathname === '/faturas'}
            collapsed={collapsed}
          />
          
          <NavItem 
            icon={<MessagesSquare size={18} />} 
            label="Assistente" 
            to="/assistente" 
            isActive={location.pathname === '/assistente'}
            collapsed={collapsed}
          />
          
          <NavItem 
            icon={<PieChart size={18} />} 
            label="Relatórios" 
            to="/relatorios" 
            isActive={location.pathname === '/relatorios'}
            collapsed={collapsed}
          />
          
          <NavItem 
            icon={<CreditCard size={18} />} 
            label="Planos" 
            to="/planos" 
            isActive={location.pathname === '/planos'}
            collapsed={collapsed}
          />
          
          {isAdmin && (
            <NavItem 
              icon={<Shield size={18} />} 
              label="Admin" 
              to="/admin" 
              isActive={location.pathname === '/admin'}
              collapsed={collapsed}
            />
          )}
          
          <NavItem 
            icon={<Settings size={18} />} 
            label="Configurações" 
            to="/configuracoes" 
            isActive={location.pathname === '/configuracoes'}
            collapsed={collapsed}
          />
          
          <NavItem 
            icon={<HelpCircle size={18} />} 
            label="Ajuda" 
            to="/ajuda" 
            isActive={location.pathname === '/ajuda'}
            collapsed={collapsed}
          />
          
          {user && (
            <NavItem 
              icon={<LogOut size={18} />} 
              label="Sair" 
              to="#" 
              onClick={handleSignOut}
              collapsed={collapsed}
            />
          )}
        </ul>
      </nav>
      
      {!collapsed && (
        <div className="p-4 mt-auto">
          <div className="glass-card p-4 text-center bg-gradient-to-br from-card to-card/40">
            <p className="text-sm text-muted-foreground mb-2">Precisa de ajuda?</p>
            <a 
              href="https://wa.me/5511998115159" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md w-full block hover:opacity-90 transition-all btn-hover-fx"
            >
              <div className="flex items-center justify-center gap-2">
                <MessageSquare size={16} />
                Fale com o Suporte
              </div>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
