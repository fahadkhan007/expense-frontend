import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Tag, Wallet, BarChart2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/transactions', icon: ArrowLeftRight,  label: 'Transactions' },
  { to: '/categories',   icon: Tag,             label: 'Categories'   },
  { to: '/budgets',      icon: Wallet,          label: 'Budgets'      },
  { to: '/reports',      icon: BarChart2,       label: 'Reports'      },
];

export default function Sidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <Icon size={16} className="nav-icon" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item" onClick={() => { signOut(); navigate('/login'); }}>
          <LogOut size={15} className="nav-icon" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
