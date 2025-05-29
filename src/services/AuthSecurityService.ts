import { supabase } from '@/integrations/supabase/client';
import { EnhancedSecurityService } from './EnhancedSecurityService';
import { toast } from 'sonner';

export class AuthSecurityService {
  /**
   * Secure sign in with rate limiting and monitoring
   */
  static async secureSignIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const userIdentifier = `signin_${email}`;
    
    // Check rate limiting
    const rateLimitAllowed = await EnhancedSecurityService.checkServerRateLimit(userIdentifier, 3);
    if (!rateLimitAllowed) {
      await EnhancedSecurityService.logSecurityEvent('RATE_LIMIT_EXCEEDED', { 
        action: 'signin', 
        email: email.substring(0, 5) + '***' 
      });
      return { success: false, error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' };
    }

    // Validate email format
    const emailValidation = EnhancedSecurityService.validateSecureEmail(email);
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation.error };
    }

    // Generate CSRF token
    const csrfToken = EnhancedSecurityService.generateCSRFToken();

    try {
      // Clean up any existing auth state
      await this.cleanupAuthState();
      
      // Attempt sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        await EnhancedSecurityService.logSecurityEvent('SIGNIN_FAILED', { 
          email: email.substring(0, 5) + '***',
          error: error.message 
        });
        return { success: false, error: error.message };
      }

      if (data.user) {
        await EnhancedSecurityService.logSecurityEvent('SIGNIN_SUCCESS', { 
          userId: data.user.id 
        });
        return { success: true };
      }

      return { success: false, error: 'Falha na autenticação' };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Secure sign up with validation
   */
  static async secureSignUp(
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> {
    const userIdentifier = `signup_${email}`;
    
    // Check rate limiting
    const rateLimitAllowed = await EnhancedSecurityService.checkServerRateLimit(userIdentifier, 2);
    if (!rateLimitAllowed) {
      return { success: false, error: 'Muitas tentativas de cadastro. Tente novamente em 15 minutos.' };
    }

    // Validate inputs
    const emailValidation = EnhancedSecurityService.validateSecureEmail(email);
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation.error };
    }

    const passwordValidation = EnhancedSecurityService.validateSecurePassword(password);
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.error };
    }

    const nameValidation = EnhancedSecurityService.validateSecureInput(firstName + lastName, 'name');
    if (!nameValidation.isValid) {
      return { success: false, error: nameValidation.error };
    }

    try {
      // Clean up any existing auth state
      await this.cleanupAuthState();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: EnhancedSecurityService.sanitizeHtmlAdvanced(firstName),
            last_name: EnhancedSecurityService.sanitizeHtmlAdvanced(lastName),
            phone: phone ? EnhancedSecurityService.sanitizeHtmlAdvanced(phone) : '',
          }
        }
      });

      if (error) {
        await EnhancedSecurityService.logSecurityEvent('SIGNUP_FAILED', { 
          email: email.substring(0, 5) + '***',
          error: error.message 
        });
        return { success: false, error: error.message };
      }

      if (data.user) {
        await EnhancedSecurityService.logSecurityEvent('SIGNUP_SUCCESS', { 
          userId: data.user.id 
        });
        return { success: true };
      }

      return { success: false, error: 'Falha no cadastro' };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Secure sign out with cleanup
   */
  static async secureSignOut(): Promise<void> {
    try {
      // Log security event
      await EnhancedSecurityService.logSecurityEvent('SIGNOUT_INITIATED');
      
      // Clean up security artifacts
      EnhancedSecurityService.cleanupSecurityArtifacts();
      
      // Clean up auth state
      await this.cleanupAuthState();
      
      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' });
      
      // Force page reload for clean state
      window.location.href = '/auth';
    } catch (error) {
      console.error('Sign out error:', error);
      // Force reload even if there's an error
      window.location.href = '/auth';
    }
  }

  /**
   * Clean up authentication state
   */
  private static async cleanupAuthState(): Promise<void> {
    // Remove all auth-related keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });

    // Remove from sessionStorage
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });

    // Attempt global sign out (ignore errors)
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  /**
   * Check for suspicious login patterns
   */
  static async detectSuspiciousLogin(email: string): Promise<boolean> {
    const recentLogins = JSON.parse(localStorage.getItem(`logins_${email}`) || '[]');
    const now = Date.now();
    
    // Add current attempt
    recentLogins.push(now);
    
    // Keep only last 24 hours
    const dayAgo = now - 24 * 60 * 60 * 1000;
    const filtered = recentLogins.filter((time: number) => time > dayAgo);
    
    // Check for too many attempts
    if (filtered.length > 10) {
      await EnhancedSecurityService.logSecurityEvent('SUSPICIOUS_LOGIN_PATTERN', {
        email: email.substring(0, 5) + '***',
        attemptsIn24h: filtered.length
      });
      return true;
    }
    
    localStorage.setItem(`logins_${email}`, JSON.stringify(filtered));
    return false;
  }
}
