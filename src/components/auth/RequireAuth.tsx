
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface RequireAuthProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function RequireAuth({ children, requireAdmin = false }: RequireAuthProps) {
  const { user, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
