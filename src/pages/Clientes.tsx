
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Users } from 'lucide-react';

const Clientes = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gerencie seus clientes e visualize informações de contato.</p>
        </div>
        
        <div className="glass-card p-6">
          <div className="flex items-center justify-center h-40 flex-col gap-2 text-muted-foreground">
            <Users size={40} />
            <p>A listagem completa de clientes estará disponível em breve.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Clientes;
