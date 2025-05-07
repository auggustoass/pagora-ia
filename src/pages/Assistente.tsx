
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { ConversationalChatAssistant } from '@/components/chat/ConversationalChatAssistant';
import { useIsMobile } from '@/hooks/use-mobile';
import { AlertCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Assistente = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  return (
    <Layout>
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
              <div className="space-y-2 text-sm">
                <p className="font-medium">Assistente financeiro completo:</p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Cadastrar novos clientes</li>
                  <li>Gerar faturas automaticamente</li>
                  <li>Criar relatórios de status de pagamento</li>
                  <li>Gerar demonstrativos financeiros (DRE)</li>
                  <li>Fazer projeções e forecasting de faturamento</li>
                  <li>Analisar atrasos e inadimplência</li>
                  <li>Responder dúvidas sobre suas finanças</li>
                </ul>
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
