
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Check, X, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

interface PendingUser {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  created_at: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function PendingUsersList() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get emails for each user
      const usersWithEmails = await Promise.all(
        profiles.map(async (profile) => {
          let email = `user-${profile.id.substring(0, 8)}@example.com`;
          
          // If it's the current user, we know the email
          if (profile.id === user?.id) {
            email = user.email || email;
          }
          
          return {
            ...profile,
            email
          };
        })
      );

      setPendingUsers(usersWithEmails);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      toast.error('Erro ao carregar usuários pendentes');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('approve_user', {
        target_user_id: userId,
        approver_user_id: user?.id
      });

      if (error) throw error;

      toast.success('Usuário aprovado com sucesso');
      fetchPendingUsers();
    } catch (error: any) {
      console.error('Error approving user:', error);
      toast.error(error.message || 'Erro ao aprovar usuário');
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('reject_user', {
        target_user_id: userId,
        rejector_user_id: user?.id
      });

      if (error) throw error;

      toast.success('Usuário rejeitado');
      fetchPendingUsers();
    } catch (error: any) {
      console.error('Error rejecting user:', error);
      toast.error(error.message || 'Erro ao rejeitar usuário');
    }
  };

  const filteredUsers = pendingUsers.filter(user => 
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Usuários Pendentes ({pendingUsers.length})
        </h3>
      </div>
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário pendente'}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((pendingUser) => (
                <TableRow key={pendingUser.id}>
                  <TableCell>
                    {`${pendingUser.first_name || ''} ${pendingUser.last_name || ''}`}
                  </TableCell>
                  <TableCell>{pendingUser.email}</TableCell>
                  <TableCell>{pendingUser.phone || '-'}</TableCell>
                  <TableCell>
                    {format(new Date(pendingUser.created_at), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleApproveUser(pendingUser.id)}
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>
                      <Button 
                        onClick={() => handleRejectUser(pendingUser.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Rejeitar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
