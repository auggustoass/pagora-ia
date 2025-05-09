
import { supabase } from '@/integrations/supabase/client';

interface CreateNotificationParams {
  userId: string;
  type: 'payment_update' | 'invoice_overdue' | 'low_credits' | 'subscription_update' | string;
  title: string;
  content: string;
  relatedId?: string;
}

export const NotificationsService = {
  /**
   * Create a new notification for a user
   */
  async createNotification({
    userId,
    type,
    title,
    content,
    relatedId
  }: CreateNotificationParams): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-notification', {
        body: {
          userId,
          type,
          title,
          content,
          relatedId
        }
      });

      if (error) {
        console.error('Error generating notification:', error);
        return false;
      }

      return data?.success || false;
    } catch (error) {
      console.error('Error invoking generate-notification function:', error);
      return false;
    }
  },

  /**
   * Execute notification checks (typically called by a cron job)
   */
  async runNotificationChecks(): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('check-notification-triggers');

      if (error) {
        console.error('Error running notification checks:', error);
        return false;
      }

      return data?.success || false;
    } catch (error) {
      console.error('Error invoking check-notification-triggers function:', error);
      return false;
    }
  }
};
