import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API = process.env.REACT_APP_API_URL || '';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('fd_token');
    const storedUser = localStorage.getItem('fd_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      // Set default axios header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }

    setLoading(false);
  }, []);

  // Register function
  const register = async (name, email, password, role = 'viewer', adminCode = '') => {
    try {
      const response = await axios.post(`${API}/api/auth/register`, {
        name,
        email,
        password,
        role,
        adminCode,
      });

      const { token: newToken, user: newUser } = response.data;

      // Save to localStorage
      localStorage.setItem('fd_token', newToken);
      localStorage.setItem('fd_user', JSON.stringify(newUser));

      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      // Update state
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  };

  // Login function
  const login = async (email, password, expectedRole = null) => {
    try {
      const response = await axios.post(`${API}/api/auth/login`, {
        email,
        password,
      });

      const { token: newToken, user: newUser } = response.data;

      if (expectedRole && newUser.role !== expectedRole) {
        throw new Error(
          expectedRole === 'admin'
            ? 'This is not an admin account.'
            : 'This account is not a viewer account.'
        );
      }

      // Save to localStorage
      localStorage.setItem('fd_token', newToken);
      localStorage.setItem('fd_user', JSON.stringify(newUser));

      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      // Update state
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('fd_token');
    localStorage.removeItem('fd_user');

    // Remove axios default header
    delete axios.defaults.headers.common['Authorization'];

    // Update state
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user function
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('fd_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
