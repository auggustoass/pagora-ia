
import React from 'react';
import { 
  Bell, 
  Clock, 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Users, 
  FileText,
  Target,
  UserCheck,
  UserX,
  Link as LinkIcon,
  DollarSign,
  TrendingUp,
  Zap
} from 'lucide-react';
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
      case 'invoice_created':
        return <FileText className="h-5 w-5 text-blue-400" />;
      case 'invoice_paid':
        return <DollarSign className="h-5 w-5 text-green-400" />;
      case 'payment_update':
        return <CreditCard className="h-5 w-5 text-blue-400" />;
      case 'invoice_overdue':
        return <Clock className="h-5 w-5 text-amber-400" />;
      case 'low_credits':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'credits_added':
        return <TrendingUp className="h-5 w-5 text-green-400" />;
      case 'credits_consumed':
        return <Zap className="h-5 w-5 text-orange-400" />;
      case 'client_created':
        return <Users className="h-5 w-5 text-purple-400" />;
      case 'client_updated':
        return <Users className="h-5 w-5 text-blue-400" />;
      case 'task_created':
        return <Target className="h-5 w-5 text-cyan-400" />;
      case 'task_completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'user_approved':
        return <UserCheck className="h-5 w-5 text-green-400" />;
      case 'user_rejected':
        return <UserX className="h-5 w-5 text-red-400" />;
      case 'payment_link_generated':
        return <LinkIcon className="h-5 w-5 text-emerald-400" />;
      case 'subscription_update':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      default:
        return <Bell className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.type) {
      case 'low_credits':
      case 'invoice_overdue':
      case 'user_rejected':
        return 'border-red-500/30 bg-red-500/5';
      case 'invoice_paid':
      case 'credits_added':
      case 'user_approved':
      case 'task_completed':
        return 'border-green-500/30 bg-green-500/5';
      case 'invoice_created':
      case 'client_created':
      case 'task_created':
        return 'border-blue-500/30 bg-blue-500/5';
      case 'payment_link_generated':
        return 'border-emerald-500/30 bg-emerald-500/5';
      default:
        return 'border-gray-500/30 bg-gray-500/5';
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
        "group relative p-4 flex items-start gap-3 border-b border-green-500/10 hover:bg-green-500/5 transition-all duration-300 cursor-pointer overflow-hidden",
        !notification.read && "bg-green-500/10 border-l-2 border-l-green-400",
        getPriorityColor()
      )}
      onClick={() => onMarkAsRead(notification.id)}
    >
      {/* Background scan line effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      
      {/* Icon container with glow */}
      <div className={cn(
        "relative flex-shrink-0 mt-0.5 w-10 h-10 rounded-lg flex items-center justify-center border transition-all duration-300",
        !notification.read 
          ? "border-green-500/40 bg-green-500/20 shadow-lg shadow-green-400/25" 
          : "border-gray-500/30 bg-gray-500/10"
      )}>
        {getIcon()}
        
        {/* Corner cuts */}
        <div className="absolute top-0 left-0 w-2 h-2 bg-black transform rotate-45 -translate-x-1 -translate-y-1"></div>
        <div className="absolute top-0 right-0 w-2 h-2 bg-black transform rotate-45 translate-x-1 -translate-y-1"></div>
      </div>
      
      <div className="relative flex-grow min-w-0">
        <h4 className={cn(
          "text-sm font-mono tracking-wide leading-tight",
          !notification.read 
            ? "font-bold text-white" 
            : "font-medium text-gray-300"
        )}>
          {notification.title}
        </h4>
        
        <p className="text-sm text-gray-400 mt-1 font-mono leading-relaxed">
          {notification.content}
        </p>
        
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500 font-mono tracking-wider uppercase">
            // {formatDate(notification.created_at)}
          </p>
          
          {!notification.read && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50"></span>
              <span className="text-xs text-green-400 font-mono tracking-wider uppercase">
                NEW
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Holographic accent line */}
      <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-green-400/30 to-transparent"></div>
    </div>
  );
}
