
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { User } from '@/types/user';

interface UserItemProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

export function UserItem({ user, onEdit, onDelete }: UserItemProps) {
  return (
    <TableRow key={user.id}>
      <TableCell>{`${user.first_name || ''} ${user.last_name || ''}`}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>{user.phone || '-'}</TableCell>
      <TableCell>
        {user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy') : 'N/A'}
      </TableCell>
      <TableCell>{user.is_admin ? 'Sim' : 'Não'}</TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button 
            onClick={() => onEdit(user)} 
            variant="ghost" 
            size="sm"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            onClick={() => onDelete(user.id)} 
            variant="ghost" 
            size="sm"
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
