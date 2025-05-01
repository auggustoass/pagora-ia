
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { UserEditDialog } from './UserEditDialog';
import { UsersTable } from './UsersTable';
import { UsersService } from '@/services/UsersService';
import { User, UserFilters } from '@/types/user';

interface UsersListProps {
  onUpdate?: () => void;
}

export function UsersList({ onUpdate }: UsersListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: null
  });
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  async function fetchUsers() {
    setLoading(true);
    try {
      const usersData = await UsersService.fetchUsers(filters);
      setUsers(usersData);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchInput }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRoleFilterChange = (value: string) => {
    setFilters(prev => ({ ...prev, role: value === 'all' ? null : value }));
  };

  const handleClearFilters = () => {
    setFilters({ search: '', role: null });
    setSearchInput('');
  };

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
      
      <div className="mb-4 flex flex-col md:flex-row gap-3">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Buscar por nome, email ou WhatsApp"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <Button onClick={handleSearch} variant="secondary">
            Buscar
          </Button>
        </div>
        
        <div className="flex gap-2 md:w-1/3">
          <Select 
            value={filters.role || 'all'} 
            onValueChange={handleRoleFilterChange}
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Perfil</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="admin">Administradores</SelectItem>
              <SelectItem value="user">Usuários</SelectItem>
            </SelectContent>
          </Select>
          
          {(filters.search || filters.role) && (
            <Button onClick={handleClearFilters} variant="outline">
              Limpar
            </Button>
          )}
        </div>
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
