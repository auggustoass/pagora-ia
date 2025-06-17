
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export class PaymentService {
  static async generatePaymentLink(invoiceId: string): Promise<{ success: boolean; payment_url?: string; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice-payment', {
        body: { invoiceId }
      });

      if (error) throw error;

      if (data.success && data.payment_url) {
        toast.success('Link de pagamento gerado com sucesso!');
        return { success: true, payment_url: data.payment_url };
      }

      return { success: false, error: data.error || 'Erro ao gerar link' };
    } catch (error) {
      console.error('Error generating payment link:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao gerar link de pagamento: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  static async checkPaymentStatus(invoiceId: string): Promise<{ status: string; paid_amount?: number }> {
    try {
      const { data, error } = await supabase
        .from('faturas')
        .select('payment_status, paid_amount')
        .eq('id', invoiceId)
        .single();

      if (error) throw error;

      return {
        status: data.payment_status || 'pending',
        paid_amount: data.paid_amount
      };
    } catch (error) {
      console.error('Error checking payment status:', error);
      return { status: 'error' };
    }
  }
}
