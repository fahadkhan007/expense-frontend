import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;

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
