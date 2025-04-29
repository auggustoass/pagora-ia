
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { PieChart, BarChart3 } from 'lucide-react';

const Relatorios = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">Visualize estatísticas e relatórios das suas cobranças.</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="glass-card p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Status de Pagamentos
            </h2>
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              Gráficos de status estarão disponíveis em breve.
            </div>
          </div>
          
          <div className="glass-card p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Valores Recebidos
            </h2>
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              Gráficos de valores estarão disponíveis em breve.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Relatorios;
