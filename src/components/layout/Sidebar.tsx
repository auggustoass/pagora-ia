
import React from 'react';
import { Home, Users, FileText, Settings, PieChart, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}

const NavItem = ({ icon, label, isActive = false }: NavItemProps) => (
  <li className={cn(
    "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all",
    isActive 
      ? "bg-pagora-purple text-white" 
      : "text-muted-foreground hover:bg-white/5 hover:text-white"
  )}>
    {icon}
    <span>{label}</span>
  </li>
);

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("w-64 border-r border-white/10 h-full flex flex-col", className)}>
      <div className="px-4 py-6">
        <h2 className="text-2xl font-bold text-pagora-purple mb-1">PAGORA</h2>
        <p className="text-xs text-muted-foreground">Assistente de Cobrança</p>
      </div>
      
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          <NavItem icon={<Home size={20} />} label="Dashboard" isActive />
          <NavItem icon={<Users size={20} />} label="Clientes" />
          <NavItem icon={<FileText size={20} />} label="Faturas" />
          <NavItem icon={<PieChart size={20} />} label="Relatórios" />
          <NavItem icon={<Settings size={20} />} label="Configurações" />
          <NavItem icon={<HelpCircle size={20} />} label="Ajuda" />
        </ul>
      </nav>
      
      <div className="p-4 mt-auto">
        <div className="glass-card p-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">Precisa de ajuda?</p>
          <button className="bg-pagora-purple text-white px-4 py-2 rounded-md w-full hover:bg-opacity-90 transition-all">
            Fale com o Suporte
          </button>
        </div>
      </div>
    </div>
  );
}
