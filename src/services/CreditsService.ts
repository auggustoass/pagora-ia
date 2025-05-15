
import { ApiService } from './ApiService';
import { toast } from '@/components/ui/use-toast';

export class CreditsService {
  /**
   * Get credits for the current user via secure backend
   */
  static async getCredits() {
    try {
      const result = await ApiService.getCredits();
      return result;
    } catch (error: any) {
      toast({
        title: "Erro ao verificar créditos",
        description: error.message || "Não foi possível verificar seus créditos. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  }
  
  /**
   * Consume credits for invoice generation
   * @param amount Number of credits to consume
   */
  static async consumeCredits(amount: number) {
    try {
      const result = await ApiService.makeAuthenticatedRequest('credits/consume', 'POST', { amount });
      return result;
    } catch (error: any) {
      toast({
        title: "Erro ao consumir créditos",
        description: error.message || "Não foi possível consumir seus créditos. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  }
}
