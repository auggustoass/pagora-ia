
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { PricingPlans } from '@/components/subscription/PricingPlans';

const Planos = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Planos</h1>
          <p className="text-muted-foreground">
            Escolha o plano que melhor se adapta às necessidades do seu negócio. 
            Cada plano inclui uma quantidade de créditos para gerar faturas.
          </p>
        </div>
        
        <PricingPlans />
      </div>
    </Layout>
  );
};

export default Planos;
