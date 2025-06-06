
import { EnhancedSecurityService } from './EnhancedSecurityService';

/**
 * Security utilities for input validation and sanitization
 * @deprecated Use EnhancedSecurityService for new implementations
 */
export class SecurityService {
  /**
   * Sanitize HTML content to prevent XSS attacks
   * @deprecated Use EnhancedSecurityService.sanitizeHtmlAdvanced instead
   */
  static sanitizeHtml(input: string): string {
    return EnhancedSecurityService.sanitizeHtmlAdvanced(input);
  }

  /**
   * Validate email format with strict regex
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number (Brazilian format)
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\(?[0-9]{2}\)?[\s-]?[0-9]{4,5}[\s-]?[0-9]{4}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  }

  /**
   * Validate CPF/CNPJ format
   */
  static isValidCpfCnpj(document: string): boolean {
    const cleaned = document.replace(/\D/g, '');
    return cleaned.length === 11 || cleaned.length === 14;
  }

  /**
   * Sanitize input for database operations
   * @deprecated Use EnhancedSecurityService.validateSecureInput instead
   */
  static sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return EnhancedSecurityService.sanitizeHtmlAdvanced(input);
    }
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    return input;
  }

  /**
   * Rate limiting check (simple implementation)
   * @deprecated Use EnhancedSecurityService.checkServerRateLimit instead
   */
  static checkRateLimit(key: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const attempts = JSON.parse(localStorage.getItem(`rate_limit_${key}`) || '[]');
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter((timestamp: number) => now - timestamp < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    localStorage.setItem(`rate_limit_${key}`, JSON.stringify(validAttempts));
    return true;
  }

  /**
   * Generate secure random string
   */
  static generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate file upload
   * @deprecated Use EnhancedSecurityService.validateSecureFileUpload instead
   */
  static validateFileUpload(file: File, allowedTypes: string[], maxSize: number = 5 * 1024 * 1024): boolean {
    const validation = EnhancedSecurityService.validateSecureFileUpload(file, allowedTypes, maxSize);
    return validation.isValid;
  }

  /**
   * Clean sensitive data from objects before logging
   */
  static cleanSensitiveData(obj: any): any {
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
    
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const cleaned = { ...obj };
    
    for (const key in cleaned) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        cleaned[key] = '[REDACTED]';
      } else if (typeof cleaned[key] === 'object') {
        cleaned[key] = this.cleanSensitiveData(cleaned[key]);
      }
    }
    
    return cleaned;
  }
}
