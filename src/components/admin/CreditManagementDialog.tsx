
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCredit, CreditTransaction } from '@/services/AdminCreditsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CreditManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserCredit | null;
  onUpdateCredits: (userId: string, newAmount: number, transactionType: 'add' | 'remove' | 'set', reason?: string) => Promise<boolean>;
  transactions: CreditTransaction[];
  onFetchTransactions: (userId: string) => void;
}

export function CreditManagementDialog({
  open,
  onOpenChange,
  user,
  onUpdateCredits,
  transactions,
  onFetchTransactions
}: CreditManagementDialogProps) {
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState<'add' | 'remove' | 'set'>('add');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && open) {
      onFetchTransactions(user.user_id);
    }
  }, [user, open, onFetchTransactions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount) return;

    setLoading(true);
    
    let finalAmount = parseInt(amount);
    
    if (transactionType === 'add') {
      finalAmount = user.credits_remaining + finalAmount;
    } else if (transactionType === 'remove') {
      finalAmount = Math.max(0, user.credits_remaining - finalAmount);
    }

    const success = await onUpdateCredits(user.user_id, finalAmount, transactionType, reason);
    
    if (success) {
      setAmount('');
      setReason('');
      onOpenChange(false);
    }
    
    setLoading(false);
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'add': return 'Adição';
      case 'remove': return 'Remoção';
      case 'set': return 'Definição';
      default: return type;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'add': return 'bg-green-500';
      case 'remove': return 'bg-gray-500';
      case 'set': return 'bg-gray-600';
      default: return 'bg-gray-500';
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Créditos</DialogTitle>
          <DialogDescription>
            {user.first_name} {user.last_name} - Créditos atuais: {user.credits_remaining}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="transactionType">Tipo de Operação</Label>
                <Select value={transactionType} onValueChange={(value: 'add' | 'remove' | 'set') => setTransactionType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Adicionar Créditos</SelectItem>
                    <SelectItem value="remove">Remover Créditos</SelectItem>
                    <SelectItem value="set">Definir Quantidade</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">
                  {transactionType === 'set' ? 'Nova Quantidade' : 'Quantidade'}
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Digite a quantidade"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="reason">Motivo (Opcional)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Descreva o motivo da alteração..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || !amount}>
                {loading ? 'Atualizando...' : 'Atualizar Créditos'}
              </Button>
            </DialogFooter>
          </form>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma transação encontrada.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getTransactionTypeColor(transaction.transaction_type)}>
                            {getTransactionTypeLabel(transaction.transaction_type)}
                          </Badge>
                          <span className="font-medium">
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {transaction.previous_balance} → {transaction.new_balance} créditos
                        </p>
                        {transaction.reason && (
                          <p className="text-sm text-muted-foreground">{transaction.reason}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transaction.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
