import React, { createContext, useContext, useState, useEffect } from 'react';
import { validateAdmin } from '../utils/localStorage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const savedAdmin = localStorage.getItem('festival_current_admin');
    if (savedAdmin) {
      try {
        const adminData = JSON.parse(savedAdmin);
        setAdmin(adminData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved admin data:', error);
        localStorage.removeItem('festival_current_admin');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const adminData = validateAdmin(username, password);
      if (adminData) {
        setAdmin(adminData);
        setIsAuthenticated(true);
        localStorage.setItem('festival_current_admin', JSON.stringify(adminData));
        return { success: true };
      } else {
        return { success: false, error: 'Invalid username or password' };
      }
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    setAdmin(null);
    setIsAuthenticated(false);
    localStorage.removeItem('festival_current_admin');
  };

  const value = {
    isAuthenticated,
    admin,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
