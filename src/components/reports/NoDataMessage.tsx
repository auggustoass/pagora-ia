
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { subMonths } from 'date-fns';
import { toast } from 'sonner';

interface NoDataMessageProps {
  message?: string;
  onExpandPeriod?: () => void;
}

export const NoDataMessage: React.FC<NoDataMessageProps> = ({ 
  message = "Não há dados para o período selecionado",
  onExpandPeriod
}) => (
  <div className="flex flex-col justify-center items-center h-64 text-center p-4">
    <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
    <p className="text-muted-foreground">{message}</p>
    {onExpandPeriod && (
      <Button 
        className="mt-4" 
        variant="outline"
        onClick={onExpandPeriod}
      >
        Expandir período (12 meses)
      </Button>
    )}
  </div>
);
