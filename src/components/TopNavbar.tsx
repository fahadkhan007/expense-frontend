import { TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TopNavbar() {
  const { user } = useAuth();
  const initials = user?.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  return (
    <header className="top-navbar">
      {/* Brand section — aligns with sidebar width */}
      <div className="top-navbar-brand">
        <div className="top-navbar-logo">
          <TrendingUp size={15} color="#fff" />
        </div>
        <span className="top-navbar-app-name">ExpenseTracker</span>
      </div>

      {/* Right section */}
      <div className="top-navbar-right">
        <div className="top-navbar-user">
          <div className="top-navbar-avatar">{initials}</div>
          <span>{user?.name}</span>
        </div>
      </div>
    </header>
  );
}
