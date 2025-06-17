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
import { Plus, X } from 'lucide-react';

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
      <DialogContent className="max-w-2xl bg-[#1a1a1a] border-gray-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Criar Nova Tarefa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Título da Tarefa *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da tarefa..."
              className="bg-[#2a2a2a] border-gray-700 text-white"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Descrição
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a tarefa (opcional)..."
              className="bg-[#2a2a2a] border-gray-700 text-white"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Coluna
            </label>
            <Select value={columnId} onValueChange={setColumnId}>
              <SelectTrigger className="bg-[#2a2a2a] border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#2a2a2a] border-gray-700">
                {Object.values(columns).map((column) => (
                  <SelectItem key={column.id} value={column.id} className="text-white">
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

          <div className="flex gap-2 pt-4 border-t border-gray-700">
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
              className="text-gray-400 hover:text-gray-300"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
