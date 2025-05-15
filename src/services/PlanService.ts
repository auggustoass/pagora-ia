
import { ApiService } from './ApiService';
import { toast } from 'sonner';
import { Plan } from '@/components/subscription/types';

// Define interfaces for API responses
interface SubscriptionResponse {
  url: string;
  [key: string]: any;
}

interface PlansResponse {
  plans: Plan[];
  [key: string]: any;
}

export class PlanService {
  /**
   * Subscribe to a plan using n8n webhook endpoint
   * @param planId The ID of the plan to subscribe to
   * @param userId The ID of the user subscribing to the plan
   * @returns The checkout URL from Mercado Pago
   */
  static async subscribeToPlan(planId: string, userId: string): Promise<string | null> {
    try {
      const result = await ApiService.makeAuthenticatedRequest<SubscriptionResponse>('plans/subscribe', 'POST', {
        planId,
        userId
      });
      
      if (!result.url) {
        throw new Error('No checkout URL received from payment service');
      }
      
      return result.url;
    } catch (error: any) {
      console.error('Error subscribing to plan:', error);
      toast.error(`Erro ao processar pagamento: ${error.message || 'Falha ao comunicar com servidor de pagamento'}`);
      return null;
    }
  }
  
  /**
   * Retrieve available plans with pricing and features
   * @returns Array of plan objects 
   */
  static async getPlans(): Promise<Plan[]> {
    try {
      const result = await ApiService.makeAuthenticatedRequest<PlansResponse>('plans/list');
      return result.plans || [];
    } catch (error: any) {
      console.error('Error fetching plans:', error);
      toast.error(`Erro ao carregar planos: ${error.message || 'Falha ao comunicar com servidor'}`);
      return [];
    }
  }
}
