import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, XCircle, Wallet } from 'lucide-react';
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
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Gerencie suas cobranças e acompanhe pagamentos.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-pagora-purple hover:bg-pagora-purple/90">
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
              <Button className="bg-pagora-orange hover:bg-pagora-orange/90">
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
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard title="Total de Faturas" value={loading ? "..." : String(stats.total)} icon={<FileText className="h-4 w-4" />} />
        <StatusCard title="Faturas Pendentes" value={loading ? "..." : String(stats.pendentes)} icon={<Clock className="h-4 w-4" />} variant="pending" description="Aguardando pagamento" />
        <StatusCard title="Faturas Aprovadas" value={loading ? "..." : String(stats.aprovadas)} icon={<CheckCircle className="h-4 w-4" />} variant="success" description="Pagamentos confirmados" />
        <StatusCard title="Total Recebido" value={loading ? "..." : formatCurrency(stats.totalRecebido)} icon={<Wallet className="h-4 w-4" />} description="Valor total recebido" />
      </div>
      
      <Tabs defaultValue="faturas" className="py-[52px]">
        <TabsList className="bg-white/5 border-white/10">
          <TabsTrigger value="faturas">Faturas</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
        </TabsList>
        <TabsContent value="faturas" className="pt-6">
          <InvoiceTable />
        </TabsContent>
        <TabsContent value="clientes" className="pt-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-medium mb-4">Lista de Clientes</h3>
            <p className="text-muted-foreground">
              Funcionalidade em desenvolvimento. Aqui serão listados todos os seus clientes cadastrados.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>;
}