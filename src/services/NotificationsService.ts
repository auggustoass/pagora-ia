import { supabase } from '@/integrations/supabase/client';
import { AdvancedSecurityService } from './AdvancedSecurityService';

interface CreateNotificationParams {
  userId: string;
  type: 'payment_update' | 'invoice_overdue' | 'low_credits' | 'subscription_update' | 'invoice_created' | 'invoice_paid' | 'invoice_status_updated' | 'client_created' | 'client_updated' | 'credits_added' | 'credits_consumed' | 'task_created' | 'task_completed' | 'user_approved' | 'user_rejected' | 'payment_link_generated' | string;
  title: string;
  content: string;
  relatedId?: string;
}

export const NotificationsService = {
  /**
   * Create a new notification for a user with enhanced security logging
   */
  async createNotification({
    userId,
    type,
    title,
    content,
    relatedId
  }: CreateNotificationParams): Promise<boolean> {
    try {
      // Check rate limiting for notification creation
      const rateLimitCheck = await AdvancedSecurityService.checkAdvancedRateLimit(
        `notification_${userId}`,
        'create_notification',
        userId,
        20, // max 20 notifications per window
        60  // 60 minute window
      );

      if (!rateLimitCheck.allowed) {
        await AdvancedSecurityService.logSecurityEventEnhanced(
          'NOTIFICATION_RATE_LIMITED',
          { userId, type, rateLimitCheck },
          userId,
          'medium'
        );
        return false;
      }

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
        await AdvancedSecurityService.logSecurityEventEnhanced(
          'NOTIFICATION_CREATION_FAILED',
          { userId, type, error: error.message },
          userId,
          'low'
        );
        return false;
      }

      // Log successful notification creation
      await AdvancedSecurityService.logSecurityEventEnhanced(
        'NOTIFICATION_CREATED',
        { userId, type, title: title.substring(0, 50) },
        userId,
        'low'
      );

      return data?.success || false;
    } catch (error) {
      console.error('Error invoking generate-notification function:', error);
      await AdvancedSecurityService.logSecurityEventEnhanced(
        'NOTIFICATION_SYSTEM_ERROR',
        { userId, type, error: error instanceof Error ? error.message : 'Unknown error' },
        userId,
        'medium'
      );
      return false;
    }
  },

  /**
   * Execute notification checks with enhanced monitoring
   */
  async runNotificationChecks(): Promise<boolean> {
    try {
      // Monitor this system operation
      AdvancedSecurityService.monitorAnomalousActivity('system', 'notification_checks');

      const { data, error } = await supabase.functions.invoke('check-notification-triggers');

      if (error) {
        console.error('Error running notification checks:', error);
        await AdvancedSecurityService.logSecurityEventEnhanced(
          'NOTIFICATION_CHECKS_FAILED',
          { error: error.message },
          undefined,
          'medium'
        );
        return false;
      }

      return data?.success || false;
    } catch (error) {
      console.error('Error invoking check-notification-triggers function:', error);
      await AdvancedSecurityService.logSecurityEventEnhanced(
        'NOTIFICATION_CHECKS_ERROR',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        undefined,
        'medium'
      );
      return false;
    }
  },

  async notifyInvoiceCreated(userId: string, invoiceData: any): Promise<boolean> {
    return this.createNotification({
      userId,
      type: 'invoice_created',
      title: 'Nova fatura criada',
      content: `Fatura de R$ ${invoiceData.valor} criada para ${invoiceData.nome}`,
      relatedId: invoiceData.id
    });
  },

  async notifyInvoicePaid(userId: string, invoiceData: any): Promise<boolean> {
    return this.createNotification({
      userId,
      type: 'invoice_paid',
      title: 'Fatura paga',
      content: `Fatura de R$ ${invoiceData.valor} foi paga por ${invoiceData.nome}`,
      relatedId: invoiceData.id
    });
  },

  async notifyClientCreated(userId: string, clientData: any): Promise<boolean> {
    return this.createNotification({
      userId,
      type: 'client_created',
      title: 'Novo cliente cadastrado',
      content: `Cliente ${clientData.nome} foi cadastrado no sistema`,
      relatedId: clientData.id
    });
  },

  async notifyLowCredits(userId: string, creditsRemaining: number): Promise<boolean> {
    return this.createNotification({
      userId,
      type: 'low_credits',
      title: 'Créditos baixos',
      content: `Você possui apenas ${creditsRemaining} créditos restantes`,
    });
  },

  async notifyPaymentLinkGenerated(userId: string, invoiceData: any): Promise<boolean> {
    return this.createNotification({
      userId,
      type: 'payment_link_generated',
      title: 'Link de pagamento gerado',
      content: `Link de pagamento gerado para ${invoiceData.nome} - R$ ${invoiceData.valor}`,
      relatedId: invoiceData.id
    });
  },

  async notifyTaskCompleted(userId: string, taskData: any): Promise<boolean> {
    return this.createNotification({
      userId,
      type: 'task_completed',
      title: 'Tarefa concluída',
      content: `Tarefa "${taskData.title}" foi marcada como concluída`,
      relatedId: taskData.id
    });
  }
};
