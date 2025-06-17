
import React from 'react';
import { Home, Users, FileText, PieChart, Settings, LogOut, Shield, ChevronRight } from 'lucide-react';
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
                "group relative flex w-full items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-300 justify-start font-mono text-sm tracking-wider overflow-hidden",
                isActive 
                  ? "bg-green-500/10 text-green-400 border border-green-500/30" 
                  : "text-gray-400 hover:text-white hover:bg-green-500/5 border border-transparent hover:border-green-500/20"
              )} 
              onClick={onClick}
            >
              {/* Scan line effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <div className={cn(
                "relative w-5 h-5 flex items-center justify-center transition-all duration-300",
                isActive && "text-green-400 drop-shadow-[0_0_8px_rgba(0,255,65,0.6)]"
              )}>
                {icon}
              </div>
              
              {!collapsed && (
                <span className="relative ml-1 uppercase tracking-widest">{label}</span>
              )}
              
              {isActive && !collapsed && (
                <div className="ml-auto w-1 h-6 bg-green-400 rounded-full animate-pulse drop-shadow-[0_0_6px_rgba(0,255,65,0.8)]"></div>
              )}
              
              {/* Corner cuts */}
              <div className="absolute top-0 left-0 w-2 h-2 bg-black transform rotate-45 -translate-x-1 -translate-y-1"></div>
              <div className="absolute top-0 right-0 w-2 h-2 bg-black transform rotate-45 translate-x-1 -translate-y-1"></div>
            </Button>
          ) : (
            <Link 
              to={to} 
              className={cn(
                "group relative flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-300 overflow-hidden font-mono text-sm tracking-wider uppercase",
                collapsed ? "justify-center" : "",
                isActive 
                  ? "bg-green-500/10 text-green-400 border border-green-500/30" 
                  : "text-gray-400 hover:text-white hover:bg-green-500/5 border border-transparent hover:border-green-500/20"
              )}
            >
              {/* Scan line effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <div className={cn(
                "relative w-5 h-5 flex items-center justify-center transition-all duration-300",
                isActive && "text-green-400 drop-shadow-[0_0_8px_rgba(0,255,65,0.6)]"
              )}>
                {icon}
              </div>
              
              {!collapsed && (
                <span className="relative ml-1">{label}</span>
              )}
              
              {isActive && !collapsed && (
                <div className="ml-auto w-1 h-6 bg-green-400 rounded-full animate-pulse drop-shadow-[0_0_6px_rgba(0,255,65,0.8)]"></div>
              )}
              
              {/* Corner cuts */}
              <div className="absolute top-0 left-0 w-2 h-2 bg-black transform rotate-45 -translate-x-1 -translate-y-1"></div>
              <div className="absolute top-0 right-0 w-2 h-2 bg-black transform rotate-45 translate-x-1 -translate-y-1"></div>
            </Link>
          )}
        </li>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-black border border-green-500/30 text-green-400 font-mono">
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
      "h-screen fixed left-0 top-0 flex flex-col bg-black border-r border-green-500/20 backdrop-blur-xl",
      collapsed ? "w-20" : "w-64",
      "transition-all duration-300 ease-in-out z-20",
      className
    )}>
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent opacity-50"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      
      {/* Toggle button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute -right-3 top-8 bg-black border border-green-500/30 rounded-full hover:bg-green-500/10 hover:border-green-400/50 z-10 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/25" 
        onClick={() => setCollapsed(!collapsed)}
      >
        <ChevronRight className={cn(
          "h-4 w-4 transition-transform duration-300 text-green-400", 
          collapsed ? "" : "rotate-180"
        )} />
      </Button>

      {/* Logo section */}
      <div className={cn(
        "relative px-4 py-6 flex items-center border-b border-green-500/20", 
        collapsed ? "justify-center" : "justify-start"
      )}>
        {collapsed ? (
          <div className="w-10 h-10 rounded-full overflow-hidden bg-green-500/20 flex items-center justify-center border border-green-500/30">
            <img 
              alt="HBLACKPIX" 
              className="w-full h-full object-cover" 
              src="/lovable-uploads/0e8fcb5a-bcde-4b8a-be24-77413a0562ce.png" 
            />
          </div>
        ) : (
          <div className="flex flex-col items-start">
            <div className="h-10 w-full flex items-center">
              <img 
                alt="HBLACKPIX" 
                className="h-8 mr-3" 
                src="/lovable-uploads/55eb28cc-ed54-4fb2-adeb-e214cf7f1972.png" 
              />
              <div className="text-green-400 font-mono font-bold text-lg tracking-wider">
                HBLACKPIX
              </div>
            </div>
            <div className="text-xs font-mono text-gray-500 tracking-widest uppercase mt-1">
              // CYBER_SYSTEM_V2.0
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="relative flex-1 px-3 py-4 overflow-y-auto scrollbar-none">
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
            icon={<PieChart size={18} />} 
            label="Tarefas" 
            to="/tarefas" 
            isActive={location.pathname === '/tarefas'} 
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
            label="Config" 
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
        </ul>
      </nav>
      
      {/* Footer */}
      {!collapsed && (
        <div className="relative p-4 mt-auto">
          <div className="relative overflow-hidden bg-black border border-green-500/30 rounded-lg p-4 text-center backdrop-blur-sm">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-lg"></div>
            
            <p className="relative text-sm text-gray-400 mb-3 font-mono tracking-wide uppercase">
              // Need_Support?
            </p>
            <a 
              href="https://wa.me/5511998115159" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="relative block w-full bg-green-500/20 border border-green-500/40 text-green-400 px-4 py-2 rounded-md hover:bg-green-500/30 hover:border-green-400/60 transition-all duration-300 font-mono text-sm tracking-wider uppercase overflow-hidden group"
            >
              {/* Scan line effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <div className="relative flex items-center justify-center gap-2">
                <PieChart size={16} />
                Contact_Support
              </div>
            </a>
          </div>
        </div>
      )}
      
      {/* Side accent lines */}
      <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-green-400/30 to-transparent"></div>
    </div>
  );
}
