
import { supabase } from '@/integrations/supabase/client';
import { ApiService } from './ApiService';
import { SecurityService } from './SecurityService';
import { toast } from '@/components/ui/use-toast';
import { User } from '@/types/user';

export class UserService {
  /**
   * Validates the current user's JWT token against the n8n webhook
   * @returns A boolean indicating if the token is valid
   */
  static async validateToken(): Promise<boolean> {
    try {
      // Get the current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        console.error("No active session found");
        return false;
      }
      
      // Call the webhook endpoint to validate the token
      await ApiService.makeAuthenticatedRequest('auth/validate');
      
      return true;
    } catch (error) {
      console.error("Error validating token:", SecurityService.cleanSensitiveData(error));
      return false;
    }
  }

  /**
   * Gets the current authenticated user's profile with extended information
   * @returns User profile or null if not authenticated
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      // Get the current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        return null;
      }
      
      const user = sessionData.session.user;
      
      if (!user || !user.id) {
        return null;
      }
      
      // Validate user ID format
      if (typeof user.id !== 'string' || user.id.length < 36) {
        console.error('Invalid user ID format');
        return null;
      }
      
      // Get additional profile information from the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileError) {
        console.error('Error fetching profile:', SecurityService.cleanSensitiveData(profileError));
      }
      
      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (roleError) {
        console.error('Error fetching user roles:', SecurityService.cleanSensitiveData(roleError));
      }
      
      const isAdmin = !!roleData;
      
      // Combine user data with profile data - sanitize all strings
      return {
        id: user.id,
        email: SecurityService.sanitizeInput(user.email || ''),
        first_name: SecurityService.sanitizeInput(profileData?.first_name || ''),
        last_name: SecurityService.sanitizeInput(profileData?.last_name || ''),
        phone: SecurityService.sanitizeInput(profileData?.phone || ''),
        created_at: user.created_at || '',
        is_admin: isAdmin
      };
    } catch (error) {
      console.error("Error getting current user:", SecurityService.cleanSensitiveData(error));
      return null;
    }
  }

  /**
   * Signs the user out securely
   */
  static async signOut(): Promise<void> {
    try {
      // Clear sensitive data from localStorage before signing out
      const sensitiveKeys = Object.keys(localStorage).filter(key => 
        key.includes('token') || 
        key.includes('auth') || 
        key.includes('session') || 
        key.includes('credential') ||
        key.includes('rate_limit')
      );
      
      sensitiveKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          // Ignore errors when clearing storage
        }
      });
      
      await supabase.auth.signOut({ scope: 'global' });
      
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado da sua conta."
      });
    } catch (error: any) {
      console.error("Error signing out:", SecurityService.cleanSensitiveData(error));
      toast({
        title: "Erro ao realizar logout",
        description: "Não foi possível desconectar da sua conta.",
        variant: "destructive"
      });
    }
  }
}
