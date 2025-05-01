import React from 'react';
import { Home, Users, FileText, PieChart, Settings, HelpCircle, MessageSquare, CreditCard, LogOut, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '../ui/button';
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
}: NavItemProps) => <li>
    {onClick ? <Button variant="ghost" className={cn("flex w-full items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all justify-start font-normal", isActive ? "bg-gradient-to-r from-pagora-purple to-pagora-purple/70 text-white" : "text-muted-foreground hover:bg-white/5 hover:text-white")} onClick={onClick}>
        {icon}
        <span>{label}</span>
      </Button> : <Link to={to} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all", isActive ? "bg-gradient-to-r from-pagora-purple to-pagora-purple/70 text-white" : "text-muted-foreground hover:bg-white/5 hover:text-white")}>
        {icon}
        <span>{label}</span>
        {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>}
      </Link>}
  </li>;
export function Sidebar({
  className
}: SidebarProps) {
  const location = useLocation();
  const {
    user,
    isAdmin,
    signOut
  } = useAuth();
  const handleSignOut = () => {
    signOut();
  };
  return <div className={cn("w-64 border-r border-white/10 h-full flex flex-col bg-black/20 backdrop-blur-md", className)}>
      <div className="px-4 py-6">
        <h2 className="text-2xl font-bold text-gradient text-glow mb-1">HBLACKPIX</h2>
        <p className="text-xs text-muted-foreground">Assistente de Cobrança</p>
      </div>
      
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1.5">
          <NavItem icon={<Home size={18} />} label="Dashboard" to="/" isActive={location.pathname === '/'} />
          
          <NavItem icon={<Users size={18} />} label="Clientes" to="/clientes" isActive={location.pathname === '/clientes'} />
          
          <NavItem icon={<FileText size={18} />} label="Faturas" to="/faturas" isActive={location.pathname === '/faturas'} />
          
          <NavItem icon={<PieChart size={18} />} label="Relatórios" to="/relatorios" isActive={location.pathname === '/relatorios'} />
          
          <NavItem icon={<CreditCard size={18} />} label="Planos" to="/planos" isActive={location.pathname === '/planos'} />
          
          {isAdmin && <NavItem icon={<Shield size={18} />} label="Admin" to="/admin" isActive={location.pathname === '/admin'} />}
          
          <NavItem icon={<Settings size={18} />} label="Configurações" to="/configuracoes" isActive={location.pathname === '/configuracoes'} />
          
          <NavItem icon={<HelpCircle size={18} />} label="Ajuda" to="/ajuda" isActive={location.pathname === '/ajuda'} />
          
          {user && <NavItem icon={<LogOut size={18} />} label="Sair" to="#" onClick={handleSignOut} />}
        </ul>
      </nav>
      
      <div className="p-4 mt-auto">
        <div className="glass-card p-4 text-center bg-gradient-to-br from-black/40 to-black/10">
          <p className="text-sm text-muted-foreground mb-2">Precisa de ajuda?</p>
          <a href="https://wa.me/5511998115159" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-pagora-purple to-pagora-purple/80 text-white px-4 py-2 rounded-md w-full block hover:opacity-90 transition-all btn-hover-fx">
            <div className="flex items-center justify-center gap-2">
              <MessageSquare size={16} />
              Fale com o Suporte
            </div>
          </a>
        </div>
      </div>
    </div>;
}