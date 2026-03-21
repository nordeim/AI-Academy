/**
 * ProtectedRoute Component
 *
 * Auth guard wrapper that redirects unauthenticated users to login
 * Phase 6E - Task 6E.1
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useIsAuthenticated } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login while saving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
