import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // Listen for 401 events fired by the axios interceptor.
  // Using navigate() here keeps it inside React Router — no hard reload.
  useEffect(() => {
    const handler = () => {
      signOut();
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, [navigate, signOut]);

  return (
    <div className="app-layout">
      <TopNavbar />
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
