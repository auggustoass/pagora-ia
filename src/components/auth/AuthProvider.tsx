
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

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
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    // Set up authentication state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      // Check for events that indicate a new registration
      if (event === 'SIGNED_IN' && !session) {
        // This potentially indicates a new sign in
        // We'll check if this is a new user in the getInitialSession function
      }
      
      // Check for admin role and approval status when session changes
      if (newSession?.user) {
        checkUserStatus(newSession.user.id);
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
            setIsNewUser(true);
            
            // Mark that the user has logged in
            await supabase
              .from('profiles')
              .update({ first_login: false })
              .eq('id', initialSession.user.id);
              
            // Show welcome toast only for approved users
            if (profileData.approved) {
              toast.info('Recebeu 10 créditos gratuitos para começar a usar o sistema.');
            }
          }
          
          await checkUserStatus(initialSession.user.id);
        }
      } catch (error) {
        console.error('Error fetching initial session:', error);
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
      // Check user profile for approval status
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('approved, status')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
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
        console.error('Error fetching user roles:', rolesError);
        setIsAdmin(false);
        return;
      }

      // Check if the user has the 'admin' role
      const isAdminUser = roles?.some(role => role.role === 'admin');
      setIsAdmin(isAdminUser);
    } catch (error) {
      console.error('Error checking user status:', error);
      setIsApproved(false);
      setUserStatus(null);
      setIsAdmin(false);
    }
  };
  
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
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
    signOut: async () => {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Error signing out:', error);
      }
    },
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
