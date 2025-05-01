
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User } from '@/types/user';

interface UserEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: Partial<User> | null;
  isEditing: boolean;
  onSave: () => void;
  onUserChange: (user: Partial<User>) => void;
}

export function UserEditDialog({
  open,
  onOpenChange,
  currentUser,
  isEditing,
  onSave,
  onUserChange,
}: UserEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Usuário' : 'Adicionar Usuário'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Edite os detalhes do usuário abaixo.' 
              : 'Preencha os detalhes para adicionar um novo usuário.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nome</Label>
              <Input 
                id="firstName" 
                value={currentUser?.first_name || ''} 
                onChange={(e) => onUserChange({ ...currentUser, first_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Sobrenome</Label>
              <Input 
                id="lastName" 
                value={currentUser?.last_name || ''} 
                onChange={(e) => onUserChange({ ...currentUser, last_name: e.target.value })}
              />
            </div>
          </div>
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                value={currentUser?.email || ''} 
                onChange={(e) => onUserChange({ ...currentUser, email: e.target.value })}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="phone">WhatsApp</Label>
            <Input 
              id="phone" 
              type="tel"
              value={currentUser?.phone || ''} 
              onChange={(e) => onUserChange({ ...currentUser, phone: e.target.value })}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="admin"
              checked={currentUser?.is_admin || false}
              onCheckedChange={(checked) => 
                onUserChange({ ...currentUser, is_admin: checked })
              }
            />
            <Label htmlFor="admin">Admin</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
