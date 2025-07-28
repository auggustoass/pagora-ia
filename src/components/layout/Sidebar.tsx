
import React from 'react';
import { Home, Users, FileText, PieChart, Settings, LogOut, Shield, ChevronRight, Calendar } from 'lucide-react';
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
        <li className="mb-1">
          {onClick ? (
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start px-3 py-2 h-auto font-medium text-sm",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              onClick={onClick}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {icon}
              </div>
              {!collapsed && <span className="ml-3">{label}</span>}
            </Button>
          ) : (
            <Link
              to={to}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {icon}
              </div>
              {!collapsed && <span className="ml-3">{label}</span>}
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
      "h-screen fixed left-0 top-0 flex flex-col bg-sidebar border-r border-sidebar-border",
      collapsed ? "w-16" : "w-64",
      "transition-all duration-300 ease-in-out z-20",
      className
    )}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-8 bg-background border border-border rounded-full shadow-sm z-10"
        onClick={() => setCollapsed(!collapsed)}
      >
        <ChevronRight className={cn(
          "h-4 w-4 transition-transform duration-300",
          collapsed ? "" : "rotate-180"
        )} />
      </Button>

      <div className={cn(
        "px-4 py-6 flex items-center border-b border-sidebar-border",
        collapsed ? "justify-center" : "justify-start"
      )}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <img
              alt="H"
              className="w-6 h-6 rounded"
              src="/lovable-uploads/0e8fcb5a-bcde-4b8a-be24-77413a0562ce.png"
            />
          </div>
        ) : (
          <div className="flex items-center">
            <img
              alt="HBLACKPIX"
              className="h-8 mr-3"
              src="/lovable-uploads/55eb28cc-ed54-4fb2-adeb-e214cf7f1972.png"
            />
            <div className="text-sm font-medium">HBLACKPIX</div>
          </div>
        )}
      </div>
      
      <nav className="flex-1 px-3 py-4 space-y-1">
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
          icon={<PieChart size={18} />}
          label="Tarefas"
          to="/tarefas"
          isActive={location.pathname === '/tarefas'}
          collapsed={collapsed}
        />

        <NavItem
          icon={<Calendar size={18} />}
          label="Agenda"
          to="/agenda"
          isActive={location.pathname === '/agenda'}
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
        
        {user && (
          <NavItem
            icon={<LogOut size={18} />}
            label="Sair"
            to="#"
            onClick={handleSignOut}
            collapsed={collapsed}
          />
        )}
      </nav>
      
      {!collapsed && (
        <div className="p-4 mt-auto">
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Precisa de ajuda?
            </p>
            <Button
              asChild
              size="sm"
              className="w-full"
            >
              <a
                href="https://wa.me/5511998115159"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contato
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
