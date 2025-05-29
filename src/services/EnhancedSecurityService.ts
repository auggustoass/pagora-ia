import { SecurityService } from './SecurityService';
import { supabase } from '@/integrations/supabase/client';

/**
 * Enhanced security service with additional protection measures
 */
export class EnhancedSecurityService extends SecurityService {
  /**
   * Enhanced XSS protection with DOMPurify-like functionality
   */
  static sanitizeHtmlAdvanced(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:text\/html/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/expression\s*\(/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .trim();
  }

  /**
   * Server-side rate limiting check
   */
  static async checkServerRateLimit(identifier: string, maxAttempts: number = 5): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        identifier,
        max_attempts: maxAttempts,
        window_minutes: 15
      });
      
      if (error) {
        console.error('Rate limit check failed:', error);
        return false;
      }
      
      return data;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return false;
    }
  }

  /**
   * Log security events to database
   */
  static async logSecurityEvent(
    eventType: string,
    eventDetails?: any,
    userId?: string
  ): Promise<void> {
    try {
      const userAgent = navigator.userAgent;
      
      await supabase.rpc('log_security_event', {
        p_user_id: userId || null,
        p_event_type: eventType,
        p_event_details: eventDetails ? JSON.stringify(eventDetails) : null,
        p_user_agent: userAgent
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Validate form input with enhanced security
   */
  static validateSecureInput(input: any, fieldName: string): { isValid: boolean; error?: string } {
    if (typeof input === 'string') {
      // Check for potential XSS
      const suspicious = [
        /<script/i,
        /javascript:/i,
        /on\w+=/i,
        /<iframe/i,
        /vbscript:/i,
        /expression\(/i
      ];
      
      if (suspicious.some(pattern => pattern.test(input))) {
        this.logSecurityEvent('XSS_ATTEMPT', { field: fieldName, input: input.substring(0, 100) });
        return { isValid: false, error: 'Conteúdo suspeito detectado' };
      }
      
      // Length validation
      if (input.length > 10000) {
        return { isValid: false, error: 'Texto muito longo' };
      }
    }
    
    return { isValid: true };
  }

  /**
   * Enhanced email validation with additional security checks
   */
  static validateSecureEmail(email: string): { isValid: boolean; error?: string } {
    if (!this.isValidEmail(email)) {
      return { isValid: false, error: 'Formato de email inválido' };
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /[<>]/,
      /javascript:/i,
      /vbscript:/i,
      /data:/i
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(email))) {
      this.logSecurityEvent('SUSPICIOUS_EMAIL', { email });
      return { isValid: false, error: 'Email contém caracteres suspeitos' };
    }
    
    return { isValid: true };
  }

  /**
   * Secure password validation
   */
  static validateSecurePassword(password: string): { isValid: boolean; error?: string; strength: 'weak' | 'medium' | 'strong' } {
    if (password.length < 8) {
      return { isValid: false, error: 'Senha deve ter pelo menos 8 caracteres', strength: 'weak' };
    }
    
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const criteria = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (criteria < 3) {
      return { 
        isValid: false, 
        error: 'Senha deve conter ao menos: maiúscula, minúscula, número e caractere especial',
        strength: 'weak'
      };
    }
    
    const strength = criteria === 4 ? 'strong' : 'medium';
    return { isValid: true, strength };
  }

  /**
   * Enhanced file upload validation
   */
  static validateSecureFileUpload(
    file: File, 
    allowedTypes: string[], 
    maxSize: number = 5 * 1024 * 1024
  ): { isValid: boolean; error?: string } {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      this.logSecurityEvent('INVALID_FILE_TYPE', { 
        fileName: file.name, 
        fileType: file.type 
      });
      return { isValid: false, error: 'Tipo de arquivo não permitido' };
    }
    
    // Check file size
    if (file.size > maxSize) {
      return { isValid: false, error: `Arquivo muito grande. Máximo: ${maxSize / 1024 / 1024}MB` };
    }
    
    // Check for suspicious file names
    const suspiciousPatterns = [
      /\.exe$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.scr$/i,
      /\.js$/i,
      /\.vbs$/i,
      /\.php$/i
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
      this.logSecurityEvent('SUSPICIOUS_FILE_UPLOAD', { fileName: file.name });
      return { isValid: false, error: 'Tipo de arquivo não permitido' };
    }
    
    return { isValid: true };
  }

  /**
   * Generate CSRF token
   */
  static generateCSRFToken(): string {
    const token = this.generateSecureToken(32);
    sessionStorage.setItem('csrf_token', token);
    return token;
  }

  /**
   * Validate CSRF token
   */
  static validateCSRFToken(token: string): boolean {
    const storedToken = sessionStorage.getItem('csrf_token');
    return storedToken === token;
  }

  /**
   * Clean up security artifacts on logout
   */
  static cleanupSecurityArtifacts(): void {
    // Remove CSRF tokens
    sessionStorage.removeItem('csrf_token');
    
    // Clear rate limiting data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('rate_limit_') || key.includes('security_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Log security cleanup
    this.logSecurityEvent('SECURITY_CLEANUP');
  }

  /**
   * Detect potential security threats in user behavior
   */
  static detectAnomalousActivity(userId: string, action: string): void {
    const activityKey = `activity_${userId}_${action}`;
    const now = Date.now();
    
    // Get recent activity
    const recentActivity = JSON.parse(localStorage.getItem(activityKey) || '[]');
    
    // Add current activity
    recentActivity.push(now);
    
    // Keep only last 10 activities
    const filtered = recentActivity.slice(-10);
    
    // Check for rapid successive actions (potential bot)
    if (filtered.length >= 5) {
      const timeWindow = 60000; // 1 minute
      const recentActions = filtered.filter(time => now - time < timeWindow);
      
      if (recentActions.length >= 5) {
        this.logSecurityEvent('ANOMALOUS_ACTIVITY', {
          userId,
          action,
          actionsInWindow: recentActions.length,
          suspectedBot: true
        });
      }
    }
    
    localStorage.setItem(activityKey, JSON.stringify(filtered));
  }
}
