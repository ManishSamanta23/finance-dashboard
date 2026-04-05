import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import styles from './AdminPanel.module.css';

const AdminPanel = () => {
  const { user: currentUser, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Configure axios with token
  const getHeaders = useCallback(() => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }), [token]);

  // Fetch admin data
  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/admin/stats`, { headers: getHeaders() }),
        axios.get(`http://localhost:5000/api/admin/users`, { headers: getHeaders() }),
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
      setError('');
    } catch (err) {
      console.error('Admin data fetch error:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to fetch admin data. Make sure backend is running on http://localhost:5000'
      );
    } finally {
      setLoading(false);
    }
  }, [token, getHeaders]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/role`, 
        { role: newRole },
        { headers: getHeaders() }
      );
      setSuccessMessage(`User role updated to ${newRole}`);
      fetchData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/status`, 
        { isActive: newStatus },
        { headers: getHeaders() }
      );
      setSuccessMessage(
        `User status updated to ${newStatus ? 'Active' : 'Inactive'}`
      );
      fetchData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(
        'Are you sure you want to delete this user? This action cannot be undone.'
      )
    ) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, 
          { headers: getHeaders() }
        );
        setSuccessMessage('User deleted successfully');
        fetchData();
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.adminPanel}>
        <div className={styles.loadingContainer}>Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className={styles.adminPanel}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <p className={styles.subtitle}>Manage users and view statistics</p>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {successMessage && (
        <div className={styles.successMessage}>{successMessage}</div>
      )}

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === 'overview' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'users' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
      </div>

      {activeTab === 'overview' && stats && (
        <div className={styles.overviewSection}>
          <h2 className={styles.sectionTitle}>Statistics</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Total Users</div>
              <div className={styles.statValue}>{stats.totalUsers}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Active Users</div>
              <div className={styles.statValue}>{stats.activeUsers}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Total Transactions</div>
              <div className={styles.statValue}>{stats.totalTransactions}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Net Balance</div>
              <div className={`${styles.statValue} ${stats.netBalance >= 0 ? styles.positive : styles.negative}`}>
                ${stats.netBalance.toFixed(2)}
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Total Income</div>
              <div className={`${styles.statValue} ${styles.positive}`}>
                ${stats.totalIncome.toFixed(2)}
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Total Expenses</div>
              <div className={`${styles.statValue} ${styles.negative}`}>
                ${stats.totalExpenses.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className={styles.usersSection}>
          <h2 className={styles.sectionTitle}>User Management ({users.length})</h2>
          {users.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
              No users found
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u._id}
                      className={u._id === currentUser?.id ? styles.currentUserRow : ''}
                    >
                      <td className={styles.nameCell}>
                        <div className={styles.userName}>{u.name}</div>
                        {u._id === currentUser?.id && (
                          <span className={styles.badge}>You</span>
                        )}
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span
                          className={`${styles.roleBadge} ${
                            u.role === 'admin' ? styles.adminBadge : styles.viewerBadge
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${
                            u.isActive ? styles.activeBadge : styles.inactiveBadge
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.actionButton}
                            onClick={() =>
                              handleRoleChange(
                                u._id,
                                u.role === 'admin' ? 'viewer' : 'admin'
                              )
                            }
                            disabled={u._id === currentUser?.id}
                            title={
                              u._id === currentUser?.id
                                ? 'Cannot change your own role'
                                : 'Change role'
                            }
                          >
                            {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                          </button>
                          <button
                            className={styles.actionButton}
                            onClick={() =>
                              handleStatusChange(u._id, !u.isActive)
                            }
                            disabled={u._id === currentUser?.id}
                            title={
                              u._id === currentUser?.id
                                ? 'Cannot change your own status'
                                : 'Toggle status'
                            }
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => handleDeleteUser(u._id)}
                            disabled={u._id === currentUser?.id}
                            title={
                              u._id === currentUser?.id
                                ? 'Cannot delete yourself'
                                : 'Delete user'
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
