import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  MessageCircle,
  ClipboardList,
  Bell,
  FileText,
  User,
  Activity,
  LogOut,
  X,
  Stethoscope,
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/chat', icon: MessageCircle, label: 'AI Consultation' },
    { path: '/consultations', icon: ClipboardList, label: 'My Consultations' },
    { path: '/reminders', icon: Bell, label: 'Reminders' },
    { path: '/reports', icon: FileText, label: 'Health Reports' },
    { path: '/health-summary', icon: Activity, label: 'Health Summary' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="sidebar-header">
        <div className="logo">
          <Stethoscope size={32} className="logo-icon" aria-hidden="true" />
          <span className="logo-text">DermaCare</span>
        </div>
        <button className="close-btn mobile-only" onClick={onClose} aria-label="Close navigation menu">
          <X size={24} aria-hidden="true" />
        </button>
      </div>

      <div className="user-info">
        <div className="user-avatar" aria-hidden="true">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div className="user-details">
          <p className="user-name">{user?.firstName} {user?.lastName}</p>
          <p className="user-email">{user?.email}</p>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Primary">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
            onClick={onClose}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
