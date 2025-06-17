
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useTask } from './TaskContext';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DatePickerModalProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DatePickerModal({ taskId, isOpen, onClose }: DatePickerModalProps) {
  const { tasks, updateTask } = useTask();
  const task = tasks[taskId];
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    task?.dueDate ? new Date(task.dueDate) : undefined
  );

  const handleSaveDate = () => {
    if (!task) return;
    
    updateTask(taskId, {
      dueDate: selectedDate?.toISOString()
    });
    
    onClose();
  };

  const handleRemoveDate = () => {
    if (!task) return;
    
    updateTask(taskId, {
      dueDate: undefined
    });
    
    setSelectedDate(undefined);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#1a1a1a] border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <CalendarIcon size={20} />
            Definir Data de Vencimento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {task?.dueDate && (
            <div className="p-3 bg-[#2a2a2a] rounded border border-gray-700">
              <p className="text-sm text-gray-300 mb-2">Data atual:</p>
              <p className="text-white font-medium">
                {format(new Date(task.dueDate), 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
              </p>
            </div>
          )}

          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            className={cn("rounded-md border border-gray-700 bg-[#2a2a2a] p-3 pointer-events-auto")}
          />

          <div className="flex gap-2">
            <Button
              onClick={handleSaveDate}
              disabled={!selectedDate}
              className="flex-1"
            >
              Definir Data
            </Button>
            
            {task?.dueDate && (
              <Button
                variant="destructive"
                onClick={handleRemoveDate}
                className="px-3"
              >
                <X size={16} />
              </Button>
            )}
          </div>

          <Button variant="ghost" onClick={onClose} className="w-full">
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
