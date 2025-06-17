import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTask, Label } from './TaskContext';
import { Tag, Plus, Check, X } from 'lucide-react';

interface AddLabelModalProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
}

const LABEL_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // yellow
  '#10b981', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#6b7280', // gray
];

const PREDEFINED_LABELS: Label[] = [
  { id: 'label-urgent', name: 'Urgente', color: '#ef4444' },
  { id: 'label-bug', name: 'Bug', color: '#f97316' },
  { id: 'label-feature', name: 'Feature', color: '#10b981' },
  { id: 'label-frontend', name: 'Frontend', color: '#3b82f6' },
  { id: 'label-backend', name: 'Backend', color: '#8b5cf6' },
  { id: 'label-design', name: 'Design', color: '#ec4899' },
  { id: 'label-docs', name: 'Documentação', color: '#6b7280' },
];

export function AddLabelModal({ taskId, isOpen, onClose }: AddLabelModalProps) {
  const { tasks, updateTask } = useTask();
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[0]);
  
  const task = tasks[taskId];
  const currentLabelIds = task?.labels.map(l => l.id) || [];

  const handleAddExistingLabel = (label: Label) => {
    if (!task || currentLabelIds.includes(label.id)) return;
    
    updateTask(taskId, {
      labels: [...task.labels, label]
    });
  };

  const handleRemoveLabel = (labelId: string) => {
    if (!task) return;
    
    updateTask(taskId, {
      labels: task.labels.filter(l => l.id !== labelId)
    });
  };

  const handleCreateLabel = () => {
    if (!newLabelName.trim() || !task) return;
    
    const newLabel: Label = {
      id: `label-${Date.now()}`,
      name: newLabelName.trim(),
      color: selectedColor
    };
    
    updateTask(taskId, {
      labels: [...task.labels, newLabel]
    });
    
    setNewLabelName('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#1a1a1a] border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Tag size={20} />
            Gerenciar Etiquetas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create new label */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300">Criar Nova Etiqueta</h4>
            
            <Input
              placeholder="Nome da etiqueta..."
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              className="bg-[#2a2a2a] border-gray-700 text-white"
            />
            
            <div className="flex flex-wrap gap-2">
              {LABEL_COLORS.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded-full border-2 ${
                    selectedColor === color ? 'border-white' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
            
            <Button
              size="sm"
              onClick={handleCreateLabel}
              disabled={!newLabelName.trim()}
              className="w-full"
            >
              <Plus size={14} className="mr-1" />
              Criar Etiqueta
            </Button>
          </div>

          {/* Existing labels */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300">Etiquetas Disponíveis</h4>
            
            <div className="max-h-40 overflow-y-auto space-y-2">
              {PREDEFINED_LABELS.map((label) => {
                const isAdded = currentLabelIds.includes(label.id);
                
                return (
                  <div
                    key={label.id}
                    className="flex items-center gap-2 p-2 bg-[#2a2a2a] rounded border border-gray-700"
                  >
                    <Badge
                      className="flex-1 text-xs"
                      style={{ backgroundColor: label.color }}
                    >
                      {label.name}
                    </Badge>
                    
                    <Button
                      size="sm"
                      variant={isAdded ? "destructive" : "ghost"}
                      onClick={() => isAdded ? handleRemoveLabel(label.id) : handleAddExistingLabel(label)}
                    >
                      {isAdded ? <X size={12} /> : <Plus size={12} />}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          <Button onClick={onClose} className="w-full">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
