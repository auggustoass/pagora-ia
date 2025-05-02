
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { ConversationalChatAssistant } from '@/components/chat/ConversationalChatAssistant';

const Assistente = () => {
  return (
    <Layout>
      <div className="flex flex-col h-full animate-fade-in space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-glow">
            <span className="text-gradient">Assistente Virtual</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Converse com o assistente para cadastrar clientes, gerar faturas ou tirar dúvidas.
          </p>
        </div>
        
        <div className="flex-1 h-[calc(100vh-12rem)]">
          <ConversationalChatAssistant />
        </div>
      </div>
    </Layout>
  );
};

export default Assistente;
