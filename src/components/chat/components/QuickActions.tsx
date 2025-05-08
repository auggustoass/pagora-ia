
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, FileText, PieChart, RefreshCw, Calculator, CalendarClock } from 'lucide-react';

interface QuickActionsProps {
  setInput: React.Dispatch<React.SetStateAction<string>>;
  inputRef: React.RefObject<HTMLInputElement>;
}

export function QuickActions({ setInput, inputRef }: QuickActionsProps) {
  // Quick action buttons
  const quickActions = [
    { 
      label: 'Novo Cliente', 
      icon: <UserPlus className="h-3 w-3 mr-1" />, 
      action: 'Cadastrar cliente',
      tooltip: 'Iniciar cadastro de um novo cliente' 
    },
    { 
      label: 'Nova Fatura', 
      icon: <FileText className="h-3 w-3 mr-1" />, 
      action: 'Gerar fatura',
      tooltip: 'Criar uma nova fatura para um cliente' 
    },
    { 
      label: 'Relatório', 
      icon: <PieChart className="h-3 w-3 mr-1" />, 
      action: 'Gerar relatório',
      tooltip: 'Gerar um relatório financeiro' 
    },
    { 
      label: 'Previsão', 
      icon: <RefreshCw className="h-3 w-3 mr-1" />, 
      action: 'Fazer previsão de faturamento',
      tooltip: 'Criar uma previsão de faturamento futuro' 
    },
    { 
      label: 'Análise', 
      icon: <Calculator className="h-3 w-3 mr-1" />, 
      action: 'Analisar faturas em atraso',
      tooltip: 'Analisar faturas com pagamento em atraso' 
    },
    { 
      label: 'Histórico', 
      icon: <CalendarClock className="h-3 w-3 mr-1" />, 
      action: 'Gerar histórico de cliente',
      tooltip: 'Ver histórico completo de um cliente' 
    }
  ];

  return (
    <div className="flex flex-row gap-1 mb-2 flex-wrap">
      {quickActions.map((action, index) => (
        <Button 
          key={index}
          variant="outline" 
          size="sm"
          className="text-xs mb-1"
          onClick={() => {
            setInput(action.action);
            setTimeout(() => {
              if (inputRef.current) {
                inputRef.current.focus();
              }
            }, 10);
          }}
          title={action.tooltip}
        >
          {action.icon} {action.label}
        </Button>
      ))}
    </div>
  );
}
