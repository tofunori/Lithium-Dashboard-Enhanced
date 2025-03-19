import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  
  // Load dark mode preference from localStorage
  React.useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      setDarkMode(true);
    }
  }, []);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };
  
  // Check if user is authenticated
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.get('/api/user/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Login
  const login = async (username, password) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await axios.post('/api-token-auth/', {
        username,
        password
      });
      
      const { token } = response.data;
      localStorage.setItem('token', token);
      
      // Get user data
      const userResponse = await axios.get('/api/user/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      setUser(userResponse.data);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.non_field_errors?.[0] || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };
  
  // Get auth header for API requests
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Token ${token}` } : {};
  };
  
  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    darkMode,
    login,
    logout,
    checkAuth,
    getAuthHeader,
    toggleDarkMode
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);