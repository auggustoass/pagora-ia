import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Session,
  useSession,
  useSupabaseClient,
} from '@supabase/auth-helpers-react';
import { Database } from '@/integrations/supabase/types';

type AuthContextType = {
  supabaseClient: any;
  session: Session | null;
  user: any | null;
  isLoading: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabaseClient = useSupabaseClient<Database>();
  const session = useSession();
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        if (session?.user) {
          setUser(session.user);

          // Fetch user roles from the database
          const { data: roles, error } = await supabaseClient
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id);

          if (error) {
            console.error('Error fetching user roles:', error);
            setIsAdmin(false);
          } else {
            // Check if the user has the 'admin' role
            const isAdminUser = roles?.some(role => role.role === 'admin');
            setIsAdmin(isAdminUser);
          }
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [session, supabaseClient]);

  const value: AuthContextType = {
    supabaseClient,
    session,
    user,
    isLoading,
    isAdmin,
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
