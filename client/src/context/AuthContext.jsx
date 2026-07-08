import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Configure default base URL dynamically (pointing to backend port 5000 in dev, or relative in production)
const API_BASE_URL = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Authenticate user on startup
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/auth/session');
      setUser(res.data.user);
      setEmployee(res.data.employee);
      setError(null);
    } catch (err) {
      // Session check fails if no token, which is normal on first visit
      setUser(null);
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log in user
   * @param {string} email
   * @param {string} password
   */
  const login = async (email, password) => {
    try {
      setError(null);
      const res = await axios.post('/auth/login', { email, password });
      setUser(res.data.user);
      setEmployee(res.data.employee);
      
      // Store token in localStorage as fallback (for non-cookie header authorization support)
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      }
      
      return res.data;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  /**
   * Log out user
   */
  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API call failed:', err.message);
    } finally {
      setUser(null);
      setEmployee(null);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Sync token on mount in case it is stored in localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        employee,
        loading,
        error,
        login,
        logout,
        checkSession,
        setUser,
        setEmployee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
