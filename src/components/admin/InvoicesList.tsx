
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
import { Pencil, Trash2, Eye } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';

interface Invoice {
  id: string;
  nome: string;
  email: string;
  cpf_cnpj: string;
  whatsapp: string;
  descricao: string;
  valor: number;
  status: string;
  vencimento: string;
  created_at: string;
}

export function InvoicesList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Partial<Invoice> | null>(null);
  const [viewMode, setViewMode] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('faturas')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }

  const handleViewInvoice = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setViewMode(true);
    setDialogOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setViewMode(false);
    setDialogOpen(true);
  };

  const handleSaveInvoice = async () => {
    if (!currentInvoice || !currentInvoice.id) return;

    try {
      const { error } = await supabase
        .from('faturas')
        .update({
          nome: currentInvoice.nome,
          email: currentInvoice.email,
          cpf_cnpj: currentInvoice.cpf_cnpj,
          whatsapp: currentInvoice.whatsapp,
          descricao: currentInvoice.descricao,
          valor: currentInvoice.valor,
          status: currentInvoice.status,
          vencimento: currentInvoice.vencimento
        })
        .eq('id', currentInvoice.id);
        
      if (error) throw error;

      toast.success('Fatura atualizada com sucesso');
      setDialogOpen(false);
      fetchInvoices();
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('Erro ao atualizar fatura');
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta fatura?')) return;
    
    try {
      const { error } = await supabase
        .from('faturas')
        .delete()
        .eq('id', invoiceId);
      
      if (error) throw error;

      toast.success('Fatura excluída com sucesso');
      fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Erro ao excluir fatura');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Faturas</h3>
      </div>
      
      {loading ? (
        <div className="text-center py-4">Carregando...</div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Nenhuma fatura encontrada
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.nome}</TableCell>
                    <TableCell>{formatCurrency(invoice.valor)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        invoice.status === 'pago' ? 'bg-green-100 text-green-800' : 
                        invoice.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.vencimento), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.created_at), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleViewInvoice(invoice)} 
                          variant="ghost" 
                          size="sm"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleEditInvoice(invoice)} 
                          variant="ghost" 
                          size="sm"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDeleteInvoice(invoice.id)} 
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
            <DialogTitle>
              {viewMode ? 'Detalhes da Fatura' : 'Editar Fatura'}
            </DialogTitle>
            <DialogDescription>
              {viewMode 
                ? 'Visualize os detalhes da fatura.' 
                : 'Edite os detalhes da fatura abaixo.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input 
                  id="nome" 
                  value={currentInvoice?.nome || ''} 
                  onChange={(e) => setCurrentInvoice({ ...currentInvoice, nome: e.target.value })}
                  readOnly={viewMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
                <Input 
                  id="cpf_cnpj" 
                  value={currentInvoice?.cpf_cnpj || ''} 
                  onChange={(e) => setCurrentInvoice({ ...currentInvoice, cpf_cnpj: e.target.value })}
                  readOnly={viewMode}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={currentInvoice?.email || ''} 
                  onChange={(e) => setCurrentInvoice({ ...currentInvoice, email: e.target.value })}
                  readOnly={viewMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input 
                  id="whatsapp" 
                  value={currentInvoice?.whatsapp || ''} 
                  onChange={(e) => setCurrentInvoice({ ...currentInvoice, whatsapp: e.target.value })}
                  readOnly={viewMode}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea 
                id="descricao" 
                value={currentInvoice?.descricao || ''} 
                onChange={(e) => setCurrentInvoice({ ...currentInvoice, descricao: e.target.value })}
                readOnly={viewMode}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor">Valor</Label>
                <Input 
                  id="valor" 
                  type="number"
                  step="0.01"
                  value={currentInvoice?.valor || ''} 
                  onChange={(e) => setCurrentInvoice({ ...currentInvoice, valor: Number(e.target.value) })}
                  readOnly={viewMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                {viewMode ? (
                  <Input 
                    id="status" 
                    value={currentInvoice?.status || ''} 
                    readOnly
                  />
                ) : (
                  <Select
                    value={currentInvoice?.status || ''}
                    onValueChange={(value) => 
                      setCurrentInvoice({ ...currentInvoice, status: value })
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                      <SelectItem value="vencido">Vencido</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vencimento">Vencimento</Label>
              <Input 
                id="vencimento" 
                type="date"
                value={currentInvoice?.vencimento 
                  ? new Date(currentInvoice.vencimento).toISOString().split('T')[0] 
                  : ''}
                onChange={(e) => 
                  setCurrentInvoice({ 
                    ...currentInvoice, 
                    vencimento: e.target.value
                  })
                }
                readOnly={viewMode}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {viewMode ? 'Fechar' : 'Cancelar'}
            </Button>
            {!viewMode && (
              <Button onClick={handleSaveInvoice}>Salvar</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
