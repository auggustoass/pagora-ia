
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  type: 'payment_update' | 'invoice_overdue' | 'low_credits' | 'subscription_update' | 'invoice_created' | 'invoice_paid' | 'invoice_status_updated' | 'client_created' | 'client_updated' | 'credits_added' | 'credits_consumed' | 'task_created' | 'task_completed' | 'user_approved' | 'user_rejected' | 'payment_link_generated' | string;
  title: string;
  content: string;
  related_id?: string;
  read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50); // Limitar para melhor performance

        if (error) throw error;

        setNotifications(data || []);
        setUnreadCount(data?.filter(n => !n.read).length || 0);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Set up real-time subscription for new notifications
    if (user) {
      const channel = supabase
        .channel('notification-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          }, 
          (payload) => {
            console.log('Notification change detected:', payload);
            fetchNotifications(); // Refresh notifications when changes occur
            
            // Show toast for new notifications
            if (payload.eventType === 'INSERT') {
              const newNotification = payload.new as Notification;
              
              // Toast personalizado baseado no tipo
              switch (newNotification.type) {
                case 'invoice_created':
                  toast.success('💼 ' + newNotification.title, {
                    description: newNotification.content,
                    duration: 6000,
                  });
                  break;
                case 'invoice_paid':
                  toast.success('💰 ' + newNotification.title, {
                    description: newNotification.content,
                    duration: 6000,
                  });
                  break;
                case 'client_created':
                  toast.info('👤 ' + newNotification.title, {
                    description: newNotification.content,
                    duration: 5000,
                  });
                  break;
                case 'low_credits':
                  toast.warning('⚡ ' + newNotification.title, {
                    description: newNotification.content,
                    duration: 8000,
                  });
                  break;
                case 'payment_link_generated':
                  toast.success('🔗 ' + newNotification.title, {
                    description: newNotification.content,
                    duration: 5000,
                  });
                  break;
                case 'task_completed':
                  toast.success('✅ ' + newNotification.title, {
                    description: newNotification.content,
                    duration: 4000,
                  });
                  break;
                default:
                  toast.info(newNotification.title, {
                    description: newNotification.content,
                    duration: 5000,
                  });
              }
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  // Mark a notification as read
  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Get notification stats
  const getNotificationStats = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const todayNotifications = notifications.filter(n => 
      new Date(n.created_at).toDateString() === today.toDateString()
    );
    
    const yesterdayNotifications = notifications.filter(n => 
      new Date(n.created_at).toDateString() === yesterday.toDateString()
    );

    return {
      total: notifications.length,
      unread: unreadCount,
      today: todayNotifications.length,
      yesterday: yesterdayNotifications.length,
      byType: notifications.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    getNotificationStats
  };
};
