
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
   * @deprecated Use EnhancedSecurityService.sanitizeHtmlAdvanced instead
   */
  static sanitizeHtml(input: string): string {
    return EnhancedSecurityService.sanitizeHtmlAdvanced(input);
  }
}
