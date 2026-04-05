import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Dashboard from '../dashboard/Dashboard';
import Transactions from '../transactions/Transactions';
import Insights from '../insights/Insights';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'transactions', label: 'Transactions', icon: '⇄' },
  { id: 'insights', label: 'Insights', icon: '◎' },
];

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  transactions: 'Transactions',
  insights: 'Insights & Analytics',
};

export default function Layout({ children }) {
  const { state, dispatch } = useApp();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const setTab = (tab) => {
    dispatch({ type: 'SET_TAB', payload: tab });
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAdminPanel = () => {
    navigate('/admin');
    setSidebarOpen(false);
  };

  const renderPage = () => {
    if (children) {
      return children;
    }

    switch (state.activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'transactions': return <Transactions />;
      case 'insights': return <Insights />;
      default: return <Dashboard />;
    }
  };

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U';

  return (
    <div className="app-layout">
      {/* Sidebar overlay for mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">💹</div>
          <div className="logo-text">
            FinTrack
            <span>Finance Dashboard</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${state.activeTab === item.id ? 'active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}

          {user?.role === 'admin' && (
            <button
              className="nav-item"
              onClick={handleAdminPanel}
            >
              <span className="nav-icon">⚙️</span>
              Admin Panel
            </button>
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-info">
            <div className="user-avatar">{initials}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
              <div className="user-role">
                <span className={`role-badge ${user?.role}`}>
                  {user?.role === 'admin' ? '👑' : '👁'} {user?.role}
                </span>
              </div>
            </div>
          </div>

          <button
            className="btn btn-logout"
            onClick={handleLogout}
            style={{ width: '100%', marginTop: '12px' }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <h1 className="page-title">
              {PAGE_TITLES[state.activeTab] || 'Admin Panel'}
            </h1>
          </div>

          <div className="topbar-actions">
            <button
              className="icon-btn"
              onClick={() => dispatch({ type: 'TOGGLE_DARK' })}
              title={state.darkMode ? 'Light mode' : 'Dark mode'}
            >
              {state.darkMode ? '☀️' : '🌙'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {initials}
              </div>
            </div>
          </div>
        </header>

        <main className="page-content">{renderPage()}</main>
      </div>
    </div>
  );
}
