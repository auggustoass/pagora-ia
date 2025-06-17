
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EnhancedSecurityService } from '@/services/EnhancedSecurityService';
import { AuthSecurityService } from '@/services/AuthSecurityService';

type AuthContextType = {
  supabaseClient: typeof supabase;
  session: Session | null;
  user: any | null;
  isLoading: boolean;
  isAdmin: boolean;
  isApproved: boolean;
  userStatus: 'pending' | 'approved' | 'rejected' | null;
  signOut: () => Promise<void>;
  secureSignIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  secureSignUp: (email: string, password: string, firstName: string, lastName: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [userStatus, setUserStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            await checkUserStatus(initialSession.user.id);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      // Log auth state changes
      EnhancedSecurityService.logSecurityEvent('AUTH_STATE_CHANGE', { 
        event,
        userId: newSession?.user?.id 
      });
      
      // Check for admin role and approval status when session changes
      if (newSession?.user) {
        setTimeout(() => {
          if (mounted) {
            checkUserStatus(newSession.user.id);
          }
        }, 0);
      } else {
        setIsAdmin(false);
        setIsApproved(false);
        setUserStatus(null);
      }
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const checkUserStatus = async (userId: string) => {
    try {
      // Validate userId format (should be UUID)
      if (!userId || typeof userId !== 'string' || userId.length < 36) {
        console.error('Invalid user ID provided');
        return;
      }

      // Check user profile for approval status
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('approved, status, first_login')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', EnhancedSecurityService.cleanSensitiveData(profileError));
        setIsApproved(false);
        setUserStatus(null);
        return;
      }

      setIsApproved(profileData.approved);
      setUserStatus(profileData.status);

      // Show welcome toast for new users
      if (profileData && profileData.first_login === true) {
        await supabase
          .from('profiles')
          .update({ first_login: false })
          .eq('id', userId);
          
        if (profileData.approved) {
          toast.success("Bem-vindo!", {
            description: "Recebeu 10 créditos gratuitos para começar a usar o sistema."
          });
        }
      }

      // Check admin role
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) {
        console.error('Error fetching user roles:', EnhancedSecurityService.cleanSensitiveData(rolesError));
        setIsAdmin(false);
        return;
      }

      // Check if the user has the 'admin' role
      const isAdminUser = roles?.some(role => role.role === 'admin');
      setIsAdmin(isAdminUser);
    } catch (error) {
      console.error('Error checking user status:', EnhancedSecurityService.cleanSensitiveData(error));
      setIsApproved(false);
      setUserStatus(null);
      setIsAdmin(false);
    }
  };
  
  const signOut = async () => {
    await AuthSecurityService.secureSignOut();
  };

  const secureSignIn = async (email: string, password: string) => {
    return await AuthSecurityService.secureSignIn(email, password);
  };

  const secureSignUp = async (email: string, password: string, firstName: string, lastName: string, phone?: string) => {
    return await AuthSecurityService.secureSignUp(email, password, firstName, lastName, phone);
  };

  const value: AuthContextType = {
    supabaseClient: supabase,
    session,
    user,
    isLoading,
    isAdmin,
    isApproved,
    userStatus,
    signOut,
    secureSignIn,
    secureSignUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
