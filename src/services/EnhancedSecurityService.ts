
import { supabase } from '@/integrations/supabase/client';

/**
 * Enhanced Security Service with comprehensive protection measures
 */
export class EnhancedSecurityService {
  private static readonly RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly SENSITIVE_PATTERNS = [
    /password/i,
    /token/i,
    /secret/i,
    /key/i,
    /credential/i,
    /auth/i
  ];

  /**
   * Advanced input validation with multiple security checks
   */
  static validateSecureInput(input: any, type?: string): { isValid: boolean; error?: string } {
    if (input === null || input === undefined) {
      return { isValid: false, error: 'Input não pode ser nulo ou indefinido' };
    }

    // String validation
    if (typeof input === 'string') {
      // Check for extremely long strings (potential DoS)
      if (input.length > 10000) {
        return { isValid: false, error: 'Input muito longo' };
      }

      // Check for SQL injection patterns
      const sqlPatterns = [
        /(\bunion\b|\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b|\bcreate\b|\balter\b)/i,
        /(\bor\b|\band\b)\s+\w+\s*=\s*\w+/i,
        /('|\"|;|--|\*|\/\*|\*\/)/,
        /(\bscript\b|\bonload\b|\bonerror\b)/i
      ];

      for (const pattern of sqlPatterns) {
        if (pattern.test(input)) {
          return { isValid: false, error: 'Input contém padrões suspeitos' };
        }
      }

      // Type-specific validation
      if (type === 'email') {
        return this.validateSecureEmail(input);
      } else if (type === 'phone') {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(input.replace(/\s|-|\(|\)/g, ''))) {
          return { isValid: false, error: 'Formato de telefone inválido' };
        }
      } else if (type === 'name') {
        const nameRegex = /^[a-zA-ZÀ-ÿ\s]{1,100}$/;
        if (!nameRegex.test(input)) {
          return { isValid: false, error: 'Nome contém caracteres inválidos' };
        }
      }
    }

    // Object validation - recursively check all properties
    if (typeof input === 'object' && !Array.isArray(input)) {
      for (const [key, value] of Object.entries(input)) {
        const result = this.validateSecureInput(value);
        if (!result.isValid) {
          return { isValid: false, error: `Erro na propriedade ${key}: ${result.error}` };
        }
      }
    }

    return { isValid: true };
  }

  /**
   * Enhanced email validation with security checks
   */
  static validateSecureEmail(email: string): { isValid: boolean; error?: string } {
    if (!email || typeof email !== 'string') {
      return { isValid: false, error: 'Email é obrigatório' };
    }

    // Length check
    if (email.length > 254) {
      return { isValid: false, error: 'Email muito longo' };
    }

    // Basic format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Formato de email inválido' };
    }

    // Check for suspicious patterns
    if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
      return { isValid: false, error: 'Email contém padrões suspeitos' };
    }

    return { isValid: true };
  }

  /**
   * Enhanced password validation with strength assessment
   */
  static validateSecurePassword(password: string): { isValid: boolean; error?: string; strength: 'weak' | 'medium' | 'strong' } {
    if (!password || typeof password !== 'string') {
      return { isValid: false, error: 'Senha é obrigatória', strength: 'weak' };
    }

    if (password.length < 8) {
      return { isValid: false, error: 'Senha deve ter pelo menos 8 caracteres', strength: 'weak' };
    }

    if (password.length > 128) {
      return { isValid: false, error: 'Senha muito longa', strength: 'weak' };
    }

    // Check for complexity
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    const complexityCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

    if (complexityCount >= 4 && password.length >= 12) {
      strength = 'strong';
    } else if (complexityCount >= 3 && password.length >= 8) {
      strength = 'medium';
    }

    if (!(hasUpper && hasLower && hasNumber && hasSpecial)) {
      return { 
        isValid: false, 
        error: 'Senha deve conter pelo menos uma letra maiúscula, minúscula, número e caractere especial',
        strength
      };
    }

    // Check for common patterns
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /abc123/i
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        return { isValid: false, error: 'Senha contém padrões comuns inseguros', strength: 'weak' };
      }
    }

    return { isValid: true, strength };
  }

  /**
   * Server-side rate limiting with Supabase
   */
  static async checkServerRateLimit(identifier: string, maxAttempts: number = 5): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        identifier,
        max_attempts: maxAttempts,
        window_minutes: 15
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return false; // Fail closed for security
      }

      return data === true;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return false; // Fail closed for security
    }
  }

  /**
   * Advanced HTML sanitization
   */
  static sanitizeHtmlAdvanced(input: string): string {
    if (!input || typeof input !== 'string') return '';

    return input
      .replace(/[<>]/g, '') // Remove all HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/&lt;script&gt;/gi, '') // Remove encoded script tags
      .replace(/&gt;/gi, '') // Remove encoded >
      .replace(/&lt;/gi, '') // Remove encoded <
      .trim()
      .substring(0, 1000); // Limit length
  }

  /**
   * Enhanced security event logging
   */
  static async logSecurityEvent(
    eventType: string, 
    eventDetails?: any, 
    userId?: string
  ): Promise<void> {
    try {
      // Clean sensitive data from event details
      const cleanedDetails = this.cleanSensitiveData(eventDetails);
      
      const { error } = await supabase.rpc('log_security_event', {
        p_user_id: userId || null,
        p_event_type: eventType,
        p_event_details: cleanedDetails ? JSON.parse(JSON.stringify(cleanedDetails)) : null,
        p_ip_address: null, // Will be handled server-side
        p_user_agent: navigator.userAgent?.substring(0, 500) || null
      });

      if (error) {
        console.error('Security logging error:', error);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Clean sensitive data from objects
   */
  static cleanSensitiveData(data: any): any {
    if (!data) return data;

    if (typeof data === 'string') {
      // Check if string contains sensitive patterns
      for (const pattern of this.SENSITIVE_PATTERNS) {
        if (pattern.test(data)) {
          return '[REDACTED]';
        }
      }
      return data;
    }

    if (typeof data === 'object' && !Array.isArray(data)) {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Check if key name indicates sensitive data
        const isSensitiveKey = this.SENSITIVE_PATTERNS.some(pattern => pattern.test(key));
        
        if (isSensitiveKey) {
          cleaned[key] = '[REDACTED]';
        } else {
          cleaned[key] = this.cleanSensitiveData(value);
        }
      }
      return cleaned;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.cleanSensitiveData(item));
    }

    return data;
  }

  /**
   * Detect anomalous activity patterns
   */
  static detectAnomalousActivity(userId: string, action: string): void {
    const key = `activity_${userId}_${action}`;
    const now = Date.now();
    
    // Get recent activity
    const recentActivity = JSON.parse(localStorage.getItem(key) || '[]');
    
    // Add current activity
    recentActivity.push(now);
    
    // Keep only last hour
    const hourAgo = now - 60 * 60 * 1000;
    const filtered = recentActivity.filter((time: number) => time > hourAgo);
    
    // Check for suspicious patterns (more than 30 actions per hour)
    if (filtered.length > 30) {
      this.logSecurityEvent('ANOMALOUS_ACTIVITY', {
        userId,
        action,
        count: filtered.length,
        timeWindow: '1hour'
      });
    }
    
    // Store cleaned activity log
    localStorage.setItem(key, JSON.stringify(filtered.slice(-50))); // Keep last 50 entries
  }

  /**
   * Generate secure CSRF token
   */
  static generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Clean up security artifacts
   */
  static cleanupSecurityArtifacts(): void {
    try {
      // Remove rate limiting entries
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('rate_limit_') || 
            key.startsWith('activity_') || 
            key.startsWith('security_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error cleaning security artifacts:', error);
    }
  }

  /**
   * Validate API endpoints to prevent SSRF
   */
  static validateApiEndpoint(url: string): boolean {
    try {
      const urlObj = new URL(url);
      
      // Only allow HTTPS
      if (urlObj.protocol !== 'https:') {
        return false;
      }
      
      // Whitelist allowed domains
      const allowedDomains = [
        'api.mercadopago.com',
        'webhook.hblackbot.online'
      ];
      
      return allowedDomains.includes(urlObj.hostname);
    } catch {
      return false;
    }
  }
}
