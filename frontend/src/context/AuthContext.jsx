import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('gvmc_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('gvmc_admin_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('gvmc_admin_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.success && res.admin) {
            setAdmin(res.admin);
            localStorage.setItem('gvmc_admin_user', JSON.stringify(res.admin));
          }
        } catch (err) {
          console.warn('Session verification failed, logging out.');
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    if (res.success) {
      setToken(res.token);
      setAdmin(res.admin);
      localStorage.setItem('gvmc_admin_token', res.token);
      localStorage.setItem('gvmc_admin_user', JSON.stringify(res.admin));
      return { success: true };
    }
    return { success: false, message: res.message || 'Login failed' };
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('gvmc_admin_token');
    localStorage.removeItem('gvmc_admin_user');
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
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
