import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'var(--bg)',
          color: 'var(--text)',
        }}
      >
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'var(--bg)',
          color: 'var(--text)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h1>Access Denied</h1>
          <p>You do not have permission to access this page.</p>
          <p>Only administrators can access the Admin Panel.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
