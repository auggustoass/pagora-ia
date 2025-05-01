
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusCard } from '@/components/dashboard/StatusCard';
import { Users, FileText, CreditCard, Calendar, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { UsersList } from './UsersList';
import { PlansList } from './PlansList';
import { SubscriptionsList } from './SubscriptionsList';
import { InvoicesList } from './InvoicesList';
import { AdminMercadoPago } from './AdminMercadoPago';

interface AdminStats {
  totalUsers: number;
  totalSubscriptions: number;
  totalPlans: number;
  totalInvoices: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalSubscriptions: 0,
    totalPlans: 0,
    totalInvoices: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    try {
      // Fetch total users
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch subscriptions
      const { count: subscriptionsCount, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true });
        
      // Fetch plans
      const { count: plansCount, error: plansError } = await supabase
        .from('plans')
        .select('*', { count: 'exact', head: true });

      // Fetch invoices
      const { count: invoicesCount, error: invoicesError } = await supabase
        .from('faturas')
        .select('*', { count: 'exact', head: true });
        
      if (usersError || subscriptionsError || plansError || invoicesError) {
        console.error('Error fetching stats:', { usersError, subscriptionsError, plansError, invoicesError });
        return;
      }
      
      setStats({
        totalUsers: usersCount || 0,
        totalSubscriptions: subscriptionsCount || 0,
        totalPlans: plansCount || 0,
        totalInvoices: invoicesCount || 0
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Painel de Administração</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard
          title="Usuários" 
          value={loading ? "..." : String(stats.totalUsers)} 
          icon={<Users className="h-5 w-5" />} 
          className="pulse-glow"
          variant="default"
        />
        <StatusCard 
          title="Assinaturas" 
          value={loading ? "..." : String(stats.totalSubscriptions)} 
          icon={<Calendar className="h-5 w-5" />} 
          variant="pending"
        />
        <StatusCard 
          title="Planos" 
          value={loading ? "..." : String(stats.totalPlans)} 
          icon={<CreditCard className="h-5 w-5" />} 
          variant="success"
        />
        <StatusCard 
          title="Faturas" 
          value={loading ? "..." : String(stats.totalInvoices)} 
          icon={<FileText className="h-5 w-5" />} 
          variant="default"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento</CardTitle>
          <CardDescription>Gerencie usuários, planos, assinaturas, faturas e configurações</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="plans">Planos</TabsTrigger>
              <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
              <TabsTrigger value="invoices">Faturas</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
            <TabsContent value="users">
              <UsersList onUpdate={fetchStats} />
            </TabsContent>
            <TabsContent value="plans">
              <PlansList onUpdate={fetchStats} />
            </TabsContent>
            <TabsContent value="subscriptions">
              <SubscriptionsList onUpdate={fetchStats} />
            </TabsContent>
            <TabsContent value="invoices">
              <InvoicesList />
            </TabsContent>
            <TabsContent value="settings">
              <div className="space-y-6">
                <AdminMercadoPago />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
