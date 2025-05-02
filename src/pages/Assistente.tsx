
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { ConversationalChatAssistant } from '@/components/chat/ConversationalChatAssistant';
import { useIsMobile } from '@/hooks/use-mobile';

const Assistente = () => {
  const isMobile = useIsMobile();
  
  return (
    <Layout>
      <div className="flex flex-col h-full animate-fade-in space-y-4 md:space-y-6">
        <div className={isMobile ? "pb-2" : ""}>
          <h1 className={`${isMobile ? "text-2xl" : "text-3xl"} font-bold tracking-tight text-glow`}>
            <span className="text-gradient">Assistente Virtual</span>
          </h1>
          <p className={`text-muted-foreground ${isMobile ? "text-sm" : "text-base"} mt-1`}>
            Converse com o assistente para cadastrar clientes, gerar faturas ou tirar dúvidas.
          </p>
        </div>
        
        <div className={`flex-1 ${isMobile ? "h-[calc(100vh-10rem)]" : "h-[calc(100vh-12rem)]"}`}>
          <ConversationalChatAssistant />
        </div>
      </div>
    </Layout>
  );
};

export default Assistente;
