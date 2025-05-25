
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface RequireAuthProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export function RequireAuth({ children, requireAdmin = false, redirectTo = "/auth" }: RequireAuthProps) {
  const { user, isLoading, isAdmin, isApproved, userStatus } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if user is approved (unless they are admin)
  if (!isAdmin && !isApproved) {
    // If user is rejected, redirect to auth
    if (userStatus === 'rejected') {
      return <Navigate to="/auth?tab=login&rejected=true" state={{ from: location }} replace />;
    }
    // If user is pending, redirect to pending approval page
    if (userStatus === 'pending') {
      return <Navigate to="/pending-approval" state={{ from: location }} replace />;
    }
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
