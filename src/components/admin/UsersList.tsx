
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { UserEditDialog } from './UserEditDialog';
import { UsersTable } from './UsersTable';
import { UsersService } from '@/services/UsersService';
import { User } from '@/types/user';

interface UsersListProps {
  onUpdate?: () => void;
}

export function UsersList({ onUpdate }: UsersListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const usersData = await UsersService.fetchUsers();
      setUsers(usersData);
    } finally {
      setLoading(false);
    }
  }

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleAddUser = () => {
    setCurrentUser({});
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!currentUser) return;

    try {
      if (isEditing && currentUser.id) {
        // Update existing user
        const success = await UsersService.updateUser(currentUser as User);
        if (success) {
          setDialogOpen(false);
          fetchUsers();
          if (onUpdate) onUpdate();
        }
      } else {
        // In a real app, this would involve creating both auth user and profile
        toast.error('Creating new users via admin is not supported in this demo');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    const success = await UsersService.deleteUser(userId);
    if (success) {
      fetchUsers();
      if (onUpdate) onUpdate();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Usuários</h3>
        <Button 
          onClick={handleAddUser}
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Adicionar Usuário
        </Button>
      </div>
      
      <UsersTable 
        users={users}
        loading={loading}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />

      <UserEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currentUser={currentUser}
        isEditing={isEditing}
        onSave={handleSaveUser}
        onUserChange={setCurrentUser}
      />
    </div>
  );
}
