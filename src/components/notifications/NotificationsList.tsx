
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { type Notification } from '@/hooks/use-notifications';
import { AlertCircle, Zap } from 'lucide-react';

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
    return (
      <div className="p-6 text-center">
        <div className="flex items-center justify-center gap-3 text-green-400">
          <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
          <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse delay-150"></div>
          <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse delay-300"></div>
        </div>
        <p className="text-sm text-gray-400 mt-3 font-mono tracking-wider uppercase">
          // LOADING_NOTIFICATIONS...
        </p>
      </div>
    );
  }
  
  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center relative overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        
        <div className="relative">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-500/10 rounded-lg flex items-center justify-center border border-green-500/20">
            <AlertCircle className="w-8 h-8 text-green-400/60" />
          </div>
          
          <h3 className="text-sm font-mono font-bold text-green-400 tracking-wider uppercase mb-2">
            NO_ALERTS_FOUND
          </h3>
          
          <p className="text-xs text-gray-500 font-mono tracking-wide">
            // System_monitoring_active<br/>
            // Notifications_will_appear_here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <ScrollArea className="h-[400px]">
        <div className="relative">
          {/* Background scanning lines */}
          <div className="absolute inset-0 bg-[linear-gradient(transparent_98%,rgba(0,255,65,0.02)_100%)] bg-[length:100%_4px] pointer-events-none"></div>
          
          {notifications.map((notification, index) => (
            <div key={notification.id} className="relative">
              <NotificationItem 
                notification={notification} 
                onMarkAsRead={onMarkAsRead} 
              />
              
              {/* Connection line to next notification */}
              {index < notifications.length - 1 && (
                <div className="absolute left-8 w-px h-2 bg-green-500/20"></div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* Footer com estatísticas */}
      <div className="border-t border-green-500/20 p-3 bg-black/50">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4 font-mono text-gray-500 tracking-wider">
            <span>// TOTAL: {notifications.length}</span>
            <span>// UNREAD: {notifications.filter(n => !n.read).length}</span>
          </div>
          
          <div className="flex items-center gap-1 text-green-400">
            <Zap className="w-3 h-3" />
            <span className="font-mono text-xs tracking-wider uppercase">
              LIVE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
