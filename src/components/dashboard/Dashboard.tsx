
import React from 'react';
import { FileText, Clock, CheckCircle, XCircle, Wallet } from 'lucide-react';
import { StatusCard } from './StatusCard';
import { InvoiceTable } from './InvoiceTable';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ClientForm } from '../forms/ClientForm';
import { InvoiceForm } from '../forms/InvoiceForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function Dashboard() {
  return (
    <div className="space-y-6">
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
        <StatusCard 
          title="Total de Faturas" 
          value="12" 
          icon={<FileText className="h-4 w-4" />}
        />
        <StatusCard 
          title="Faturas Pendentes" 
          value="5" 
          icon={<Clock className="h-4 w-4" />}
          variant="pending" 
          description="+2 nos últimos 7 dias"
        />
        <StatusCard 
          title="Faturas Aprovadas" 
          value="6" 
          icon={<CheckCircle className="h-4 w-4" />}
          variant="success" 
          description="+3 nos últimos 7 dias"
        />
        <StatusCard 
          title="Total Recebido" 
          value="R$ 3.450,50" 
          icon={<Wallet className="h-4 w-4" />}
          description="Últimos 30 dias"
        />
      </div>
      
      <Tabs defaultValue="faturas">
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
    </div>
  );
}
