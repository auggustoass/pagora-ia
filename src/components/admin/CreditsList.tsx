
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Settings, Coins } from 'lucide-react';
import { useAdminCredits } from '@/hooks/useAdminCredits';
import { CreditManagementDialog } from './CreditManagementDialog';
import { UserCredit } from '@/services/AdminCreditsService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function CreditsList() {
  const { 
    userCredits, 
    creditTransactions, 
    creditStats, 
    loading, 
    updateUserCredits, 
    fetchCreditTransactions 
  } = useAdminCredits();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserCredit | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredUsers = userCredits.filter(user =>
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleManageCredits = (user: UserCredit) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const getCreditStatusColor = (credits: number) => {
    if (credits === 0) return 'bg-gray-600';
    if (credits < 10) return 'bg-gray-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Carregando créditos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Créditos</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditStats.totalCreditsInCirculation}</div>
            <p className="text-xs text-muted-foreground">Em circulação</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários sem Créditos</CardTitle>
            <Badge variant="secondary">{creditStats.usersWithZeroCredits}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditStats.usersWithZeroCredits}</div>
            <p className="text-xs text-muted-foreground">
              de {creditStats.totalUsers} usuários
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média por Usuário</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {creditStats.totalUsers > 0 
                ? Math.round(creditStats.totalCreditsInCirculation / creditStats.totalUsers)
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">créditos/usuário</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gerenciamento de Créditos dos Usuários</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Créditos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ID: {user.user_id.substring(0, 8)}...
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className="font-bold text-lg">{user.credits_remaining}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCreditStatusColor(user.credits_remaining)}>
                      {user.credits_remaining === 0 ? 'Sem créditos' : 
                       user.credits_remaining < 10 ? 'Poucos créditos' : 'Normal'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManageCredits(user)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Gerenciar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Gerenciamento */}
      <CreditManagementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={selectedUser}
        onUpdateCredits={updateUserCredits}
        transactions={creditTransactions}
        onFetchTransactions={fetchCreditTransactions}
      />
    </div>
  );
}
