
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, CreditCard, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../auth/AuthProvider';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';

interface Subscription {
  id: string;
  status: string;
  start_date: string;
  trial_ends_at: string | null;
  end_date: string | null;
  payment_status: string | null;
  mercado_pago_subscription_id: string | null;
  plans: {
    id: string;
    name: string;
    price: number;
  };
}

interface Payment {
  id: string;
  status: string;
  amount: number;
  payment_date: string;
}

export function SubscriptionDetails() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSubscriptionData();
    }
  }, [user]);

  async function fetchSubscriptionData() {
    try {
      setLoading(true);
      
      // Get active subscription
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*, plans(id, name, price)')
        .eq('user_id', user!.id)
        .in('status', ['active', 'trial'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        throw subscriptionError;
      }
      
      if (subscriptionData) {
        setSubscription(subscriptionData as Subscription);
        
        // Get payment history
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('subscription_payments')
          .select('*')
          .eq('subscription_id', subscriptionData.id)
          .order('payment_date', { ascending: false });
          
        if (paymentsError) {
          throw paymentsError;
        }
        
        setPayments(paymentsData as Payment[]);
      }
      
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error('Erro ao carregar dados da assinatura');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelSubscription() {
    if (!subscription || !user) return;
    
    try {
      setCancelling(true);
      
      // Verify the user making the request
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        throw new Error('Sessão expirada');
      }
      
      // Update subscription status in database
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          end_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // If we have a Mercado Pago subscription ID, cancel it there too
      if (subscription.mercado_pago_subscription_id) {
        // This could be done via another edge function if needed
        // For now, we'll just update our database
        console.log('Would cancel MP subscription:', subscription.mercado_pago_subscription_id);
      }
      
      toast.success('Assinatura cancelada com sucesso');
      setCancelDialogOpen(false);
      
      // Refresh the data
      fetchSubscriptionData();
      
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      toast.error(`Erro ao cancelar assinatura: ${error.message}`);
    } finally {
      setCancelling(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'trial':
        return 'bg-blue-500';
      case 'canceled':
        return 'bg-yellow-500';
      case 'expired':
      default:
        return 'bg-red-500';
    }
  }

  function formatStatus(status: string) {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'trial':
        return 'Período de Teste';
      case 'canceled':
        return 'Cancelado';
      case 'expired':
        return 'Expirado';
      default:
        return status;
    }
  }

  function formatPaymentStatus(status: string) {
    switch (status) {
      case 'approved':
      case 'paid':
        return 'Aprovado';
      case 'pending':
        return 'Pendente';
      case 'canceled':
        return 'Cancelado';
      case 'failed':
        return 'Falha';
      default:
        return status;
    }
  }

  function formatCurrency(price: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  function formatDate(date: string | null) {
    if (!date) return '-';
    return format(new Date(date), 'dd/MM/yyyy');
  }

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-pagora-purple" />
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Assinatura</CardTitle>
          <CardDescription>Você não possui uma assinatura ativa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma assinatura encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Você não possui uma assinatura ativa no momento.
              Assine um plano para acessar todas as funcionalidades.
            </p>
            <Button 
              onClick={() => window.location.href = '/planos'} 
              className="bg-gradient-to-r from-pagora-purple to-pagora-purple/80"
            >
              Ver Planos
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sua Assinatura</CardTitle>
              <CardDescription>Detalhes do seu plano atual</CardDescription>
            </div>
            <Badge className={getStatusColor(subscription.status)}>
              {formatStatus(subscription.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Plano</div>
                <div className="text-xl font-semibold">{subscription.plans.name}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Valor Mensal</div>
                <div className="text-xl font-semibold">{formatCurrency(subscription.plans.price)}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Status do Pagamento</div>
                <div className="flex items-center">
                  {subscription.payment_status === 'paid' ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-pagora-success mr-2" />
                      <span>Pago</span>
                    </>
                  ) : subscription.payment_status === 'pending' ? (
                    <>
                      <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                      <span>Pendente</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      <span>{formatPaymentStatus(subscription.payment_status || 'unknown')}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Data de Início</div>
                <div>{formatDate(subscription.start_date)}</div>
              </div>
              
              {subscription.trial_ends_at && (
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Fim do Período Gratuito</div>
                  <div>{formatDate(subscription.trial_ends_at)}</div>
                </div>
              )}
              
              {subscription.end_date && (
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Data de Término</div>
                  <div>{formatDate(subscription.end_date)}</div>
                </div>
              )}
            </div>
            
            {subscription.status === 'trial' && (
              <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-500">
                <Clock className="h-5 w-5" />
                <AlertTitle>Período de Teste</AlertTitle>
                <AlertDescription>
                  Você está no período de teste gratuito. 
                  {subscription.trial_ends_at && 
                    ` Após ${formatDate(subscription.trial_ends_at)}, você será cobrado automaticamente.`
                  }
                </AlertDescription>
              </Alert>
            )}
            
            {(subscription.status === 'active' || subscription.status === 'trial') && (
              <div className="flex justify-end pt-4">
                <Button 
                  variant="outline"
                  className="text-red-500 border-red-500 hover:bg-red-500/10"
                  onClick={() => setCancelDialogOpen(true)}
                >
                  Cancelar Assinatura
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {payments.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Histórico de Pagamentos</CardTitle>
            <CardDescription>Registro de pagamentos da sua assinatura</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 bg-black/30">
                  <TableHead className="text-muted-foreground">Data</TableHead>
                  <TableHead className="text-muted-foreground">Valor</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id} className="border-white/5">
                    <TableCell>{formatDate(payment.payment_date)}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {payment.status === 'approved' ? (
                          <CheckCircle className="h-4 w-4 text-pagora-success mr-2" />
                        ) : payment.status === 'pending' ? (
                          <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                        )}
                        {formatPaymentStatus(payment.status)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Cancel Subscription Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Assinatura</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar sua assinatura? Você perderá acesso às funcionalidades após o término do período atual.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert className="bg-yellow-500/10 border-yellow-500/20 text-yellow-500">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>Atenção</AlertTitle>
              <AlertDescription>
                O cancelamento será efetivado imediatamente e você não receberá reembolso pelo período não utilizado.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelling}
            >
              Voltar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={cancelling}
            >
              {cancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                'Confirmar Cancelamento'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
