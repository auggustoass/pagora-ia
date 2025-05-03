
import { useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from '@/components/auth/AuthProvider';

const NotFound = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Redirect to dashboard if logged in, otherwise to auth page
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/auth" replace />;
};

export default NotFound;
