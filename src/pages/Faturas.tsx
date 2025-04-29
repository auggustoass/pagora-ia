
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { InvoiceTable } from '@/components/dashboard/InvoiceTable';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InvoiceForm } from '@/components/forms/InvoiceForm';
import { InvoiceEditForm } from '@/components/forms/InvoiceEditForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Faturas = () => {
  const [newInvoiceDialogOpen, setNewInvoiceDialogOpen] = useState(false);
  const [editInvoiceDialogOpen, setEditInvoiceDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const handleNewInvoiceSuccess = () => {
    setNewInvoiceDialogOpen(false);
  };

  const handleEditInvoiceSuccess = () => {
    setEditInvoiceDialogOpen(false);
    setSelectedInvoiceId(null);
  };

  const handleEditInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setEditInvoiceDialogOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-glow">
              <span className="text-gradient">Faturas</span>
            </h1>
            <p className="text-muted-foreground mt-1">Visualize e gerencie todas as suas faturas.</p>
          </div>
          
          <Dialog open={newInvoiceDialogOpen} onOpenChange={setNewInvoiceDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pagora-orange to-pagora-orange/80 hover:opacity-90 btn-hover-fx">
                <Plus className="w-4 h-4 mr-2" />
                Gerar Fatura
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-pagora-dark border-white/10">
              <DialogHeader>
                <DialogTitle>Gerar Nova Fatura</DialogTitle>
              </DialogHeader>
              <InvoiceForm onSuccess={handleNewInvoiceSuccess} />
            </DialogContent>
          </Dialog>
        </div>
        
        <InvoiceTable onEditInvoice={handleEditInvoice} />
      </div>
      
      {/* Edit Invoice Dialog */}
      <Dialog open={editInvoiceDialogOpen} onOpenChange={setEditInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-pagora-dark border-white/10">
          <DialogHeader>
            <DialogTitle>Editar Fatura</DialogTitle>
          </DialogHeader>
          {selectedInvoiceId && (
            <InvoiceEditForm 
              invoiceId={selectedInvoiceId} 
              onSuccess={handleEditInvoiceSuccess} 
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Faturas;
