
import { supabase } from '@/integrations/supabase/client';
import { SecurityService } from './SecurityService';

// Base URL of your n8n installation
const N8N_API_BASE_URL = 'https://webhook.hblackbot.online/webhook';

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
      // Validate endpoint
      if (!endpoint || typeof endpoint !== 'string') {
        throw new Error('Invalid endpoint provided');
      }
      
      // Sanitize endpoint
      const sanitizedEndpoint = SecurityService.sanitizeInput(endpoint);
      
      // Get current session for authentication
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error('Não foi possível autenticar a requisição');
      }
      
      const accessToken = sessionData.session?.access_token;
      
      if (!accessToken) {
        throw new Error('Usuário não autenticado');
      }
      
      // Prepare request to n8n endpoint
      const url = `${N8N_API_BASE_URL}/${sanitizedEndpoint}`;
      
      // Validate URL format
      try {
        new URL(url);
      } catch {
        throw new Error('URL inválida');
      }
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Requested-With': 'XMLHttpRequest', // CSRF protection
      };
      
      const options: RequestInit = {
        method,
        headers,
        body: data ? JSON.stringify(SecurityService.sanitizeInput(data)) : undefined,
        credentials: 'same-origin', // Security enhancement
      };
      
      // Make the request
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}):`, SecurityService.cleanSensitiveData(errorText));
        throw new Error(`Erro na requisição (${response.status})`);
      }
      
      // Parse and return response
      const responseData = await response.json();
      return responseData as T;
    } catch (error) {
      console.error('Erro na comunicação com API:', SecurityService.cleanSensitiveData(error));
      throw error;
    }
  }
  
  // Invoice-related endpoints
  static async createInvoice(invoiceData: any): Promise<any> {
    // Validate invoice data
    if (!invoiceData || typeof invoiceData !== 'object') {
      throw new Error('Dados da fatura inválidos');
    }
    
    return this.makeAuthenticatedRequest('invoices/create', 'POST', invoiceData);
  }
  
  static async listInvoices(params?: any): Promise<any> {
    const sanitizedParams = params ? SecurityService.sanitizeInput(params) : {};
    const queryParams = Object.keys(sanitizedParams).length > 0 
      ? `?${new URLSearchParams(sanitizedParams).toString()}` 
      : '';
    return this.makeAuthenticatedRequest(`invoices/list${queryParams}`);
  }
  
  // Client-related endpoints
  static async createClient(clientData: any): Promise<any> {
    if (!clientData || typeof clientData !== 'object') {
      throw new Error('Dados do cliente inválidos');
    }
    
    return this.makeAuthenticatedRequest('clients/create', 'POST', clientData);
  }
  
  static async listClients(params?: any): Promise<any> {
    const sanitizedParams = params ? SecurityService.sanitizeInput(params) : {};
    const queryParams = Object.keys(sanitizedParams).length > 0 
      ? `?${new URLSearchParams(sanitizedParams).toString()}` 
      : '';
    return this.makeAuthenticatedRequest(`clients/list${queryParams}`);
  }
  
  // Credits-related endpoints
  static async getCredits(): Promise<any> {
    return this.makeAuthenticatedRequest('credits/get');
  }
}
