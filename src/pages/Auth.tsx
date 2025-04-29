
import React from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/components/auth/AuthProvider';
import { Navigate } from 'react-router-dom';

const Auth = () => {
  const { user, isLoading } = useAuth();

  // If user is already logged in, redirect to home
  if (user && !isLoading) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-grid">
      <div className="w-full max-w-md">
        <AuthForm />
      </div>
    </div>
  );
};

export default Auth;
