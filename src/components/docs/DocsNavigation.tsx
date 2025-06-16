
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Users, 
  FileText, 
  PieChart, 
  Settings, 
  Shield,
  MessageSquare,
  CreditCard,
  Search,
  Menu,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocsNavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  searchQuery: string;
}

const navigationSections = [
  {
    id: 'overview',
    title: 'Visão Geral',
    icon: Home,
    subsections: ['introducao', 'primeiros-passos', 'interface']
  },
  {
    id: 'navigation',
    title: 'Navegação',
    icon: Menu,
    subsections: ['sidebar', 'header', 'atalhos']
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: PieChart,
    subsections: ['cards-status', 'graficos', 'acoes-rapidas']
  },
  {
    id: 'clients',
    title: 'Clientes',
    icon: Users,
    subsections: ['listar', 'adicionar', 'editar', 'pesquisar']
  },
  {
    id: 'invoices',
    title: 'Faturas',
    icon: FileText,
    subsections: ['criar', 'gerenciar', 'pagamentos', 'status']
  },
  {
    id: 'reports',
    title: 'Relatórios',
    icon: PieChart,
    subsections: ['vendas', 'clientes', 'financeiro', 'exportar']
  },
  {
    id: 'settings',
    title: 'Configurações',
    icon: Settings,
    subsections: ['perfil', 'assinatura', 'notificacoes', 'seguranca']
  },
  {
    id: 'advanced',
    title: 'Avançado',
    icon: Shield,
    subsections: ['admin', 'api', 'integracao', 'backup']
  },
  {
    id: 'help',
    title: 'Ajuda & Suporte',
    icon: HelpCircle,
    subsections: ['faq', 'contato', 'tutoriais', 'troubleshooting']
  }
];

export function DocsNavigation({ activeSection, setActiveSection, searchQuery }: DocsNavigationProps) {
  const filteredSections = navigationSections.filter(section => 
    searchQuery === '' || 
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.subsections.some(sub => sub.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Seções
        </h3>
      </div>
      
      <nav className="space-y-2">
        {filteredSections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <div key={section.id} className="space-y-1">
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2 h-9",
                  isActive && "bg-primary/10 text-primary font-medium"
                )}
                onClick={() => setActiveSection(section.id)}
              >
                <Icon size={16} />
                <span className="text-sm">{section.title}</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {section.subsections.length}
                </Badge>
              </Button>
              
              {isActive && (
                <div className="ml-6 space-y-1 border-l border-border pl-4">
                  {section.subsections.map((subsection) => (
                    <Button
                      key={subsection}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setActiveSection(`${section.id}-${subsection}`)}
                    >
                      {subsection.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
