
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { InvoiceTable } from '@/components/dashboard/InvoiceTable';

const Faturas = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Faturas</h1>
          <p className="text-muted-foreground">Visualize e gerencie todas as suas faturas.</p>
        </div>
        
        <InvoiceTable />
      </div>
    </Layout>
  );
};

export default Faturas;
