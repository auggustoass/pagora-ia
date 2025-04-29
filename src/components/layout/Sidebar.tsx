
import React from 'react';
import { Home, Users, FileText, PieChart, Settings, HelpCircle, MessageSquare } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  isActive?: boolean;
}

const NavItem = ({ icon, label, to, isActive = false }: NavItemProps) => (
  <li>
    <Link 
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all",
        isActive 
          ? "bg-pagora-purple text-white" 
          : "text-muted-foreground hover:bg-white/5 hover:text-white"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  </li>
);

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  
  return (
    <div className={cn("w-64 border-r border-white/10 h-full flex flex-col", className)}>
      <div className="px-4 py-6">
        <h2 className="text-2xl font-bold text-pagora-purple mb-1">PAGORA</h2>
        <p className="text-xs text-muted-foreground">Assistente de Cobrança</p>
      </div>
      
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          <NavItem 
            icon={<Home size={20} />} 
            label="Dashboard" 
            to="/"
            isActive={location.pathname === '/'} 
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="Clientes" 
            to="/clientes"
            isActive={location.pathname === '/clientes'} 
          />
          <NavItem 
            icon={<FileText size={20} />} 
            label="Faturas" 
            to="/faturas"
            isActive={location.pathname === '/faturas'} 
          />
          <NavItem 
            icon={<PieChart size={20} />} 
            label="Relatórios" 
            to="/relatorios"
            isActive={location.pathname === '/relatorios'} 
          />
          <NavItem 
            icon={<Settings size={20} />} 
            label="Configurações" 
            to="/configuracoes"
            isActive={location.pathname === '/configuracoes'} 
          />
          <NavItem 
            icon={<HelpCircle size={20} />} 
            label="Ajuda" 
            to="/ajuda"
            isActive={location.pathname === '/ajuda'} 
          />
        </ul>
      </nav>
      
      <div className="p-4 mt-auto">
        <div className="glass-card p-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">Precisa de ajuda?</p>
          <a 
            href="https://wa.me/5511998115159" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-pagora-purple text-white px-4 py-2 rounded-md w-full block hover:bg-opacity-90 transition-all"
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
