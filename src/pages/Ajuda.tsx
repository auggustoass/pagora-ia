
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { MessageSquare, FileQuestion, Book, ExternalLink } from 'lucide-react';

const Ajuda = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ajuda</h1>
          <p className="text-muted-foreground">Encontre respostas para suas dúvidas e saiba como utilizar o PAGORA.</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="glass-card p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <FileQuestion className="h-5 w-5" />
              Perguntas Frequentes
            </h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="p-2 hover:bg-white/5 rounded-md cursor-pointer transition-colors">
                Como cadastrar um novo cliente?
              </li>
              <li className="p-2 hover:bg-white/5 rounded-md cursor-pointer transition-colors">
                Como gerar uma nova fatura?
              </li>
              <li className="p-2 hover:bg-white/5 rounded-md cursor-pointer transition-colors">
                Como acompanhar o status de uma cobrança?
              </li>
              <li className="p-2 hover:bg-white/5 rounded-md cursor-pointer transition-colors">
                Como emitir relatórios?
              </li>
            </ul>
          </div>
          
          <div className="glass-card p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Book className="h-5 w-5" />
              Tutoriais
            </h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="p-2 hover:bg-white/5 rounded-md cursor-pointer transition-colors flex items-center justify-between">
                <span>Guia completo do PAGORA</span>
                <ExternalLink size={16} />
              </li>
              <li className="p-2 hover:bg-white/5 rounded-md cursor-pointer transition-colors flex items-center justify-between">
                <span>Como integrar com serviços de pagamento</span>
                <ExternalLink size={16} />
              </li>
              <li className="p-2 hover:bg-white/5 rounded-md cursor-pointer transition-colors flex items-center justify-between">
                <span>Personalização de faturas</span>
                <ExternalLink size={16} />
              </li>
            </ul>
          </div>
          
          <div className="glass-card p-6 md:col-span-2">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Contato de Suporte
            </h2>
            <div className="flex flex-col items-center justify-center p-4 space-y-4">
              <p className="text-muted-foreground">
                Não encontrou o que procurava? Entre em contato com nossa equipe de suporte.
              </p>
              <a 
                href="https://wa.me/5511998115159" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-pagora-purple text-white px-6 py-3 rounded-md hover:bg-opacity-90 transition-all flex items-center gap-2"
              >
                <MessageSquare size={18} />
                Suporte via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Ajuda;
