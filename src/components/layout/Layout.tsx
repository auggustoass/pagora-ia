
import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/components/auth/AuthProvider';
import { Navigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

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
  
  if (requireAuth && !user && !isLoading) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className={`flex-1 ${isMobile ? 'p-3' : 'p-6 md:p-8'} overflow-auto scrollbar-thin`}>
          {children}
        </main>
      </div>
    </div>
  );
}
