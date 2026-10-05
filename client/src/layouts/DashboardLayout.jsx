import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  Store,
  Star,
  KeyRound,
  LogOut,
  Menu,
  X,
  Shield,
  User as UserIcon,
  Store as StoreIcon,
} from 'lucide-react';
import { logout } from '../slices/authSlice';
import { useToast } from '../hooks/useToast';

export const DashboardLayout = ({ children, title = 'Dashboard' }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Determine navigation items by user role
  const getNavLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case 'ADMIN':
        return [
          { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
          { to: '/admin/users', label: 'Users Management', icon: Users },
          { to: '/admin/stores', label: 'Stores Management', icon: Store },
          { to: '/profile/change-password', label: 'Change Password', icon: KeyRound },
        ];
      case 'STORE_OWNER':
        return [
          { to: '/owner/dashboard', label: 'Store Overview', icon: LayoutDashboard },
          { to: '/owner/ratings', label: 'Customer Ratings', icon: Star },
          { to: '/profile/change-password', label: 'Change Password', icon: KeyRound },
        ];
      case 'USER':
      default:
        return [
          { to: '/stores', label: 'Browse & Rate Stores', icon: Store },
          { to: '/profile/change-password', label: 'Change Password', icon: KeyRound },
        ];
    }
  };

  const navLinks = getNavLinks();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="badge badge-admin"><Shield size={12} /> Admin</span>;
      case 'STORE_OWNER':
        return <span className="badge badge-owner"><StoreIcon size={12} /> Store Owner</span>;
      case 'USER':
      default:
        return <span className="badge badge-user"><UserIcon size={12} /> Normal User</span>;
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-badge">R</div>
          <div>
            <div className="brand-title">ROXILER</div>
            <div className="brand-subtitle">Store Rating Platform</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Navigation</div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer with current user profile */}
        <div className="sidebar-footer">
          <div className="user-profile-pill">
            <div className="user-avatar-circle">
              {getUserInitials(user?.name)}
            </div>
            <div className="user-pill-info">
              <div className="user-pill-name" title={user?.name}>
                {user?.name || 'User'}
              </div>
              <div className="user-pill-role">
                {user?.role === 'ADMIN'
                  ? 'Administrator'
                  : user?.role === 'STORE_OWNER'
                  ? 'Store Owner'
                  : 'Normal User'}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="nav-item"
            style={{ width: '100%', marginTop: 10, justifyContent: 'flex-start' }}
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{title}</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {getRoleBadge(user?.role)}
          </div>
        </header>

        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
