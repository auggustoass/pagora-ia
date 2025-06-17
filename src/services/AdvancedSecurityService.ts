
import { supabase } from '@/integrations/supabase/client';

/**
 * Advanced Security Service with enhanced protection measures
 */
export class AdvancedSecurityService {
  private static readonly ENCRYPTION_KEY = 'hblackpix-security-key-2024';
  
  /**
   * Enhanced security event logging with IP tracking and risk assessment
   */
  static async logSecurityEventEnhanced(
    eventType: string,
    eventDetails?: any,
    userId?: string,
    riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
  ): Promise<void> {
    try {
      const ipAddress = await this.getUserIP();
      const sessionId = this.getSessionId();
      
      const { error } = await supabase.rpc('log_security_event_enhanced', {
        p_user_id: userId || null,
        p_event_type: eventType,
        p_event_details: eventDetails ? JSON.parse(JSON.stringify(eventDetails)) : null,
        p_ip_address: ipAddress,
        p_user_agent: navigator.userAgent?.substring(0, 500) || null,
        p_session_id: sessionId,
        p_risk_level: riskLevel
      });

      if (error) {
        console.error('Enhanced security logging error:', error);
      }
    } catch (error) {
      console.error('Failed to log enhanced security event:', error);
    }
  }

  /**
   * Advanced rate limiting with user and IP tracking
   */
  static async checkAdvancedRateLimit(
    identifier: string,
    actionType: string,
    userId?: string,
    maxAttempts: number = 10,
    windowMinutes: number = 15
  ): Promise<{
    allowed: boolean;
    blocked: boolean;
    attempts?: number;
    maxAttempts?: number;
    blockedUntil?: string;
    reason?: string;
  }> {
    try {
      const ipAddress = await this.getUserIP();
      
      const { data, error } = await supabase.rpc('check_advanced_rate_limit', {
        p_identifier: identifier,
        p_action_type: actionType,
        p_user_id: userId || null,
        p_ip_address: ipAddress,
        p_max_attempts: maxAttempts,
        p_window_minutes: windowMinutes
      });

      if (error) {
        console.error('Advanced rate limit check error:', error);
        return { allowed: false, blocked: true, reason: 'Rate limit check failed' };
      }

      // Fix: Cast the data to the correct type since Supabase RPC returns Json type
      const result = data as {
        allowed: boolean;
        blocked: boolean;
        attempts?: number;
        maxAttempts?: number;
        blockedUntil?: string;
        reason?: string;
      };

      return result || { allowed: false, blocked: true, reason: 'Invalid response' };
    } catch (error) {
      console.error('Advanced rate limit check failed:', error);
      return { allowed: false, blocked: true, reason: 'System error' };
    }
  }

  /**
   * Detect suspicious login patterns
   */
  static async detectSuspiciousLoginPattern(userId: string): Promise<boolean> {
    try {
      const ipAddress = await this.getUserIP();
      
      const { data, error } = await supabase.rpc('detect_suspicious_login_pattern', {
        p_user_id: userId,
        p_ip_address: ipAddress
      });

      if (error) {
        console.error('Suspicious login detection error:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Failed to detect suspicious login pattern:', error);
      return false;
    }
  }

  /**
   * Get user's real IP address
   */
  private static async getUserIP(): Promise<string | null> {
    try {
      // Try to get real IP from multiple sources
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || null;
    } catch (error) {
      // Fallback: try to extract from headers or use local detection
      try {
        const response = await fetch('https://httpbin.org/ip');
        const data = await response.json();
        return data.origin?.split(',')[0]?.trim() || null;
      } catch {
        return null;
      }
    }
  }

  /**
   * Generate or get session ID
   */
  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('security_session_id');
    if (!sessionId) {
      sessionId = this.generateSecureId();
      sessionStorage.setItem('security_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Generate secure random ID
   */
  private static generateSecureId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Encrypt sensitive data (for Mercado Pago credentials)
   */
  static async encryptCredential(credential: string): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('encrypt_credential', {
        credential_text: credential,
        encryption_key: this.ENCRYPTION_KEY
      });

      if (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt credential');
      }

      return data;
    } catch (error) {
      console.error('Failed to encrypt credential:', error);
      throw error;
    }
  }

  /**
   * Decrypt sensitive data
   */
  static async decryptCredential(encryptedCredential: string): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('decrypt_credential', {
        encrypted_text: encryptedCredential,
        encryption_key: this.ENCRYPTION_KEY
      });

      if (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt credential');
      }

      return data;
    } catch (error) {
      console.error('Failed to decrypt credential:', error);
      throw error;
    }
  }

  /**
   * Validate and sanitize file uploads
   */
  static validateFileUpload(file: File): { isValid: boolean; error?: string } {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { isValid: false, error: 'Arquivo muito grande (máximo 10MB)' };
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Tipo de arquivo não permitido' };
    }

    // Check filename for malicious patterns
    const maliciousPatterns = [
      /../, /\.exe$/, /\.bat$/, /\.cmd$/, /\.scr$/, /\.vbs$/, /\.js$/,
      /<script/, /javascript:/, /data:/
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(file.name)) {
        return { isValid: false, error: 'Nome de arquivo suspeito' };
      }
    }

    return { isValid: true };
  }

  /**
   * Monitor for anomalous behavior patterns
   */
  static monitorAnomalousActivity(userId: string, action: string, metadata?: any): void {
    try {
      const key = `activity_monitor_${userId}_${action}`;
      const now = Date.now();
      
      // Get existing activity
      const activityData = JSON.parse(localStorage.getItem(key) || '[]');
      activityData.push({ timestamp: now, metadata });
      
      // Keep only last hour
      const hourAgo = now - 60 * 60 * 1000;
      const recentActivity = activityData.filter((item: any) => item.timestamp > hourAgo);
      
      // Check for suspicious patterns
      if (recentActivity.length > 50) {
        this.logSecurityEventEnhanced('ANOMALOUS_ACTIVITY_DETECTED', {
          userId,
          action,
          activityCount: recentActivity.length,
          timeWindow: '1hour'
        }, userId, 'high');
      }
      
      // Store cleaned activity
      localStorage.setItem(key, JSON.stringify(recentActivity.slice(-100)));
      
    } catch (error) {
      console.error('Error monitoring anomalous activity:', error);
    }
  }

  /**
   * Clean up security artifacts on logout
   */
  static cleanupSecurityArtifacts(): void {
    try {
      // Remove session data
      sessionStorage.removeItem('security_session_id');
      
      // Clean up monitoring data
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('activity_monitor_') || 
            key.startsWith('rate_limit_') || 
            key.startsWith('security_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error cleaning security artifacts:', error);
    }
  }
}
