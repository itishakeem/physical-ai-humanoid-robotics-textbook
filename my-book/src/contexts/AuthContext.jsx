// AuthContext.jsx - Authentication state management
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [apiUrl, setApiUrl] = useState('http://127.0.0.1:8000/api/auth');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set API URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isProduction = window.location.hostname.includes('github.io');
      setApiUrl(isProduction
        ? 'https://physical-ai-humanoid-robotics-textbook-bgc0.onrender.com/api/auth'
        : 'http://127.0.0.1:8000/api/auth'
      );
    }
  }, []);

  useEffect(() => {
    // Check for existing auth on mount
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
        // Verify token is still valid
        verifyToken(storedToken);
      } catch (e) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const verifyToken = async (tokenToVerify) => {
    // Get the correct API URL at call time
    const isProduction = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
    const currentApiUrl = isProduction
      ? 'https://physical-ai-humanoid-robotics-textbook-bgc0.onrender.com/api/auth'
      : 'http://127.0.0.1:8000/api/auth';

    try {
      const response = await fetch(`${currentApiUrl}/me`, {
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`
        }
      });

      if (!response.ok) {
        throw new Error('Token invalid');
      }

      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      logout();
    }
  };

  const login = (authToken, userData) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

