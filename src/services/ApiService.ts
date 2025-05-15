
import { supabase } from '@/integrations/supabase/client';

// Base URL of your n8n installation
const N8N_API_BASE_URL = 'https://webhook.hblackbot.online/webhook'; // Updated to the correct webhook URL

/**
 * Service responsible for making authenticated API calls to n8n backend
 */
export class ApiService {
  /**
   * Makes an authenticated request to the n8n backend
   * @param endpoint - The endpoint to call on the n8n backend
   * @param method - HTTP method
   * @param data - Optional data payload
   * @returns The response data from the n8n backend
   */
  static async makeAuthenticatedRequest<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    try {
      // Get current session for authentication
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error('Não foi possível autenticar a requisição: ' + sessionError.message);
      }
      
      const accessToken = sessionData.session?.access_token;
      
      if (!accessToken) {
        throw new Error('Usuário não autenticado');
      }
      
      // Prepare request to n8n endpoint
      const url = `${N8N_API_BASE_URL}/${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      };
      
      const options: RequestInit = {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      };
      
      // Make the request
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na requisição (${response.status}): ${errorText}`);
      }
      
      // Parse and return response
      const responseData = await response.json();
      return responseData as T;
    } catch (error) {
      console.error('Erro na comunicação com API:', error);
      throw error;
    }
  }
  
  // Invoice-related endpoints
  static async createInvoice(invoiceData: any): Promise<any> {
    return this.makeAuthenticatedRequest('invoices/create', 'POST', invoiceData);
  }
  
  static async listInvoices(params?: any): Promise<any> {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.makeAuthenticatedRequest(`invoices/list${queryParams}`);
  }
  
  // Client-related endpoints
  static async createClient(clientData: any): Promise<any> {
    return this.makeAuthenticatedRequest('clients/create', 'POST', clientData);
  }
  
  static async listClients(params?: any): Promise<any> {
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.makeAuthenticatedRequest(`clients/list${queryParams}`);
  }
  
  // Credits-related endpoints
  static async getCredits(): Promise<any> {
    return this.makeAuthenticatedRequest('credits/get');
  }
  
  // Plan-related endpoints
  static async subscribeToPlan(planData: any): Promise<any> {
    return this.makeAuthenticatedRequest('plans/subscribe', 'POST', planData);
  }
  
  static async listPlans(): Promise<any> {
    return this.makeAuthenticatedRequest('plans/list');
  }
}
