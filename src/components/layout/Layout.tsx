
import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/components/auth/AuthProvider';
import { Navigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { OnboardingTutorial } from '@/components/onboarding/OnboardingTutorial';
import { supabase } from '@/integrations/supabase/client';
import { useCredits } from '@/hooks/use-credits';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function Layout({
  children,
  requireAuth = true
}: LayoutProps) {
  const { user, isLoading } = useAuth();
  const isMobile = useIsMobile();
  const [showTutorial, setShowTutorial] = useState(false);
  const { addFreeCredit } = useCredits();
  
  useEffect(() => {
    // Check if this is user's first login
    const checkFirstLogin = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_login')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error checking first login:', error);
          return;
        }
        
        if (data && data.first_login) {
          setShowTutorial(true);
          
          // Add free credit for new user
          await addFreeCredit();
        }
      } catch (error) {
        console.error('Error in checkFirstLogin:', error);
      }
    };
    
    if (user && !isLoading) {
      checkFirstLogin();
    }
  }, [user, isLoading]);
  
  if (requireAuth && !user && !isLoading) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className={cn(
        "flex-1 flex flex-col",
        isMobile ? "ml-20" : "ml-60"
      )}>
        <Header />
        <main className={`flex-1 ${isMobile ? 'p-3' : 'p-6 md:p-8'} overflow-auto scrollbar-thin`}>
          {children}
        </main>
      </div>
      
      {showTutorial && <OnboardingTutorial />}
    </div>
  );
}

// Add the missing cn import to Layout.tsx
import { cn } from '@/lib/utils';
