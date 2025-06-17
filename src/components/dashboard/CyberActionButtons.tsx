
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus, FileText } from 'lucide-react';
import { ClientForm } from '../forms/ClientForm';
import { InvoiceForm } from '../forms/InvoiceForm';

interface CyberActionButtonsProps {
  onQuickInvoiceSuccess: () => void;
}

export function CyberActionButtons({ onQuickInvoiceSuccess }: CyberActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="group relative overflow-hidden bg-black border border-green-500/30 text-green-400 hover:text-white hover:border-green-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/25 font-mono tracking-wider uppercase text-xs h-12 px-6">
            {/* Scan line effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <UserPlus className="w-4 h-4 mr-2 relative z-10" />
            <span className="relative z-10">NEW_CLIENT</span>
            
            {/* Corner cuts */}
            <div className="absolute top-0 left-0 w-2 h-2 bg-black transform rotate-45 -translate-x-1 -translate-y-1"></div>
            <div className="absolute top-0 right-0 w-2 h-2 bg-black transform rotate-45 translate-x-1 -translate-y-1"></div>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-black border border-green-500/30 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-green-400 font-mono tracking-wider">NEW_CLIENT_PROTOCOL</DialogTitle>
          </DialogHeader>
          <ClientForm />
        </DialogContent>
      </Dialog>
      
      <Dialog>
        <DialogTrigger asChild>
          <Button className="group relative overflow-hidden bg-black border border-green-500/30 text-green-400 hover:text-white hover:border-green-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/25 font-mono tracking-wider uppercase text-xs h-12 px-6">
            {/* Scan line effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <FileText className="w-4 h-4 mr-2 relative z-10" />
            <span className="relative z-10">GEN_INVOICE</span>
            
            {/* Corner cuts */}
            <div className="absolute top-0 left-0 w-2 h-2 bg-black transform rotate-45 -translate-x-1 -translate-y-1"></div>
            <div className="absolute top-0 right-0 w-2 h-2 bg-black transform rotate-45 translate-x-1 -translate-y-1"></div>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-black border border-green-500/30 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-green-400 font-mono tracking-wider">INVOICE_GENERATION_PROTOCOL</DialogTitle>
          </DialogHeader>
          <InvoiceForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}
