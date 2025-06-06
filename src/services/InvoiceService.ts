
import { ApiService } from './ApiService';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export class InvoiceService {
  /**
   * Creates a new invoice via the secure backend
   */
  static async createInvoice(invoiceData: any) {
    try {
      const result = await ApiService.createInvoice(invoiceData);
      return result;
    } catch (error: any) {
      toast({
        title: "Erro ao criar fatura",
        description: error.message || "Não foi possível criar a fatura. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  }
  
  /**
   * Lists invoices that belong to the current user
   */
  static async listInvoices(filters?: any) {
    try {
      const result = await ApiService.listInvoices(filters);
      return result;
    } catch (error: any) {
      toast({
        title: "Erro ao listar faturas",
        description: error.message || "Não foi possível carregar as faturas. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  }
  
  /**
   * Generates a payment link or PIX for an invoice using the secure edge function
   */
  static async generatePaymentLink(invoiceId: string, paymentType: string = "link") {
    try {
      console.log(`🔥 Calling edge function for ${paymentType} payment, invoice: ${invoiceId}`);
      
      // Check user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error("Usuário não autenticado");
      }
      
      // Call the Supabase Edge Function directly
      const { data, error } = await supabase.functions.invoke('generate-invoice-payment', {
        body: { invoiceId, paymentType }
      });
      
      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Erro ao gerar pagamento");
      }
      
      console.log("✅ Edge function response:", data);
      return data;
    } catch (error: any) {
      console.error("Error generating payment:", error);
      toast({
        title: `Erro ao gerar ${paymentType === 'pix' ? 'PIX' : 'link de pagamento'}`,
        description: error.message || `Não foi possível gerar o ${paymentType === 'pix' ? 'PIX' : 'link de pagamento'}. Verifique suas credenciais do Mercado Pago em Configurações.`,
        variant: "destructive"
      });
      throw error;
    }
  }
}
