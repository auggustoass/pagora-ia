
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTask, Member } from './TaskContext';
import { User, Plus, Check } from 'lucide-react';

interface AddMemberModalProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_MEMBERS: Member[] = [
  {
    id: 'user-1',
    name: 'João Silva',
    email: 'joao@hblackpix.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
  },
  {
    id: 'user-2',
    name: 'Maria Santos',
    email: 'maria@hblackpix.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b04c?w=40&h=40&fit=crop&crop=face'
  },
  {
    id: 'user-3',
    name: 'Pedro Costa',
    email: 'pedro@hblackpix.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
  },
  {
    id: 'user-4',
    name: 'Ana Oliveira',
    email: 'ana@hblackpix.com'
  },
  {
    id: 'user-5',
    name: 'Carlos Lima',
    email: 'carlos@hblackpix.com'
  }
];

export function AddMemberModal({ taskId, isOpen, onClose }: AddMemberModalProps) {
  const { tasks, updateTask } = useTask();
  const [searchTerm, setSearchTerm] = useState('');
  
  const task = tasks[taskId];
  const currentMemberIds = task?.members.map(m => m.id) || [];
  
  const filteredMembers = AVAILABLE_MEMBERS.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMember = (member: Member) => {
    if (!task || currentMemberIds.includes(member.id)) return;
    
    updateTask(taskId, {
      members: [...task.members, member]
    });
  };

  const handleRemoveMember = (memberId: string) => {
    if (!task) return;
    
    updateTask(taskId, {
      members: task.members.filter(m => m.id !== memberId)
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#1a1a1a] border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <User size={20} />
            Gerenciar Membros
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Buscar membros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#2a2a2a] border-gray-700 text-white"
          />

          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredMembers.map((member) => {
              const isAdded = currentMemberIds.includes(member.id);
              
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-2 bg-[#2a2a2a] rounded border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-xs bg-gray-700 text-gray-300">
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{member.name}</p>
                    <p className="text-xs text-gray-400">{member.email}</p>
                  </div>
                  
                  <Button
                    size="sm"
                    variant={isAdded ? "destructive" : "default"}
                    onClick={() => isAdded ? handleRemoveMember(member.id) : handleAddMember(member)}
                  >
                    {isAdded ? <Check size={14} /> : <Plus size={14} />}
                  </Button>
                </div>
              );
            })}
          </div>

          <Button onClick={onClose} className="w-full">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
