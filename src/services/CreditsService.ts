
import { ApiService } from './ApiService';
import { toast } from '@/components/ui/use-toast';

// Define interfaces for API responses
interface CreditsResponse {
  credits_remaining: number;
  plan_id?: string;
  id?: string;
  [key: string]: any;
}

interface ConsumeCreditsResponse {
  success: boolean;
  credits_remaining?: number;
  [key: string]: any;
}

export class CreditsService {
  /**
   * Get credits for the current user via secure backend
   */
  static async getCredits(): Promise<CreditsResponse> {
    try {
      const result = await ApiService.makeAuthenticatedRequest<CreditsResponse>('credits/get');
      return result;
    } catch (error: any) {
      toast.error(`Erro ao verificar créditos: ${error.message || "Não foi possível verificar seus créditos. Tente novamente."}`);
      throw error;
    }
  }
  
  /**
   * Consume credits for invoice generation
   * @param amount Number of credits to consume
   */
  static async consumeCredits(amount: number): Promise<ConsumeCreditsResponse> {
    try {
      const result = await ApiService.makeAuthenticatedRequest<ConsumeCreditsResponse>('credits/consume', 'POST', { amount });
      return result;
    } catch (error: any) {
      toast.error(`Erro ao consumir créditos: ${error.message || "Não foi possível consumir seus créditos. Tente novamente."}`);
      throw error;
    }
  }
}
