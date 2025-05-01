
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { SubscriptionDetails } from '@/components/subscription/SubscriptionDetails';

const ConfiguracoesAssinatura = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gerenciar Assinatura</h1>
          <p className="text-muted-foreground">
            Visualize detalhes de sua assinatura atual e histórico de pagamentos.
          </p>
        </div>
        
        <SubscriptionDetails />
      </div>
    </Layout>
  );
};

export default ConfiguracoesAssinatura;
