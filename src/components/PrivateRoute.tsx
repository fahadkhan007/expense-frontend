import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

/**
 * Wraps protected routes.
 * - While auth is initializing  → show full-page spinner (no flash redirect)
 * - Unauthenticated             → redirect to /login, preserving the intended path
 * - Authenticated               → render children
 */
export default function PrivateRoute() {
  const { token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Spinner />;

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
