
import React, { useEffect } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/components/auth/AuthProvider';
import { Navigate, useSearchParams } from 'react-router-dom';

const Auth = () => {
  const { user, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab');

  // If user is already logged in, redirect to dashboard
  if (user && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background bg-grid">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/5 rounded-full filter blur-[120px]" />
      </div>
      <div className="w-full max-w-md z-10">
        <AuthForm initialTab={activeTab === 'signup' ? 'signup' : 'login'} />
      </div>
    </div>
  );
}

export default Auth;
