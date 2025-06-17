
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { OptimizedInvoiceTable } from '@/components/dashboard/OptimizedInvoiceTable';
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
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Cyber background effects */}
        <div className="absolute inset-0 bg-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(0,255,65,0.05)_0%,transparent_25%),radial-gradient(circle_at_75%_75%,rgba(0,255,65,0.05)_0%,transparent_25%)]"></div>
        
        {/* Scan lines overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_98%,rgba(0,255,65,0.03)_100%)] bg-[length:100%_4px] animate-pulse pointer-events-none"></div>
        
        <div className="relative z-10 space-y-8 animate-fade-in p-6">
          {/* Header Section */}
          <div className="relative">
            {/* Background grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50"></div>
            
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 py-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {/* Holographic accent */}
                  <div className="w-1 h-16 bg-gradient-to-b from-green-400 via-green-500 to-transparent rounded-full animate-pulse"></div>
                  
                  <div>
                    <h1 className="text-4xl font-mono font-bold text-white tracking-wider relative">
                      INVOICE_SYSTEM
                      
                      {/* Text glow effect */}
                      <div className="absolute inset-0 text-4xl font-mono font-bold text-green-400 opacity-30 blur-sm animate-pulse">
                        INVOICE_SYSTEM
                      </div>
                      
                      {/* Underline effect */}
                      <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-green-400 via-transparent to-green-400 animate-pulse"></div>
                    </h1>
                    
                    <p className="text-sm font-mono text-gray-400 tracking-widest uppercase mt-2">
                      // OPTIMIZED_PERFORMANCE_V3.0
                    </p>
                  </div>
                </div>
              </div>
              
              <Dialog open={newInvoiceDialogOpen} onOpenChange={setNewInvoiceDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="group relative overflow-hidden bg-black border border-green-500/30 text-green-400 hover:text-white hover:border-green-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/25 font-mono tracking-wider uppercase text-sm h-12 px-8">
                    {/* Scan line effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    <Plus className="w-4 h-4 mr-2 relative z-10" />
                    <span className="relative z-10">GEN_INVOICE</span>
                    
                    {/* Corner cuts */}
                    <div className="absolute top-0 left-0 w-2 h-2 bg-black transform rotate-45 -translate-x-1 -translate-y-1"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 bg-black transform rotate-45 translate-x-1 -translate-y-1"></div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-black border border-green-500/30 backdrop-blur-xl">
                  <DialogHeader>
                    <DialogTitle className="text-green-400 font-mono tracking-wider">NEW_INVOICE_PROTOCOL</DialogTitle>
                  </DialogHeader>
                  <InvoiceForm onSuccess={handleNewInvoiceSuccess} />
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Bottom scan line */}
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent"></div>
          </div>
          
          {/* Optimized Table Section */}
          <div className="relative">
            {/* Background grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            
            <div className="relative">
              <OptimizedInvoiceTable onEditInvoice={handleEditInvoice} />
            </div>
          </div>
        </div>
        
        {/* Corner accents */}
        <div className="fixed top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-green-400/20 pointer-events-none"></div>
        <div className="fixed top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-green-400/20 pointer-events-none"></div>
        <div className="fixed bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-green-400/20 pointer-events-none"></div>
        <div className="fixed bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-green-400/20 pointer-events-none"></div>
      </div>
      
      {/* Edit Invoice Dialog */}
      <Dialog open={editInvoiceDialogOpen} onOpenChange={setEditInvoiceDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-black border border-green-500/30 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-green-400 font-mono tracking-wider">EDIT_INVOICE_PROTOCOL</DialogTitle>
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
