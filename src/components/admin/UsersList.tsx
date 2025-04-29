
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  is_admin: boolean;
}

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
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;
      
      // Then get all user emails from auth (we need to use a custom function or endpoint for this in production)
      // For this demo, we'll simulate with some dummy data
      const { data: roles } = await supabase
        .from('user_roles')
        .select('*');
      
      // Get users with auth data and profiles combined
      const usersWithData = await Promise.all(
        profiles.map(async (profile) => {
          // Check if user is admin
          const isAdmin = roles?.some(role => 
            role.user_id === profile.id && role.role === 'admin'
          ) || false;
          
          return {
            ...profile,
            email: profile.id, // In a real app, we would get this from auth
            is_admin: isAdmin
          };
        })
      );
      
      setUsers(usersWithData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
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
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: currentUser.first_name,
            last_name: currentUser.last_name
          })
          .eq('id', currentUser.id);

        if (profileError) throw profileError;
        
        // Handle admin role
        if (currentUser.is_admin) {
          // First check if already has role
          const { data: existingRole } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('role', 'admin');
          
          if (!existingRole || existingRole.length === 0) {
            // Add admin role
            await supabase
              .from('user_roles')
              .insert({
                user_id: currentUser.id,
                role: 'admin'
              });
          }
        } else {
          // Remove admin role
          await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', currentUser.id)
            .eq('role', 'admin');
        }

        toast.success('User updated successfully');
      } else {
        // In a real app, this would involve creating both auth user and profile
        toast.error('Creating new users via admin is not supported in this demo');
      }

      setDialogOpen(false);
      fetchUsers();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      // In a real app, we would delete the auth user which would cascade to profile
      // Here we'll just delete the profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;

      toast.success('User deleted successfully');
      fetchUsers();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
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
      
      {loading ? (
        <div className="text-center py-4">Carregando...</div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{`${user.first_name || ''} ${user.last_name || ''}`}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell>{user.is_admin ? 'Sim' : 'Não'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleEditUser(user)} 
                          variant="ghost" 
                          size="sm"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDeleteUser(user.id)} 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                  onChange={(e) => setCurrentUser({ ...currentUser, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input 
                  id="lastName" 
                  value={currentUser?.last_name || ''} 
                  onChange={(e) => setCurrentUser({ ...currentUser, last_name: e.target.value })}
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
                  onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                />
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Switch
                id="admin"
                checked={currentUser?.is_admin || false}
                onCheckedChange={(checked) => 
                  setCurrentUser({ ...currentUser, is_admin: checked })
                }
              />
              <Label htmlFor="admin">Admin</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveUser}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
