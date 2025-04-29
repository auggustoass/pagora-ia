
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  start_date: string;
  end_date: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
  plan_name?: string;
}

interface Plan {
  id: string;
  name: string;
}

interface SubscriptionsListProps {
  onUpdate?: () => void;
}

export function SubscriptionsList({ onUpdate }: SubscriptionsListProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<Partial<Subscription> | null>(null);

  useEffect(() => {
    fetchPlans();
    fetchSubscriptions();
  }, []);

  async function fetchPlans() {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('id, name');
        
      if (error) throw error;
      
      if (data) {
        setPlans(data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  }

  async function fetchSubscriptions() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        // Enrich with user and plan data
        const enrichedData = await Promise.all(data.map(async subscription => {
          // Get profile info
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', subscription.user_id)
            .single();
          
          // Get plan info
          const { data: plan } = await supabase
            .from('plans')
            .select('name')
            .eq('id', subscription.plan_id)
            .single();
          
          return {
            ...subscription,
            user_email: subscription.user_id, // In a real app, we would get email from auth
            user_name: profile ? `${profile.first_name} ${profile.last_name}`.trim() : 'Unknown',
            plan_name: plan?.name || 'Unknown'
          };
        }));
        
        setSubscriptions(enrichedData);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }

  const handleEditSubscription = (subscription: Subscription) => {
    setCurrentSubscription(subscription);
    setDialogOpen(true);
  };

  const handleSaveSubscription = async () => {
    if (!currentSubscription || !currentSubscription.id) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          plan_id: currentSubscription.plan_id,
          status: currentSubscription.status,
          end_date: currentSubscription.end_date,
          trial_ends_at: currentSubscription.trial_ends_at
        })
        .eq('id', currentSubscription.id);
        
      if (error) throw error;

      toast.success('Subscription updated successfully');
      setDialogOpen(false);
      fetchSubscriptions();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update subscription');
    }
  };

  const handleDeleteSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;
    
    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', subscriptionId);
      
      if (error) throw error;

      toast.success('Subscription deleted successfully');
      fetchSubscriptions();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast.error('Failed to delete subscription');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Assinaturas</h3>
      </div>
      
      {loading ? (
        <div className="text-center py-4">Carregando...</div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Início</TableHead>
                <TableHead>Fim do Período</TableHead>
                <TableHead>Fim do Trial</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Nenhuma assinatura encontrada
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>{subscription.user_name || subscription.user_email}</TableCell>
                    <TableCell>{subscription.plan_name}</TableCell>
                    <TableCell>{subscription.status}</TableCell>
                    <TableCell>
                      {format(new Date(subscription.start_date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      {subscription.end_date 
                        ? format(new Date(subscription.end_date), 'dd/MM/yyyy')
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {subscription.trial_ends_at 
                        ? format(new Date(subscription.trial_ends_at), 'dd/MM/yyyy')
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleEditSubscription(subscription)} 
                          variant="ghost" 
                          size="sm"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDeleteSubscription(subscription.id)} 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Assinatura</DialogTitle>
            <DialogDescription>
              Edite os detalhes da assinatura abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Usuário</Label>
              <Input 
                value={currentSubscription?.user_name || currentSubscription?.user_email || ''} 
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan">Plano</Label>
              <Select
                value={currentSubscription?.plan_id}
                onValueChange={(value) => 
                  setCurrentSubscription({ ...currentSubscription, plan_id: value })
                }
              >
                <SelectTrigger id="plan">
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={currentSubscription?.status || ''}
                onValueChange={(value) => 
                  setCurrentSubscription({ ...currentSubscription, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Data de Término</Label>
              <Input 
                id="end_date" 
                type="date"
                value={currentSubscription?.end_date 
                  ? new Date(currentSubscription.end_date).toISOString().split('T')[0] 
                  : ''}
                onChange={(e) => 
                  setCurrentSubscription({ 
                    ...currentSubscription, 
                    end_date: e.target.value ? new Date(e.target.value).toISOString() : null 
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trial_ends_at">Fim do Trial</Label>
              <Input 
                id="trial_ends_at" 
                type="date"
                value={currentSubscription?.trial_ends_at 
                  ? new Date(currentSubscription.trial_ends_at).toISOString().split('T')[0] 
                  : ''}
                onChange={(e) => 
                  setCurrentSubscription({ 
                    ...currentSubscription, 
                    trial_ends_at: e.target.value ? new Date(e.target.value).toISOString() : null 
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSubscription}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
