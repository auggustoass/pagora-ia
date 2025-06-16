
import React from 'react';
import { 
  Home, 
  Info, 
  Users, 
  FileText, 
  Settings, 
  Send,
  MessageSquare,
  Activity,
  Globe,
  Shield,
  CreditCard,
  BarChart3,
  Webhook,
  CheckCircle,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  children?: NavigationItem[];
}

interface DocsNavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'inicio',
    label: 'Início',
    icon: <Home size={16} />
  },
  {
    id: 'get-information',
    label: 'Get Information',
    icon: <Info size={16} />,
    method: 'GET'
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: <Users size={16} />,
    children: [
      { id: 'create-client', label: 'Create Client', icon: <Users size={16} />, method: 'POST' },
      { id: 'get-clients', label: 'Fetch Clients', icon: <Users size={16} />, method: 'GET' },
      { id: 'update-client', label: 'Update Client', icon: <Users size={16} />, method: 'PUT' },
      { id: 'delete-client', label: 'Delete Client', icon: <Trash2 size={16} />, method: 'DELETE' }
    ]
  },
  {
    id: 'faturas',
    label: 'Faturas',
    icon: <FileText size={16} />,
    children: [
      { id: 'create-invoice', label: 'Create Invoice', icon: <FileText size={16} />, method: 'POST' },
      { id: 'get-invoices', label: 'Fetch Invoices', icon: <FileText size={16} />, method: 'GET' },
      { id: 'update-invoice', label: 'Update Invoice', icon: <FileText size={16} />, method: 'PUT' },
      { id: 'cancel-invoice', label: 'Cancel Invoice', icon: <AlertCircle size={16} />, method: 'DELETE' }
    ]
  },
  {
    id: 'pagamentos',
    label: 'Pagamentos',
    icon: <CreditCard size={16} />,
    children: [
      { id: 'create-payment', label: 'Create Payment', icon: <CreditCard size={16} />, method: 'POST' },
      { id: 'check-payment', label: 'Check Payment Status', icon: <CheckCircle size={16} />, method: 'GET' }
    ]
  },
  {
    id: 'webhook',
    label: 'Webhook',
    icon: <Webhook size={16} />,
    children: [
      { id: 'set-webhook', label: 'Set Webhook', icon: <Webhook size={16} />, method: 'POST' },
      { id: 'get-webhook', label: 'Find Webhook', icon: <Webhook size={16} />, method: 'GET' }
    ]
  },
  {
    id: 'configuracoes',
    label: 'Settings',
    icon: <Settings size={16} />,
    children: [
      { id: 'set-settings', label: 'Set Settings', icon: <Settings size={16} />, method: 'POST' },
      { id: 'get-settings', label: 'Find Settings', icon: <Settings size={16} />, method: 'GET' }
    ]
  },
  {
    id: 'mensagens',
    label: 'Send Message',
    icon: <Send size={16} />,
    children: [
      { id: 'send-text', label: 'Send Plain Text', icon: <MessageSquare size={16} />, method: 'POST' },
      { id: 'send-status', label: 'Send Status', icon: <Activity size={16} />, method: 'POST' },
      { id: 'send-media', label: 'Send Media', icon: <FileText size={16} />, method: 'POST' },
      { id: 'send-contact', label: 'Send Contact', icon: <Users size={16} />, method: 'POST' }
    ]
  }
];

const getMethodColor = (method?: string) => {
  switch (method) {
    case 'GET': return 'text-green-400 bg-green-400/10';
    case 'POST': return 'text-blue-400 bg-blue-400/10';
    case 'PUT': return 'text-yellow-400 bg-yellow-400/10';
    case 'DELETE': return 'text-red-400 bg-red-400/10';
    default: return '';
  }
};

export function DocsNavigation({ activeSection, setActiveSection }: DocsNavigationProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['clientes', 'faturas']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const renderNavItem = (item: NavigationItem, level = 0) => {
    const isActive = activeSection === item.id;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.includes(item.id);

    return (
      <div key={item.id}>
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-all text-sm",
            level === 0 ? "hover:bg-gray-800" : "hover:bg-gray-800/50",
            isActive ? "bg-green-600/20 text-green-400 border-r-2 border-green-400" : "text-gray-300",
            level > 0 && "ml-4"
          )}
          onClick={() => {
            if (hasChildren) {
              toggleSection(item.id);
            } else {
              setActiveSection(item.id);
            }
          }}
        >
          {item.method && (
            <span className={cn("px-2 py-0.5 rounded text-xs font-mono", getMethodColor(item.method))}>
              {item.method}
            </span>
          )}
          {item.icon}
          <span className="flex-1">{item.label}</span>
          {hasChildren && (
            <span className={cn("transition-transform", isExpanded ? "rotate-90" : "")}>
              ▶
            </span>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-80 bg-[#111111] border-r border-gray-800 h-screen overflow-y-auto">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <Globe size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">HBLACKPIX API</h1>
            <p className="text-xs text-gray-400">v2</p>
          </div>
        </div>
        
        <div className="mt-4 relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
          />
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-2">
          {navigationItems.map(item => renderNavItem(item))}
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-gray-800">
        <div className="text-xs text-gray-500 text-center">
          Powered by HBLACKPIX
        </div>
      </div>
    </div>
  );
}
