
import { supabase } from '@/integrations/supabase/client';
import { EnhancedSecurityService } from './EnhancedSecurityService';

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
      // Enhanced endpoint validation
      if (!endpoint || typeof endpoint !== 'string') {
        throw new Error('Invalid endpoint provided');
      }
      
      // Validate endpoint format and prevent path traversal
      if (endpoint.includes('..') || endpoint.includes('//') || !/^[a-zA-Z0-9/_-]+$/.test(endpoint)) {
        throw new Error('Invalid endpoint format');
      }
      
      // Sanitize endpoint with enhanced security
      const endpointValidation = EnhancedSecurityService.validateSecureInput(endpoint);
      if (!endpointValidation.isValid) {
        throw new Error(`Invalid endpoint: ${endpointValidation.error}`);
      }
      
      const sanitizedEndpoint = EnhancedSecurityService.sanitizeHtmlAdvanced(endpoint);
      
      // Get current session for authentication
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        await EnhancedSecurityService.logSecurityEvent('API_AUTH_ERROR', { 
          endpoint: sanitizedEndpoint,
          error: sessionError.message 
        });
        throw new Error('Não foi possível autenticar a requisição');
      }
      
      const accessToken = sessionData.session?.access_token;
      
      if (!accessToken) {
        await EnhancedSecurityService.logSecurityEvent('API_NO_TOKEN', { 
          endpoint: sanitizedEndpoint 
        });
        throw new Error('Usuário não autenticado');
      }
      
      // Validate and construct URL
      const url = `${N8N_API_BASE_URL}/${sanitizedEndpoint}`;
      
      // Enhanced URL validation
      if (!EnhancedSecurityService.validateApiEndpoint(url)) {
        await EnhancedSecurityService.logSecurityEvent('API_INVALID_URL', { 
          url: url.substring(0, 100) 
        });
        throw new Error('URL não autorizada');
      }
      
      // Generate CSRF token for state verification
      const csrfToken = EnhancedSecurityService.generateCSRFToken();
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Requested-With': 'XMLHttpRequest', // CSRF protection
        'X-CSRF-Token': csrfToken, // Additional CSRF protection
        'X-API-Version': '1.0', // API versioning
      };
      
      // Validate and sanitize request data
      let sanitizedData = null;
      if (data) {
        const dataValidation = EnhancedSecurityService.validateSecureInput(data);
        if (!dataValidation.isValid) {
          throw new Error(`Invalid request data: ${dataValidation.error}`);
        }
        sanitizedData = EnhancedSecurityService.cleanSensitiveData(data);
      }
      
      const options: RequestInit = {
        method,
        headers,
        body: sanitizedData ? JSON.stringify(sanitizedData) : undefined,
        credentials: 'same-origin', // Security enhancement
        signal: AbortSignal.timeout(30000), // 30 second timeout
      };
      
      // Log API request (without sensitive data)
      await EnhancedSecurityService.logSecurityEvent('API_REQUEST', {
        endpoint: sanitizedEndpoint,
        method,
        hasData: !!data
      });
      
      // Make the request with retry logic
      let lastError: Error | null = null;
      const maxRetries = 2;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch(url, options);
          
          if (!response.ok) {
            const errorText = await response.text();
            const cleanedError = EnhancedSecurityService.cleanSensitiveData(errorText);
            
            await EnhancedSecurityService.logSecurityEvent('API_ERROR', {
              endpoint: sanitizedEndpoint,
              status: response.status,
              error: cleanedError?.substring(0, 200)
            });
            
            throw new Error(`Erro na requisição (${response.status})`);
          }
          
          // Parse and validate response
          const responseData = await response.json();
          
          // Log successful request
          await EnhancedSecurityService.logSecurityEvent('API_SUCCESS', {
            endpoint: sanitizedEndpoint,
            status: response.status
          });
          
          return responseData as T;
        } catch (error: any) {
          lastError = error;
          
          if (attempt === maxRetries) {
            await EnhancedSecurityService.logSecurityEvent('API_FAILURE', {
              endpoint: sanitizedEndpoint,
              attempt,
              error: error.message
            });
            throw error;
          }
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
      
      throw lastError || new Error('Request failed after retries');
    } catch (error: any) {
      const cleanedError = EnhancedSecurityService.cleanSensitiveData(error);
      console.error('Erro na comunicação com API:', cleanedError);
      throw error;
    }
  }
  
  // Invoice-related endpoints with enhanced validation
  static async createInvoice(invoiceData: any): Promise<any> {
    // Enhanced validation for invoice data
    if (!invoiceData || typeof invoiceData !== 'object') {
      throw new Error('Dados da fatura inválidos');
    }
    
    // Validate required fields
    const requiredFields = ['nome', 'email', 'valor', 'descricao'];
    for (const field of requiredFields) {
      if (!invoiceData[field]) {
        throw new Error(`Campo obrigatório ausente: ${field}`);
      }
    }
    
    // Validate email format
    if (invoiceData.email) {
      const emailValidation = EnhancedSecurityService.validateSecureEmail(invoiceData.email);
      if (!emailValidation.isValid) {
        throw new Error(`Email inválido: ${emailValidation.error}`);
      }
    }
    
    // Validate numeric fields
    if (invoiceData.valor && (isNaN(Number(invoiceData.valor)) || Number(invoiceData.valor) <= 0)) {
      throw new Error('Valor da fatura deve ser um número positivo');
    }
    
    return this.makeAuthenticatedRequest('invoices/create', 'POST', invoiceData);
  }
  
  static async listInvoices(params?: any): Promise<any> {
    let sanitizedParams = {};
    if (params) {
      const paramsValidation = EnhancedSecurityService.validateSecureInput(params);
      if (!paramsValidation.isValid) {
        throw new Error(`Parâmetros inválidos: ${paramsValidation.error}`);
      }
      sanitizedParams = EnhancedSecurityService.cleanSensitiveData(params);
    }
    
    const queryParams = Object.keys(sanitizedParams).length > 0 
      ? `?${new URLSearchParams(sanitizedParams).toString()}` 
      : '';
    return this.makeAuthenticatedRequest(`invoices/list${queryParams}`);
  }
  
  // Client-related endpoints with enhanced validation
  static async createClient(clientData: any): Promise<any> {
    if (!clientData || typeof clientData !== 'object') {
      throw new Error('Dados do cliente inválidos');
    }
    
    // Validate required fields
    const requiredFields = ['nome', 'email'];
    for (const field of requiredFields) {
      if (!clientData[field]) {
        throw new Error(`Campo obrigatório ausente: ${field}`);
      }
    }
    
    // Validate email
    if (clientData.email) {
      const emailValidation = EnhancedSecurityService.validateSecureEmail(clientData.email);
      if (!emailValidation.isValid) {
        throw new Error(`Email inválido: ${emailValidation.error}`);
      }
    }
    
    // Validate name
    if (clientData.nome) {
      const nameValidation = EnhancedSecurityService.validateSecureInput(clientData.nome, 'name');
      if (!nameValidation.isValid) {
        throw new Error(`Nome inválido: ${nameValidation.error}`);
      }
    }
    
    return this.makeAuthenticatedRequest('clients/create', 'POST', clientData);
  }
  
  static async listClients(params?: any): Promise<any> {
    let sanitizedParams = {};
    if (params) {
      const paramsValidation = EnhancedSecurityService.validateSecureInput(params);
      if (!paramsValidation.isValid) {
        throw new Error(`Parâmetros inválidos: ${paramsValidation.error}`);
      }
      sanitizedParams = EnhancedSecurityService.cleanSensitiveData(params);
    }
    
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
