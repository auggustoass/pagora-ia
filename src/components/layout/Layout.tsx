
import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/components/auth/AuthProvider';
import { Navigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { OnboardingTutorial } from '@/components/onboarding/OnboardingTutorial';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

// Create a key for localStorage to track tutorial state
const TUTORIAL_SHOWN_KEY = 'hblackpix_tutorial_shown';

export function Layout({
  children,
  requireAuth = true
}: LayoutProps) {
  const { user, isLoading } = useAuth();
  const isMobile = useIsMobile();
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialChecked, setTutorialChecked] = useState(false);
  
  useEffect(() => {
    // Check if this is user's first login
    const checkFirstLogin = async () => {
      if (!user || tutorialChecked) return;
      
      // Check if tutorial has been shown already in this session/browser
      const tutorialShown = localStorage.getItem(TUTORIAL_SHOWN_KEY) === 'true';
      if (tutorialShown) {
        setTutorialChecked(true);
        return;
      }
      
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
        }
        
        setTutorialChecked(true);
      } catch (error) {
        console.error('Error in checkFirstLogin:', error);
      }
    };
    
    if (user && !isLoading) {
      checkFirstLogin();
    }
  }, [user, isLoading, tutorialChecked]);
  
  // Function to handle tutorial close that can be passed to the OnboardingTutorial
  const handleTutorialClose = () => {
    setShowTutorial(false);
    // Save to localStorage to remember across page navigation
    localStorage.setItem(TUTORIAL_SHOWN_KEY, 'true');
  };
  
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
      
      {showTutorial && <OnboardingTutorial onClose={handleTutorialClose} />}
    </div>
  );
}
