
import React from 'react';
import { Bell, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { NotificationsList } from '@/components/notifications/NotificationsList';
import { useNotifications } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';

export function NotificationsDropdown() {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="group relative text-gray-400 hover:text-white bg-black border border-green-500/20 hover:border-green-400/40 rounded-lg h-9 w-9 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20 overflow-hidden"
        >
          {/* Scan line effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          <Bell size={18} className="relative" />
          
          {unreadCount > 0 && (
            <>
              {/* Badge principal */}
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-black bg-green-400 rounded-full px-1 animate-pulse font-mono">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
              
              {/* Glow effect para o badge */}
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] bg-green-400/30 rounded-full blur-sm animate-pulse"></span>
              
              {/* Pulse ring */}
              <div className="absolute -top-1 -right-1 w-[18px] h-[18px] border-2 border-green-400/50 rounded-full animate-ping"></div>
            </>
          )}
          
          {/* Corner cuts */}
          <div className="absolute top-0 left-0 w-1 h-1 bg-black transform rotate-45 -translate-x-0.5 -translate-y-0.5"></div>
          <div className="absolute top-0 right-0 w-1 h-1 bg-black transform rotate-45 translate-x-0.5 -translate-y-0.5"></div>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 p-0 bg-black border border-green-500/30 backdrop-blur-xl shadow-2xl shadow-green-400/10" 
        align="end"
      >
        {/* Header cyberpunk */}
        <div className="relative overflow-hidden border-b border-green-500/20 bg-gradient-to-r from-green-500/5 to-transparent">
          {/* Background grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          
          <div className="relative p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                <Zap className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <h3 className="text-sm font-mono font-bold text-green-400 tracking-wider uppercase">
                  SYSTEM_ALERTS
                </h3>
                <p className="text-xs text-gray-500 font-mono">
                  // {unreadCount} unread_notifications
                </p>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-7 hover:text-green-400 text-gray-400 font-mono tracking-wider uppercase border border-green-500/20 hover:border-green-400/40 hover:bg-green-500/10"
                onClick={markAllAsRead}
              >
                CLEAR_ALL
              </Button>
            )}
          </div>
          
          {/* Bottom scan line */}
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent"></div>
        </div>
        
        <NotificationsList
          notifications={notifications}
          loading={loading}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
        />
      </PopoverContent>
    </Popover>
  );
}
