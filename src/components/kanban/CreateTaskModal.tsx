
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTask } from './TaskContext';
import { CoverImageUpload } from './CoverImageUpload';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultColumnId?: string;
}

export function CreateTaskModal({ isOpen, onClose, defaultColumnId }: CreateTaskModalProps) {
  const { addTask, columns } = useTask();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columnId, setColumnId] = useState(defaultColumnId || 'todo');
  const [coverImage, setCoverImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      addTask({
        title: title.trim(),
        description: description.trim(),
        columnId,
        coverImage: coverImage || undefined,
        labels: [],
        members: [],
        attachments: [],
        activities: [],
        checklist: [],
        position: 0,
        archived: false
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setCoverImage('');
      setColumnId(defaultColumnId || 'todo');
      onClose();
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setCoverImage('');
    setColumnId(defaultColumnId || 'todo');
    onClose();
  };

  const handleImageSelect = (imageUrl: string) => {
    console.log('Image selected in CreateTaskModal:', imageUrl.substring(0, 50) + '...');
    setCoverImage(imageUrl);
  };

  const handleImageRemove = () => {
    console.log('Image removed in CreateTaskModal');
    setCoverImage('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-kanban-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Criar Nova Tarefa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Título da Tarefa *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da tarefa..."
              className="bg-background border-border text-foreground"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Descrição
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a tarefa (opcional)..."
              className="bg-background border-border text-foreground"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Coluna
            </label>
            <Select value={columnId} onValueChange={setColumnId}>
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-kanban-card border-border">
                {Object.values(columns).map((column) => (
                  <SelectItem key={column.id} value={column.id} className="text-foreground">
                    {column.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <CoverImageUpload
              currentImage={coverImage}
              onImageSelect={handleImageSelect}
              onImageRemove={handleImageRemove}
            />
          </div>

          <div className="flex gap-2 pt-4 border-t border-border">
            <Button 
              type="submit" 
              disabled={!title.trim() || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Criando...' : 'Criar Tarefa'}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
