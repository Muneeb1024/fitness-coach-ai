import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('fitness_auth_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await API.get('/auth/me');
        setUser(res.data.user);

        // Silently rotate the token if the backend issued a fresh one
        if (res.data.token && res.data.token !== token) {
          localStorage.setItem('fitness_auth_token', res.data.token);
          setToken(res.data.token);
        }
      } catch (err) {
        // The response interceptor in api.js already handles 401 logout + redirect.
        // Just clear state here in case the error is non-401.
        console.error('[Auth Init Error]', err.response?.status, err.message);
        if (err.response?.status !== 401) {
          // Non-auth error (network down etc.) — don't log out, just stop loading
          setLoading(false);
          return;
        }
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []); // Run once on mount — token rotation doesn't re-trigger this

  const login = (userData, authToken) => {
    localStorage.setItem('fitness_auth_token', authToken);
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('fitness_auth_token');
    setToken('');
    setUser(null);
  };

  const updateUserState = (updatedFields) => {
    setUser((prev) => ({ ...prev, ...updatedFields }));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUserState, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
