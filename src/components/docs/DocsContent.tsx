
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Users, 
  FileText, 
  PieChart, 
  Settings, 
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  CreditCard,
  Bell,
  Shield,
  Menu,
  MessageSquare,
  LogOut,
  ChevronRight,
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface DocsContentProps {
  activeSection: string;
  searchQuery: string;
}

const DocumentationSection = ({ 
  title, 
  children, 
  icon: Icon 
}: { 
  title: string; 
  children: React.ReactNode; 
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}) => (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-xl">
        {Icon && <Icon size={24} className="text-primary" />}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {children}
    </CardContent>
  </Card>
);

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  actions 
}: { 
  icon: React.ComponentType<{ size?: number; className?: string }>; 
  title: string; 
  description: string; 
  actions?: string[];
}) => (
  <div className="border rounded-lg p-4 space-y-3">
    <div className="flex items-start gap-3">
      <div className="p-2 bg-primary/10 rounded-md">
        <Icon size={20} className="text-primary" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
        {actions && (
          <div className="flex flex-wrap gap-1 mt-2">
            {actions.map((action, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {action}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

export function DocsContent({ activeSection, searchQuery }: DocsContentProps) {
  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <>
            <DocumentationSection title="Introdução ao Sistema" icon={Home}>
              <p className="text-muted-foreground leading-relaxed">
                O HBLACKPIX é uma plataforma completa de gestão de faturas e clientes, desenvolvida para 
                simplificar o processo de cobrança e controle financeiro. Esta documentação irá guiá-lo 
                através de todas as funcionalidades disponíveis.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <FeatureCard
                  icon={Users}
                  title="Gestão de Clientes"
                  description="Cadastre e organize seus clientes de forma eficiente"
                  actions={["Adicionar", "Editar", "Buscar", "Exportar"]}
                />
                <FeatureCard
                  icon={FileText}
                  title="Sistema de Faturas"
                  description="Crie e gerencie faturas com pagamento integrado"
                  actions={["Criar", "Enviar", "Acompanhar", "PIX"]}
                />
                <FeatureCard
                  icon={PieChart}
                  title="Relatórios Detalhados"
                  description="Acompanhe suas vendas e performance"
                  actions={["Vendas", "Clientes", "Financeiro"]}
                />
              </div>
            </DocumentationSection>

            <DocumentationSection title="Primeiros Passos" icon={ChevronRight}>
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                  <h4 className="font-semibold text-primary mb-2">Passo 1: Configure seu Perfil</h4>
                  <p className="text-sm text-muted-foreground">
                    Acesse <strong>Configurações → Perfil</strong> e complete suas informações pessoais e de empresa.
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Passo 2: Configure Pagamentos</h4>
                  <p className="text-sm text-muted-foreground">
                    Em <strong>Configurações → Mercado Pago</strong>, configure suas credenciais para receber pagamentos.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Passo 3: Cadastre seu Primeiro Cliente</h4>
                  <p className="text-sm text-muted-foreground">
                    Vá para <strong>Clientes</strong> e clique em "Adicionar Cliente" para começar.
                  </p>
                </div>
              </div>
            </DocumentationSection>
          </>
        );

      case 'navigation':
        return (
          <>
            <DocumentationSection title="Barra Lateral (Sidebar)" icon={Menu}>
              <p className="text-muted-foreground mb-4">
                A barra lateral é o principal meio de navegação do sistema. Ela pode ser recolhida para economizar espaço.
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                <FeatureCard
                  icon={Home}
                  title="Dashboard"
                  description="Página principal com visão geral do sistema"
                  actions={["Estatísticas", "Gráficos", "Ações Rápidas"]}
                />
                <FeatureCard
                  icon={Users}
                  title="Clientes"
                  description="Gerenciamento completo de clientes"
                  actions={["Listar", "Adicionar", "Editar", "Buscar"]}
                />
                <FeatureCard
                  icon={FileText}
                  title="Faturas"
                  description="Criação e gestão de faturas"
                  actions={["Criar", "Listar", "Status", "Pagamentos"]}
                />
                <FeatureCard
                  icon={PieChart}
                  title="Relatórios"
                  description="Análises e relatórios detalhados"
                  actions={["Vendas", "Clientes", "Exportar"]}
                />
                <FeatureCard
                  icon={Settings}
                  title="Configurações"
                  description="Configurações do sistema e perfil"
                  actions={["Perfil", "Pagamentos", "Notificações"]}
                />
              </div>
            </DocumentationSection>

            <DocumentationSection title="Cabeçalho (Header)" icon={Search}>
              <div className="space-y-4">
                <FeatureCard
                  icon={Search}
                  title="Busca Global"
                  description="Pesquise clientes, faturas e informações em todo o sistema"
                  actions={["Buscar Clientes", "Buscar Faturas"]}
                />
                <FeatureCard
                  icon={CreditCard}
                  title="Créditos"
                  description="Visualize seus créditos disponíveis e gerencie sua assinatura"
                  actions={["Ver Créditos", "Comprar Mais"]}
                />
                <FeatureCard
                  icon={Bell}
                  title="Notificações"
                  description="Receba alertas sobre pagamentos, vencimentos e atividades"
                  actions={["Ver Todas", "Marcar Lidas"]}
                />
                <FeatureCard
                  icon={MessageSquare}
                  title="Suporte"
                  description="Acesso direto ao suporte via WhatsApp"
                  actions={["Contatar Suporte"]}
                />
              </div>
            </DocumentationSection>
          </>
        );

      case 'dashboard':
        return (
          <>
            <DocumentationSection title="Cards de Status" icon={BarChart3}>
              <p className="text-muted-foreground mb-4">
                O dashboard apresenta informações importantes em cards coloridos para facilitar a visualização.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FeatureCard
                  icon={DollarSign}
                  title="Receita Total"
                  description="Visualize sua receita total e crescimento mensal"
                  actions={["Valor Total", "Crescimento %"]}
                />
                <FeatureCard
                  icon={FileText}
                  title="Faturas Pendentes"
                  description="Quantidade de faturas aguardando pagamento"
                  actions={["Quantidade", "Valor Total"]}
                />
                <FeatureCard
                  icon={Users}
                  title="Clientes Ativos"
                  description="Número de clientes com faturas ativas"
                  actions={["Total", "Novos Este Mês"]}
                />
                <FeatureCard
                  icon={TrendingUp}
                  title="Taxa de Conversão"
                  description="Percentual de faturas pagas vs criadas"
                  actions={["Percentual", "Tendência"]}
                />
              </div>
            </DocumentationSection>

            <DocumentationSection title="Gráficos e Análises" icon={PieChart}>
              <div className="space-y-4">
                <FeatureCard
                  icon={BarChart3}
                  title="Gráfico de Receita"
                  description="Acompanhe a evolução da receita ao longo do tempo"
                  actions={["Mensal", "Trimestral", "Anual"]}
                />
                <FeatureCard
                  icon={PieChart}
                  title="Status das Faturas"
                  description="Distribuição visual do status de todas as faturas"
                  actions={["Pagas", "Pendentes", "Vencidas", "Canceladas"]}
                />
              </div>
            </DocumentationSection>

            <DocumentationSection title="Ações Rápidas" icon={Plus}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FeatureCard
                  icon={Plus}
                  title="Nova Fatura"
                  description="Crie uma nova fatura rapidamente"
                  actions={["Criar Agora"]}
                />
                <FeatureCard
                  icon={Users}
                  title="Novo Cliente"
                  description="Cadastre um novo cliente"
                  actions={["Adicionar"]}
                />
                <FeatureCard
                  icon={Eye}
                  title="Ver Relatórios"
                  description="Acesse relatórios detalhados"
                  actions={["Abrir"]}
                />
              </div>
            </DocumentationSection>
          </>
        );

      case 'clients':
        return (
          <>
            <DocumentationSection title="Gerenciamento de Clientes" icon={Users}>
              <p className="text-muted-foreground mb-4">
                O módulo de clientes permite cadastrar, editar e organizar informações de todos os seus clientes.
              </p>
              
              <div className="space-y-4">
                <FeatureCard
                  icon={Plus}
                  title="Adicionar Cliente"
                  description="Cadastre novos clientes com informações completas"
                  actions={["Nome", "Email", "Telefone", "CPF/CNPJ", "Endereço"]}
                />
                <FeatureCard
                  icon={Search}
                  title="Buscar Clientes"
                  description="Encontre clientes rapidamente por nome, email ou documento"
                  actions={["Busca Instantânea", "Filtros Avançados"]}
                />
                <FeatureCard
                  icon={Edit}
                  title="Editar Informações"
                  description="Atualize dados dos clientes quando necessário"
                  actions={["Edição Rápida", "Histórico de Alterações"]}
                />
                <FeatureCard
                  icon={FileText}
                  title="Histórico de Faturas"
                  description="Visualize todas as faturas de um cliente específico"
                  actions={["Faturas Pagas", "Pendentes", "Histórico Completo"]}
                />
              </div>
            </DocumentationSection>

            <DocumentationSection title="Funcionalidades Avançadas" icon={Filter}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FeatureCard
                  icon={Download}
                  title="Exportar Dados"
                  description="Exporte lista de clientes em diferentes formatos"
                  actions={["CSV", "Excel", "PDF"]}
                />
                <FeatureCard
                  icon={Trash2}
                  title="Gerenciar Exclusões"
                  description="Remova clientes que não são mais necessários"
                  actions={["Exclusão Segura", "Backup de Dados"]}
                />
              </div>
            </DocumentationSection>
          </>
        );

      case 'invoices':
        return (
          <>
            <DocumentationSection title="Sistema de Faturas" icon={FileText}>
              <p className="text-muted-foreground mb-4">
                Crie, gerencie e acompanhe todas as suas faturas de forma centralizada e eficiente.
              </p>
              
              <div className="space-y-4">
                <FeatureCard
                  icon={Plus}
                  title="Criar Nova Fatura"
                  description="Gere faturas completas com todos os detalhes necessários"
                  actions={["Cliente", "Itens", "Valores", "Vencimento", "Observações"]}
                />
                <FeatureCard
                  icon={CreditCard}
                  title="Pagamento PIX"
                  description="Gere QR Code PIX automaticamente para cada fatura"
                  actions={["QR Code", "Chave PIX", "Valor Automático"]}
                />
                <FeatureCard
                  icon={Eye}
                  title="Acompanhar Status"
                  description="Monitore o status de todas as faturas em tempo real"
                  actions={["Pendente", "Paga", "Vencida", "Cancelada"]}
                />
                <FeatureCard
                  icon={Bell}
                  title="Notificações Automáticas"
                  description="Envie lembretes automáticos para clientes"
                  actions={["Email", "WhatsApp", "Vencimento"]}
                />
              </div>
            </DocumentationSection>

            <DocumentationSection title="Gestão de Pagamentos" icon={DollarSign}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FeatureCard
                  icon={RefreshCw}
                  title="Atualização Automática"
                  description="Status de pagamento atualizado automaticamente"
                  actions={["Webhook", "Tempo Real"]}
                />
                <FeatureCard
                  icon={Calendar}
                  title="Controle de Vencimentos"
                  description="Gerencie datas de vencimento e prazos"
                  actions={["Alertas", "Relatórios"]}
                />
              </div>
            </DocumentationSection>
          </>
        );

      case 'settings':
        return (
          <>
            <DocumentationSection title="Configurações do Sistema" icon={Settings}>
              <p className="text-muted-foreground mb-4">
                Personalize o sistema de acordo com suas necessidades e preferências.
              </p>
              
              <div className="space-y-4">
                <FeatureCard
                  icon={Users}
                  title="Perfil do Usuário"
                  description="Configure suas informações pessoais e da empresa"
                  actions={["Nome", "Email", "Empresa", "Logo"]}
                />
                <FeatureCard
                  icon={CreditCard}
                  title="Configuração de Pagamentos"
                  description="Configure suas credenciais do Mercado Pago"
                  actions={["Access Token", "Public Key", "Webhook"]}
                />
                <FeatureCard
                  icon={Bell}
                  title="Notificações"
                  description="Configure como e quando receber notificações"
                  actions={["Email", "WhatsApp", "Frequência"]}
                />
                <FeatureCard
                  icon={Shield}
                  title="Segurança"
                  description="Gerencie configurações de segurança da conta"
                  actions={["Senha", "2FA", "Sessões"]}
                />
              </div>
            </DocumentationSection>

            <DocumentationSection title="Assinatura e Créditos" icon={CreditCard}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FeatureCard
                  icon={DollarSign}
                  title="Planos de Assinatura"
                  description="Escolha o plano que melhor se adequa às suas necessidades"
                  actions={["Básico", "Profissional", "Empresarial"]}
                />
                <FeatureCard
                  icon={TrendingUp}
                  title="Uso de Créditos"
                  description="Acompanhe o consumo de créditos por funcionalidade"
                  actions={["Histórico", "Relatórios"]}
                />
              </div>
            </DocumentationSection>
          </>
        );

      default:
        return (
          <DocumentationSection title="Selecione uma Seção" icon={Home}>
            <p className="text-muted-foreground">
              Escolha uma seção no menu lateral para visualizar a documentação específica.
            </p>
          </DocumentationSection>
        );
    }
  };

  return (
    <div className="space-y-6">
      {searchQuery && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Mostrando resultados para: <strong>"{searchQuery}"</strong>
          </p>
        </div>
      )}
      
      {renderContent()}
      
      <Separator className="my-8" />
      
      <div className="text-center p-6 bg-muted/50 rounded-lg">
        <MessageSquare className="w-8 h-8 mx-auto text-primary mb-2" />
        <h3 className="font-semibold mb-2">Precisa de Ajuda?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Nossa equipe de suporte está sempre disponível para ajudar você.
        </p>
        <Button className="gap-2">
          <MessageSquare size={16} />
          Falar com Suporte
        </Button>
      </div>
    </div>
  );
}
