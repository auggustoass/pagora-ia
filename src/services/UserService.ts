
import { supabase } from '@/integrations/supabase/client';
import { ApiService } from './ApiService';
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
        console.error("No active session found:", sessionError);
        return false;
      }
      
      // Call the webhook endpoint to validate the token
      await ApiService.makeAuthenticatedRequest('auth/validate');
      
      return true;
    } catch (error) {
      console.error("Error validating token:", error);
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
      
      if (!user) {
        return null;
      }
      
      // Get additional profile information from the profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone')
        .eq('id', user.id)
        .maybeSingle();
      
      // Check if user has admin role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      const isAdmin = !!roleData;
      
      // Combine user data with profile data
      return {
        id: user.id,
        email: user.email || '',
        first_name: profileData?.first_name || '',
        last_name: profileData?.last_name || '',
        phone: profileData?.phone || '',
        created_at: user.created_at || '',
        is_admin: isAdmin
      };
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  /**
   * Signs the user out
   */
  static async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado da sua conta."
      });
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({
        title: "Erro ao realizar logout",
        description: error.message || "Não foi possível desconectar da sua conta.",
        variant: "destructive"
      });
    }
  }
}
