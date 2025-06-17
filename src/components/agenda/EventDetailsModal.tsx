
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AgendaEvent } from '@/types/agenda';
import { FileText, CheckSquare, Calendar, User, DollarSign, Clock, Tag } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';

interface EventDetailsModalProps {
  event: AgendaEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailsModal({ event, isOpen, onClose }: EventDetailsModalProps) {
  if (!event) return null;

  const getStatusBadge = () => {
    switch (event.status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Concluído</Badge>;
      case 'overdue':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Vencido</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pendente</Badge>;
    }
  };

  const getPriorityBadge = () => {
    switch (event.priority) {
      case 'high':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Alta</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Média</Badge>;
      default:
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Baixa</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border border-green-500/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-400 font-mono">
            {event.type === 'invoice' ? <FileText className="w-5 h-5" /> : <CheckSquare className="w-5 h-5" />}
            Detalhes do Evento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header com status */}
          <div className="flex items-center gap-2 flex-wrap">
            {getStatusBadge()}
            {getPriorityBadge()}
            <Badge 
              className="bg-blue-500/20 text-blue-400 border-blue-500/30"
              style={{ 
                backgroundColor: `${event.color}20`,
                borderColor: `${event.color}40`,
                color: event.color
              }}
            >
              {event.type === 'invoice' ? 'Fatura' : 'Tarefa'}
            </Badge>
          </div>

          {/* Título */}
          <div>
            <h3 className="text-lg font-mono text-white mb-2">{event.title}</h3>
            {event.description && (
              <p className="text-gray-300 text-sm">{event.description}</p>
            )}
          </div>

          {/* Informações específicas */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-400" />
              <span className="text-sm font-mono text-gray-300">
                {formatDate(event.date)}
              </span>
            </div>

            {event.clientName && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-green-400" />
                <span className="text-sm font-mono text-gray-300">
                  {event.clientName}
                </span>
              </div>
            )}

            {event.amount && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-sm font-mono text-gray-300">
                  {formatCurrency(event.amount)}
                </span>
              </div>
            )}
          </div>

          {/* Dados específicos da tarefa */}
          {event.type === 'task' && event.data && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-green-400" />
                <span className="text-sm font-mono text-green-400">Status da Tarefa</span>
              </div>
              <p className="text-sm text-gray-300 capitalize">
                {event.data.column_id === 'todo' ? 'A Fazer' :
                 event.data.column_id === 'inProgress' ? 'Em Progresso' :
                 event.data.column_id === 'review' ? 'Em Revisão' : 'Concluído'}
              </p>
            </div>
          )}

          {/* Dados específicos da fatura */}
          {event.type === 'invoice' && event.data && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-mono text-blue-400">Informações da Fatura</span>
              </div>
              <div className="space-y-1 text-sm text-gray-300">
                <p>Email: {event.data.email}</p>
                <p>WhatsApp: {event.data.whatsapp}</p>
                <p>CPF/CNPJ: {event.data.cpf_cnpj}</p>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10"
              onClick={onClose}
            >
              Fechar
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-green-500/20 border border-green-500/40 text-green-400 hover:bg-green-500/30"
            >
              Ver Detalhes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
