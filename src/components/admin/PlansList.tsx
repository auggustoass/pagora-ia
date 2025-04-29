
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
import { Pencil, Trash2, PlusCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string | null;
  features: string[];
}

interface PlansListProps {
  onUpdate?: () => void;
}

export function PlansList({ onUpdate }: PlansListProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Partial<Plan> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [featuresInput, setFeaturesInput] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('price');
        
      if (error) throw error;
      
      if (data) {
        const formattedPlans = data.map(plan => ({
          ...plan,
          features: plan.features as unknown as string[]
        }));
        setPlans(formattedPlans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  }

  const handleEditPlan = (plan: Plan) => {
    setCurrentPlan(plan);
    setFeaturesInput(plan.features.join('\n'));
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleAddPlan = () => {
    setCurrentPlan({ features: [] });
    setFeaturesInput('');
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleSavePlan = async () => {
    if (!currentPlan) return;

    // Parse features from textarea
    const features = featuresInput.split('\n').filter(line => line.trim() !== '');

    try {
      if (isEditing && currentPlan.id) {
        // Update existing plan
        const { error } = await supabase
          .from('plans')
          .update({
            name: currentPlan.name,
            price: currentPlan.price,
            description: currentPlan.description,
            features
          })
          .eq('id', currentPlan.id);
        
        if (error) throw error;
        toast.success('Plan updated successfully');
      } else {
        // Create new plan
        const { error } = await supabase
          .from('plans')
          .insert({
            name: currentPlan.name,
            price: currentPlan.price,
            description: currentPlan.description,
            features
          });
        
        if (error) throw error;
        toast.success('Plan created successfully');
      }

      setDialogOpen(false);
      fetchPlans();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Failed to save plan');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', planId);
      
      if (error) throw error;

      toast.success('Plan deleted successfully');
      fetchPlans();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to delete plan');
    }
  };

  const formatCurrency = (price: number) => {
    return `R$${price}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Planos</h3>
        <Button 
          onClick={handleAddPlan}
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Adicionar Plano
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-4">Carregando...</div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Nenhum plano encontrado
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>{plan.name}</TableCell>
                    <TableCell>{formatCurrency(plan.price)}</TableCell>
                    <TableCell>{plan.description || '-'}</TableCell>
                    <TableCell>
                      <ul className="list-disc list-inside">
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="text-sm">{feature}</li>
                        ))}
                        {plan.features.length > 3 && (
                          <li className="text-sm text-muted-foreground">
                            +{plan.features.length - 3} mais...
                          </li>
                        )}
                      </ul>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleEditPlan(plan)} 
                          variant="ghost" 
                          size="sm"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDeletePlan(plan.id)} 
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Plano' : 'Adicionar Plano'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Edite os detalhes do plano abaixo.' 
                : 'Preencha os detalhes para adicionar um novo plano.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input 
                id="name" 
                value={currentPlan?.name || ''} 
                onChange={(e) => setCurrentPlan({ ...currentPlan, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input 
                id="price" 
                type="number"
                value={currentPlan?.price || ''} 
                onChange={(e) => setCurrentPlan({ ...currentPlan, price: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input 
                id="description" 
                value={currentPlan?.description || ''} 
                onChange={(e) => setCurrentPlan({ ...currentPlan, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="features">Features (uma por linha)</Label>
              <Textarea 
                id="features" 
                value={featuresInput} 
                onChange={(e) => setFeaturesInput(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePlan}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
