
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusCard } from '@/components/dashboard/StatusCard';
import { Users, FileText, Clock, Coins, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { UsersList } from './UsersList';
import { InvoicesList } from './InvoicesList';
import { PendingUsersList } from './PendingUsersList';
import { CreditsList } from './CreditsList';
import { MercadoPagoConfig } from './MercadoPagoConfig';

interface AdminStats {
  totalUsers: number;
  totalInvoices: number;
  pendingUsers: number;
  totalCredits: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalInvoices: 0,
    pendingUsers: 0,
    totalCredits: 0
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

      // Fetch pending users
      const { count: pendingCount, error: pendingError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch invoices
      const { count: invoicesCount, error: invoicesError } = await supabase
        .from('faturas')
        .select('*', { count: 'exact', head: true });

      // Fetch total credits
      const { data: creditsData, error: creditsError } = await supabase
        .from('user_invoice_credits')
        .select('credits_remaining');

      const totalCredits = creditsData?.reduce(
        (sum, user) => sum + (user.credits_remaining || 0), 
        0
      ) || 0;
        
      if (usersError || invoicesError || pendingError || creditsError) {
        console.error('Error fetching stats:', { usersError, invoicesError, pendingError, creditsError });
        return;
      }
      
      setStats({
        totalUsers: usersCount || 0,
        totalInvoices: invoicesCount || 0,
        pendingUsers: pendingCount || 0,
        totalCredits
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
          variant="default"
        />
        <StatusCard
          title="Pendentes" 
          value={loading ? "..." : String(stats.pendingUsers)} 
          icon={<Clock className="h-5 w-5" />} 
          variant={stats.pendingUsers > 0 ? "pending" : "default"}
        />
        <StatusCard
          title="Créditos" 
          value={loading ? "..." : String(stats.totalCredits)} 
          icon={<Coins className="h-5 w-5" />} 
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
          <CardDescription>Gerencie usuários, créditos, faturas e configurações</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="pending">
                Pendentes
                {stats.pendingUsers > 0 && (
                  <span className="ml-1 bg-yellow-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {stats.pendingUsers}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="credits">Créditos</TabsTrigger>
              <TabsTrigger value="invoices">Faturas</TabsTrigger>
              <TabsTrigger value="mercadopago">
                <CreditCard className="h-4 w-4 mr-1" />
                Mercado Pago
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
              <PendingUsersList />
            </TabsContent>
            <TabsContent value="users">
              <UsersList onUpdate={fetchStats} />
            </TabsContent>
            <TabsContent value="credits">
              <CreditsList />
            </TabsContent>
            <TabsContent value="invoices">
              <InvoicesList />
            </TabsContent>
            <TabsContent value="mercadopago">
              <MercadoPagoConfig />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
