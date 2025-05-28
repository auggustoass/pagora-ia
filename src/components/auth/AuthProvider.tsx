
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { SecurityService } from '@/services/SecurityService';

type AuthContextType = {
  supabaseClient: typeof supabase;
  session: Session | null;
  user: any | null;
  isLoading: boolean;
  isAdmin: boolean;
  isApproved: boolean;
  userStatus: 'pending' | 'approved' | 'rejected' | null;
  signOut: () => Promise<void>;
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
    // Set up authentication state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      // Check for admin role and approval status when session changes
      if (newSession?.user) {
        setTimeout(() => {
          checkUserStatus(newSession.user.id);
        }, 0);
      } else {
        setIsAdmin(false);
        setIsApproved(false);
        setUserStatus(null);
      }
    });

    // Check for existing session
    const getInitialSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          // Check for first login to identify new users
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_login, approved, status')
            .eq('id', initialSession.user.id)
            .maybeSingle();
            
          // If first_login is true, this is a new user
          if (profileData && profileData.first_login === true) {
            // Mark that the user has logged in
            await supabase
              .from('profiles')
              .update({ first_login: false })
              .eq('id', initialSession.user.id);
              
            // Show welcome toast only for approved users
            if (profileData.approved) {
              toast({
                title: "Bem-vindo!",
                description: "Recebeu 10 créditos gratuitos para começar a usar o sistema."
              });
            }
          }
          
          await checkUserStatus(initialSession.user.id);
        }
      } catch (error) {
        console.error('Error fetching initial session:', SecurityService.cleanSensitiveData(error));
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Cleanup subscription
    return () => {
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
        .select('approved, status')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', SecurityService.cleanSensitiveData(profileError));
        setIsApproved(false);
        setUserStatus(null);
        return;
      }

      setIsApproved(profileData.approved);
      setUserStatus(profileData.status);

      // Check admin role
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) {
        console.error('Error fetching user roles:', SecurityService.cleanSensitiveData(rolesError));
        setIsAdmin(false);
        return;
      }

      // Check if the user has the 'admin' role
      const isAdminUser = roles?.some(role => role.role === 'admin');
      setIsAdmin(isAdminUser);
    } catch (error) {
      console.error('Error checking user status:', SecurityService.cleanSensitiveData(error));
      setIsApproved(false);
      setUserStatus(null);
      setIsAdmin(false);
    }
  };
  
  const signOut = async () => {
    try {
      // Clear any sensitive data from localStorage
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.includes('token') || key.includes('auth') || key.includes('session')
      );
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      await supabase.auth.signOut({ scope: 'global' });
    } catch (error) {
      console.error('Error signing out:', SecurityService.cleanSensitiveData(error));
    }
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
