'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api';
import { getSocket, disconnectSocket } from './socket';

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
  const [adminSessionReady, setAdminSessionReady] = useState(false);

  const clearAdminSession = useCallback(() => {
    window.localStorage.removeItem('omega.adminToken');
    window.localStorage.removeItem('omega.adminTokenExpiresAt');
    setAdminSessionReady(false);
  }, []);

  const restoreAdminSession = useCallback(() => {
    const token = window.localStorage.getItem('omega.adminToken');
    const expiresAt = Number(window.localStorage.getItem('omega.adminTokenExpiresAt') || 0);
    const valid = Boolean(token && expiresAt && expiresAt > Date.now() + 5000);
    if (!valid) clearAdminSession();
    else setAdminSessionReady(true);
    return valid;
  }, [clearAdminSession]);

  useEffect(() => {
    const token = typeof window !== 'undefined' && window.localStorage.getItem('omega.token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then((data) => {
        setUser(data.user);
        restoreAdminSession();
        getSocket(); // restore WS for already-signed-in sessions
      })
      .catch(() => {
        window.localStorage.removeItem('omega.token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [restoreAdminSession]);

  useEffect(() => {
    const onExpired = () => setAdminSessionReady(false);
    window.addEventListener('omega:admin-session-expired', onExpired);
    return () => window.removeEventListener('omega:admin-session-expired', onExpired);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.login({ email, password });
    window.localStorage.setItem('omega.token', data.token);
    clearAdminSession();
    setUser(data.user);
    setTimeout(() => getSocket(), 0); // open the WS after token is persisted
    return data.user;
  }, [clearAdminSession]);

  const signup = useCallback(async (payload) => {
    const data = await api.signup(payload);
    window.localStorage.setItem('omega.token', data.token);
    clearAdminSession();
    setUser(data.user);
    setTimeout(() => getSocket(), 0);
    return data.user;
  }, [clearAdminSession]);

  const logout = useCallback(() => {
    window.localStorage.removeItem('omega.token');
    clearAdminSession();
    disconnectSocket();
    setUser(null);
  }, [clearAdminSession]);

  const startAdminSession = useCallback(async (password) => {
    const data = await api.startAdminSession(password);
    const expiresAt = Date.now() + ((data.expiresInSeconds || 1800) * 1000);
    window.localStorage.setItem('omega.adminToken', data.adminToken);
    window.localStorage.setItem('omega.adminTokenExpiresAt', String(expiresAt));
    setAdminSessionReady(true);
    return data;
  }, []);

  const refresh = useCallback(async () => {
    const data = await api.me();
    setUser(data.user);
    return data.user;
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      signup,
      logout,
      refresh,
      isAdmin,
      setUser,
      adminSessionReady,
      startAdminSession,
      clearAdminSession,
      restoreAdminSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
