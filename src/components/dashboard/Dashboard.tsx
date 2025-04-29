
import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, Wallet } from 'lucide-react';
import { StatusCard } from './StatusCard';
import { InvoiceTable } from './InvoiceTable';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientForm } from '../forms/ClientForm';
import { InvoiceForm } from '../forms/InvoiceForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pendentes: 0,
    aprovadas: 0,
    totalRecebido: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const {
          count: total,
          error: errorTotal
        } = await supabase.from('faturas').select('*', {
          count: 'exact',
          head: true
        });
        const {
          count: pendentes,
          error: errorPendentes
        } = await supabase.from('faturas').select('*', {
          count: 'exact',
          head: true
        }).eq('status', 'pendente');
        const {
          count: aprovadas,
          error: errorAprovadas
        } = await supabase.from('faturas').select('*', {
          count: 'exact',
          head: true
        }).eq('status', 'aprovado');
        const {
          data: faturasAprovadas,
          error: errorValor
        } = await supabase.from('faturas').select('valor').eq('status', 'aprovado');
        if (errorTotal || errorPendentes || errorAprovadas || errorValor) throw new Error();
        const totalRecebido = faturasAprovadas?.reduce((sum, item) => sum + Number(item.valor), 0) || 0;
        setStats({
          total: total || 0,
          pendentes: pendentes || 0,
          aprovadas: aprovadas || 0,
          totalRecebido
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const subscription = supabase.channel('table-db-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'faturas'
    }, () => {
      fetchStats();
    }).subscribe();
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-glow">
            <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie suas cobranças e acompanhe pagamentos em tempo real.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pagora-purple to-pagora-purple/80 hover:bg-pagora-purple/90 btn-hover-fx">
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-pagora-dark border-white/10">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
              </DialogHeader>
              <ClientForm />
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pagora-orange to-pagora-orange/80 hover:bg-pagora-orange/90 btn-hover-fx">
                Gerar Fatura
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-pagora-dark border-white/10">
              <DialogHeader>
                <DialogTitle>Gerar Nova Fatura</DialogTitle>
              </DialogHeader>
              <InvoiceForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard 
          title="Total de Faturas" 
          value={loading ? "..." : String(stats.total)} 
          icon={<FileText className="h-5 w-5" />} 
          className="pulse-glow" 
        />
        <StatusCard 
          title="Faturas Pendentes" 
          value={loading ? "..." : String(stats.pendentes)} 
          icon={<Clock className="h-5 w-5" />} 
          variant="pending" 
          description="Aguardando pagamento" 
        />
        <StatusCard 
          title="Faturas Aprovadas" 
          value={loading ? "..." : String(stats.aprovadas)} 
          icon={<CheckCircle className="h-5 w-5" />} 
          variant="success" 
          description="Pagamentos confirmados" 
        />
        <StatusCard 
          title="Total Recebido" 
          value={loading ? "..." : formatCurrency(stats.totalRecebido)} 
          icon={<Wallet className="h-5 w-5" />} 
          description="Valor total recebido" 
        />
      </div>
      
      <Tabs defaultValue="faturas" className="py-6">
        <TabsList className="bg-black/20 border border-white/10">
          <TabsTrigger value="faturas" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pagora-purple/60 data-[state=active]:to-pagora-blue/60 data-[state=active]:text-white">Faturas</TabsTrigger>
          <TabsTrigger value="clientes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pagora-purple/60 data-[state=active]:to-pagora-blue/60 data-[state=active]:text-white">Clientes</TabsTrigger>
        </TabsList>
        <TabsContent value="faturas" className="pt-6 animate-fade-in">
          <InvoiceTable />
        </TabsContent>
        <TabsContent value="clientes" className="pt-6 animate-fade-in">
          <div className="glass-card p-6 bg-black/20">
            <h3 className="text-lg font-medium mb-4 text-gradient">Lista de Clientes</h3>
            <p className="text-muted-foreground">
              Funcionalidade em desenvolvimento. Aqui serão listados todos os seus clientes cadastrados.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
