
import React from 'react';
import { Bell, Clock, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Notification } from '@/hooks/use-notifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'payment_update':
        return <CreditCard className="h-5 w-5 text-blue-400" />;
      case 'invoice_overdue':
        return <Clock className="h-5 w-5 text-amber-400" />;
      case 'low_credits':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'subscription_update':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: ptBR 
      });
    } catch (e) {
      return 'Data inválida';
    }
  };

  return (
    <div 
      className={cn(
        "p-4 flex items-start gap-3 border-b border-border hover:bg-accent/5 transition-colors cursor-pointer",
        !notification.read && "bg-accent/10"
      )}
      onClick={() => onMarkAsRead(notification.id)}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      
      <div className="flex-grow">
        <h4 className={cn(
          "text-sm font-medium",
          !notification.read && "font-semibold"
        )}>
          {notification.title}
        </h4>
        <p className="text-sm text-muted-foreground mt-1">{notification.content}</p>
        <p className="text-xs text-muted-foreground mt-1">{formatDate(notification.created_at)}</p>
      </div>
      
      {!notification.read && (
        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></span>
      )}
    </div>
  );
}
