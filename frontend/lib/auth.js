'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api';

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' && window.localStorage.getItem('omega.token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then((data) => setUser(data.user))
      .catch(() => {
        window.localStorage.removeItem('omega.token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.login({ email, password });
    window.localStorage.setItem('omega.token', data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const signup = useCallback(async (payload) => {
    const data = await api.signup(payload);
    window.localStorage.setItem('omega.token', data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem('omega.token');
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    const data = await api.me();
    setUser(data.user);
    return data.user;
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refresh, isAdmin, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
