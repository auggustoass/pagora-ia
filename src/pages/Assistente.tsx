
import React, { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ConversationalChatAssistant } from '@/components/chat/ConversationalChatAssistant';
import { useIsMobile } from '@/hooks/use-mobile';
import { AlertCircle, ChevronDown, Coins, BarChart3, UserPlus, FileText, PieChart } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { usePlans } from '@/hooks/use-plans';
import { CreditsDisplay } from '@/components/dashboard/CreditsDisplay';

const Assistente = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { plans } = usePlans();
  
  return (
    <Layout requireAuth={false}>
      <div className="flex flex-col h-full animate-fade-in space-y-4 md:space-y-6">
        <div className={isMobile ? "pb-2" : ""}>
          <h1 className={`${isMobile ? "text-2xl" : "text-3xl"} font-bold tracking-tight text-glow`}>
            <span className="text-gradient">Assistente Financeiro</span>
          </h1>
          <p className={`text-muted-foreground ${isMobile ? "text-sm" : "text-base"} mt-1`}>
            Gerencie suas finanças, clientes, faturas e relatórios com o assistente inteligente
          </p>
        </div>
        
        {!user && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Acesso limitado</h3>
              <p className="text-sm text-muted-foreground">
                Para usar todas as funcionalidades do assistente financeiro, você precisa estar logado.
                <button 
                  className="ml-2 text-sm font-medium underline text-primary"
                  onClick={() => navigate('/auth')}
                >
                  Fazer login
                </button>
              </p>
            </div>
          </div>
        )}
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="capabilities">
            <AccordionTrigger className="text-sm font-medium">
              O que o assistente pode fazer?
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-primary" />
                  <p className="font-medium">Gerenciamento de Clientes:</p>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Cadastrar novos clientes com todos os dados necessários</li>
                  <li>Consultar informações de clientes existentes</li>
                </ul>
                
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <p className="font-medium">Geração de Faturas:</p>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Criar faturas para clientes cadastrados</li>
                  <li>Definir valores, datas de vencimento e descrições</li>
                </ul>

                <div className="flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-primary" />
                  <p className="font-medium">Relatórios Financeiros:</p>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Status de pagamento de faturas</li>
                  <li>Relatórios mensais de faturamento</li>
                  <li>Demonstrativo de Resultado (DRE)</li>
                  <li>Análise de inadimplência e atrasos</li>
                </ul>

                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <p className="font-medium">Análises Avançadas:</p>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Previsão de faturamento futuro</li>
                  <li>Tendências de crescimento</li>
                  <li>Relatórios personalizados</li>
                </ul>
                
                {user && (
                  <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-md">
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-green-500" />
                      <p className="font-medium text-green-500">Seu plano: {
                        plans.find(p => p.id === (user?.user_metadata?.plan_id || ''))?.name || 'Basic'
                      }</p>
                    </div>
                    <p className="text-xs mt-2 text-muted-foreground">
                      Clique nos botões de ação rápida abaixo do chat para começar a usar o assistente.
                    </p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="examples">
            <AccordionTrigger className="text-sm font-medium">
              Exemplos de perguntas
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 text-sm pb-2">
                <p className="font-medium">Experimente perguntar:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    "Cadastrar um novo cliente",
                    "Gerar uma nova fatura",
                    "Gerar relatório de status de pagamentos",
                    "Fazer previsão de faturamento",
                    "Analisar faturas em atraso",
                    "Gerar demonstrativo de resultados (DRE)",
                    "Qual é o status do cliente X?",
                    "Quanto faturei este mês?"
                  ].map((example, index) => (
                    <Button 
                      key={index} 
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto py-2"
                      onClick={() => {
                        const textArea = document.querySelector('.assistant-input') as HTMLInputElement;
                        if (textArea) {
                          textArea.value = example;
                          textArea.focus();
                        }
                      }}
                    >
                      "{example}"
                    </Button>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <div className={`flex-1 ${isMobile ? "h-[calc(100vh-14rem)]" : "h-[calc(100vh-16rem)]"}`}>
          <ConversationalChatAssistant />
        </div>
      </div>
    </Layout>
  );
};

export default Assistente;

