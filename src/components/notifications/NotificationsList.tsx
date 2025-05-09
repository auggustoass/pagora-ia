
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { type Notification } from '@/hooks/use-notifications';

interface NotificationsListProps {
  notifications: Notification[];
  loading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationsList({ 
  notifications, 
  loading, 
  onMarkAsRead, 
  onMarkAllAsRead 
}: NotificationsListProps) {
  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">Carregando notificações...</div>;
  }
  
  if (notifications.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">Nenhuma notificação encontrada</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between p-2 border-b border-border">
        <h3 className="text-sm font-medium">Notificações</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs h-7 hover:text-primary"
          onClick={onMarkAllAsRead}
        >
          Marcar todas como lidas
        </Button>
      </div>
      
      <ScrollArea className="h-[300px]">
        {notifications.map((notification) => (
          <NotificationItem 
            key={notification.id} 
            notification={notification} 
            onMarkAsRead={onMarkAsRead} 
          />
        ))}
      </ScrollArea>
    </div>
  );
}
