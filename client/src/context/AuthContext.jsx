import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('novelle-user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('novelle-theme') || 'light';
  });

  const [isLoading, setIsLoading] = useState(true);

  // Apply theme to body
  useEffect(() => {
    localStorage.setItem('novelle-theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [theme]);

  // Verify token on mount
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('novelle-token');
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data);
          localStorage.setItem('novelle-user', JSON.stringify(data));
        } catch (error) {
          console.error("Token verification failed", error);
          logout();
        }
      }
      setIsLoading(false);
    };
    verifyUser();
  }, []);

  const login = async (email, password, rememberMe) => {
    const { data } = await api.post('/auth/login', { email, password, rememberMe });
    localStorage.setItem('novelle-token', data.token);
    localStorage.setItem('novelle-user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (full_name, email, password) => {
    const { data } = await api.post('/auth/register', { full_name, email, password });
    localStorage.setItem('novelle-token', data.token);
    localStorage.setItem('novelle-user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('novelle-token');
    localStorage.removeItem('novelle-user');
    setUser(null);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
