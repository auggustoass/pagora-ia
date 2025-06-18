
import React, { useState } from 'react';
import { Task, useTask } from './TaskContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { CoverImageUpload } from './CoverImageUpload';
import { AddMemberModal } from './AddMemberModal';
import { AddLabelModal } from './AddLabelModal';
import { DatePickerModal } from './DatePickerModal';
import { FileUploadModal } from './FileUploadModal';
import {
  X,
  Calendar,
  User,
  Tag,
  Paperclip,
  MessageSquare,
  CheckSquare,
  Plus,
  Send,
  Download,
  Trash2,
  Image,
  Edit3,
  Archive
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createLocalDate } from '@/utils/date';

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskModal({ task, isOpen, onClose }: TaskModalProps) {
  const { updateTask, addComment, addChecklistItem, toggleChecklistItem, archiveTask, unarchiveTask } = useTask();
  const [newComment, setNewComment] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingCover, setEditingCover] = useState(false);
  const [description, setDescription] = useState(task.description);
  
  // Modal states
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);

  const handleSaveDescription = () => {
    updateTask(task.id, { description });
    setEditingDescription(false);
  };

  const handleCoverImageSelect = (imageUrl: string) => {
    updateTask(task.id, { coverImage: imageUrl });
    setEditingCover(false);
  };

  const handleCoverImageRemove = () => {
    updateTask(task.id, { coverImage: undefined });
    setEditingCover(false);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(task.id, newComment);
      setNewComment('');
    }
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      addChecklistItem(task.id, newChecklistItem);
      setNewChecklistItem('');
    }
  };

  const handleFocusChecklistInput = () => {
    setNewChecklistItem('');
    setTimeout(() => {
      const input = document.querySelector<HTMLInputElement>('input[placeholder="Adicionar item à checklist..."]');
      input?.focus();
    }, 100);
  };

  const completedChecklist = task.checklist.filter(item => item.completed).length;
  const totalChecklist = task.checklist.length;
  const progressPercentage = totalChecklist > 0 ? (completedChecklist / totalChecklist) * 100 : 0;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleArchiveTask = () => {
    if (task.archived) {
      unarchiveTask(task.id);
    } else {
      archiveTask(task.id);
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1a1a1a] border-gray-800">
          <DialogHeader className="pb-0">
            <div className="flex items-start gap-4">
              {/* Cover Image Section with Edit - Fixed height 112px */}
              <div className="w-full mb-4">
                {task.coverImage ? (
                  <div className="relative group">
                    <img
                      src={task.coverImage}
                      alt="Task cover"
                      className="w-full h-[112px] max-w-[370px] mx-auto rounded-lg overflow-hidden object-cover transition-all group-hover:brightness-75"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white hover:bg-black/70"
                      onClick={() => setEditingCover(true)}
                    >
                      <Edit3 size={14} className="mr-1" />
                      Editar
                    </Button>
                  </div>
                ) : (
                  <div className="w-full h-[112px] max-w-[370px] mx-auto rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center hover:border-gray-600 transition-colors">
                    <Button
                      variant="ghost"
                      className="text-gray-400 hover:text-gray-300"
                      onClick={() => setEditingCover(true)}
                    >
                      <Image size={24} className="mr-2" />
                      Adicionar Capa
                    </Button>
                  </div>
                )}

                {/* Cover editing panel */}
                {editingCover && (
                  <div className="mt-4 p-4 bg-[#2a2a2a] rounded-lg border border-gray-700">
                    <CoverImageUpload
                      currentImage={task.coverImage}
                      onImageSelect={handleCoverImageSelect}
                      onImageRemove={handleCoverImageRemove}
                    />
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingCover(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <DialogTitle className="text-xl font-bold text-white text-left flex items-center gap-2">
              {task.title}
              {task.archived && (
                <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                  <Archive size={12} className="mr-1" />
                  Arquivada
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Labels */}
              {task.labels.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <Tag size={16} />
                    Etiquetas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {task.labels.map((label) => (
                      <Badge
                        key={label.id}
                        className="text-xs"
                        style={{ backgroundColor: label.color }}
                      >
                        {label.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Descrição</h3>
                {editingDescription ? (
                  <div className="space-y-2">
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-[#2a2a2a] border-gray-700 text-white"
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveDescription}>
                        Salvar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingDescription(false);
                          setDescription(task.description);
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="bg-[#2a2a2a] p-3 rounded-lg border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors"
                    onClick={() => setEditingDescription(true)}
                  >
                    <p className="text-gray-300 text-sm">
                      {task.description || 'Clique para adicionar uma descrição...'}
                    </p>
                  </div>
                )}
              </div>

              {/* Checklist */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckSquare size={16} className="text-gray-300" />
                  <h3 className="text-sm font-semibold text-gray-300">
                    Checklist {totalChecklist > 0 && `(${completedChecklist}/${totalChecklist})`}
                  </h3>
                </div>
                
                {totalChecklist > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{Math.round(progressPercentage)}%</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2 mb-3">
                  {task.checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 bg-[#2a2a2a] rounded border border-gray-700">
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => toggleChecklistItem(task.id, item.id)}
                      />
                      <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Adicionar item à checklist..."
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                    className="bg-[#2a2a2a] border-gray-700 text-white"
                  />
                  <Button size="sm" onClick={handleAddChecklistItem}>
                    <Plus size={16} />
                  </Button>
                </div>
              </div>

              {/* Attachments */}
              {task.attachments.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <Paperclip size={16} />
                    Anexos
                  </h3>
                  <div className="space-y-2">
                    {task.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center gap-3 p-3 bg-[#2a2a2a] rounded border border-gray-700">
                        <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
                          <Paperclip size={16} className="text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium">{attachment.name}</p>
                          <p className="text-xs text-gray-400">
                            {attachment.size && formatFileSize(attachment.size)} • 
                            {format(createLocalDate(attachment.uploadedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost">
                            <Download size={14} />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activities */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <MessageSquare size={16} />
                  Atividades
                </h3>
                
                <div className="space-y-3 mb-4">
                  {task.activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback className="text-xs bg-gray-700 text-gray-300">
                          {activity.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-[#2a2a2a] p-3 rounded border border-gray-700">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-white">{activity.user.name}</span>
                            <span className="text-xs text-gray-400">
                              {format(createLocalDate(activity.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">{activity.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-gray-700 text-gray-300">
                      U
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="Escrever um comentário..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                      className="bg-[#2a2a2a] border-gray-700 text-white"
                    />
                    <Button size="sm" onClick={handleAddComment}>
                      <Send size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Due Date */}
              {task.dueDate && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <Calendar size={16} />
                    Data de Vencimento
                  </h3>
                  <div className="bg-[#2a2a2a] p-3 rounded border border-gray-700">
                    <p className="text-sm text-white">
                      {format(createLocalDate(task.dueDate), 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              )}

              {/* Members */}
              {task.members.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <User size={16} />
                    Membros
                  </h3>
                  <div className="space-y-2">
                    {task.members.map((member) => (
                      <div key={member.id} className="flex items-center gap-2 p-2 bg-[#2a2a2a] rounded border border-gray-700">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="text-xs bg-gray-700 text-gray-300">
                            {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm text-white font-medium">{member.name}</p>
                          <p className="text-xs text-gray-400">{member.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Ações</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start bg-[#2a2a2a] border-gray-700"
                    onClick={() => setEditingCover(true)}
                  >
                    <Image size={14} className="mr-2" />
                    {task.coverImage ? 'Alterar Capa' : 'Adicionar Capa'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start bg-[#2a2a2a] border-gray-700"
                    onClick={() => setIsMemberModalOpen(true)}
                  >
                    <User size={14} className="mr-2" />
                    Adicionar Membros
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start bg-[#2a2a2a] border-gray-700"
                    onClick={() => setIsLabelModalOpen(true)}
                  >
                    <Tag size={14} className="mr-2" />
                    Adicionar Etiquetas
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start bg-[#2a2a2a] border-gray-700"
                    onClick={() => setIsFileModalOpen(true)}
                  >
                    <Paperclip size={14} className="mr-2" />
                    Adicionar Anexo
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start bg-[#2a2a2a] border-gray-700"
                    onClick={() => setIsDateModalOpen(true)}
                  >
                    <Calendar size={14} className="mr-2" />
                    Definir Data
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start bg-[#2a2a2a] border-gray-700"
                    onClick={handleFocusChecklistInput}
                  >
                    <CheckSquare size={14} className="mr-2" />
                    Adicionar Checklist
                  </Button>
                  
                  {/* Archive/Unarchive Button */}
                  <div className="pt-2 border-t border-gray-700">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`w-full justify-start ${
                        task.archived 
                          ? 'bg-green-900/20 border-green-700 text-green-400 hover:bg-green-900/30' 
                          : 'bg-orange-900/20 border-orange-700 text-orange-400 hover:bg-orange-900/30'
                      }`}
                      onClick={handleArchiveTask}
                    >
                      <Archive size={14} className="mr-2" />
                      {task.archived ? 'Desarquivar Tarefa' : 'Arquivar Tarefa'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modais de Ação */}
      <AddMemberModal
        taskId={task.id}
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
      />
      
      <AddLabelModal
        taskId={task.id}
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
      />
      
      <DatePickerModal
        taskId={task.id}
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
      />
      
      <FileUploadModal
        taskId={task.id}
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
      />
    </>
  );
}
