
import { ApiService } from './ApiService';
import { toast } from '@/components/ui/use-toast';

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
   * Generates a payment link for an invoice
   */
  static async generatePaymentLink(invoiceId: string) {
    try {
      const result = await ApiService.generatePaymentLink(invoiceId);
      return result;
    } catch (error: any) {
      toast({
        title: "Erro ao gerar link de pagamento",
        description: error.message || "Não foi possível gerar o link de pagamento. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  }
}
