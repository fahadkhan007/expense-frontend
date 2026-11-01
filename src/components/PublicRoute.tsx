import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

/**
 * Wraps public-only routes (login, register).
 * - While auth is initializing  → show full-page spinner
 * - Already authenticated       → redirect straight to dashboard
 * - Not authenticated           → render the public page
 */
export default function PublicRoute() {
  const { token, isLoading } = useAuth();

  if (isLoading) return <Spinner />;
  if (token) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
