
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, CreditCard, ExternalLink } from 'lucide-react';

interface InvoiceActionsProps {
  invoiceId: string;
  paymentUrl?: string | null;
  onEdit: (invoiceId: string) => void;
  onGeneratePayment: (invoiceId: string) => void;
  isGeneratingPayment?: boolean;
}

export const InvoiceActions: React.FC<InvoiceActionsProps> = ({
  invoiceId,
  paymentUrl,
  onEdit,
  onGeneratePayment,
  isGeneratingPayment = false
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* Payment Action */}
      <div>
        {paymentUrl ? (
          <a 
            href={paymentUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Abrir link
          </a>
        ) : (
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs border-white/20 bg-white/5 hover:bg-white/10 text-white"
            onClick={() => onGeneratePayment(invoiceId)}
            disabled={isGeneratingPayment}
          >
            <CreditCard className="w-3 h-3 mr-1" />
            {isGeneratingPayment ? 'Gerando...' : 'Gerar link'}
          </Button>
        )}
      </div>

      {/* Edit Action */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
        onClick={() => onEdit(invoiceId)}
      >
        <Edit className="w-4 h-4 mr-1" />
        Editar
      </Button>
    </div>
  );
};
