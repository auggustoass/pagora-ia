
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, FileText } from 'lucide-react';
import { ClientForm } from '../forms/ClientForm';
import { InvoiceForm } from '../forms/InvoiceForm';

interface ActionButtonsProps {
  onQuickInvoiceSuccess: () => void;
}

export function ActionButtons({ onQuickInvoiceSuccess }: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="group relative overflow-hidden bg-gradient-to-r from-emerald-700 to-green-700 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 transform hover:scale-105 border-0">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <UserPlus className="w-4 h-4 mr-2 relative z-10" />
            <span className="relative z-10 font-medium">Novo Cliente</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-gray-900/95 border border-white/20 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-white">Cadastrar Novo Cliente</DialogTitle>
          </DialogHeader>
          <ClientForm />
        </DialogContent>
      </Dialog>
      
      <Dialog>
        <DialogTrigger asChild>
          <Button className="group relative overflow-hidden bg-gradient-to-r from-green-800 to-emerald-800 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 transform hover:scale-105 border-0">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <FileText className="w-4 h-4 mr-2 relative z-10" />
            <span className="relative z-10 font-medium">Gerar Fatura</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-gray-900/95 border border-white/20 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-white">Gerar Nova Fatura</DialogTitle>
          </DialogHeader>
          <InvoiceForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}
