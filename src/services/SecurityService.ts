
import { EnhancedSecurityService } from './EnhancedSecurityService';

/**
 * Legacy SecurityService - maintained for backward compatibility
 * New code should use EnhancedSecurityService
 */
export class SecurityService {
  /**
   * @deprecated Use EnhancedSecurityService.validateSecureInput instead
   */
  static sanitizeInput(input: any): any {
    if (!input) return input;
    
    if (typeof input === 'string') {
      return EnhancedSecurityService.sanitizeHtmlAdvanced(input);
    }
    
    if (typeof input === 'object' && !Array.isArray(input)) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }
    
    return input;
  }

  /**
   * @deprecated Use EnhancedSecurityService.cleanSensitiveData instead
   */
  static cleanSensitiveData(data: any): any {
    return EnhancedSecurityService.cleanSensitiveData(data);
  }

  /**
   * @deprecated Use EnhancedSecurityService.validateSecureEmail instead
   */
  static validateEmail(email: string): boolean {
    const result = EnhancedSecurityService.validateSecureEmail(email);
    return result.isValid;
  }

  /**
   * @deprecated Use EnhancedSecurityService.validateSecureEmail instead
   */
  static isValidEmail(email: string): boolean {
    const result = EnhancedSecurityService.validateSecureEmail(email);
    return result.isValid;
  }

  /**
   * @deprecated Use EnhancedSecurityService.sanitizeHtmlAdvanced instead
   */
  static sanitizeHtml(input: string): string {
    return EnhancedSecurityService.sanitizeHtmlAdvanced(input);
  }

  /**
   * Client-side rate limiting check
   * @deprecated Use EnhancedSecurityService.checkServerRateLimit for server-side rate limiting
   */
  static checkRateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempts = JSON.parse(localStorage.getItem(`rate_limit_${key}`) || '[]');
    
    // Filter attempts within the time window
    const recentAttempts = attempts.filter((timestamp: number) => now - timestamp < windowMs);
    
    // Add current attempt
    recentAttempts.push(now);
    
    // Update storage
    localStorage.setItem(`rate_limit_${key}`, JSON.stringify(recentAttempts));
    
    // Check if limit exceeded
    return recentAttempts.length <= maxAttempts;
  }

  /**
   * Basic phone validation
   * @deprecated Use EnhancedSecurityService.validateSecureInput with type 'phone' instead
   */
  static isValidPhone(phone: string): boolean {
    if (!phone || typeof phone !== 'string') return false;
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
  }

  /**
   * Basic CPF/CNPJ validation
   */
  static isValidCpfCnpj(value: string): boolean {
    if (!value || typeof value !== 'string') return false;
    const clean = value.replace(/\D/g, '');
    return clean.length === 11 || clean.length === 14;
  }
}
