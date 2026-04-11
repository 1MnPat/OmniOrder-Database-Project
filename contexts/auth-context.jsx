'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiPublic } from '@/lib/api-client';

const AuthContext = createContext(null);

const STORAGE_KEY = 'nexus_token';
const ROLE_KEY = 'nexus_role';
const NAME_KEY = 'nexus_name';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [name, setName] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const t = localStorage.getItem(STORAGE_KEY);
      const r = localStorage.getItem(ROLE_KEY);
      const n = localStorage.getItem(NAME_KEY);
      if (t) setToken(t);
      if (r) setRole(r);
      if (n) setName(n);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const persist = useCallback((t, r, n) => {
    setToken(t);
    setRole(r);
    setName(n);
    try {
      if (t) {
        localStorage.setItem(STORAGE_KEY, t);
        localStorage.setItem(ROLE_KEY, r || '');
        localStorage.setItem(NAME_KEY, n || '');
      } else {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(ROLE_KEY);
        localStorage.removeItem(NAME_KEY);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const login = useCallback(
    async (email, password) => {
      const data = await apiPublic('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      persist(data.token, data.role, data.name);
      return data;
    },
    [persist]
  );

  const register = useCallback(
    async (payload) => {
      await apiPublic('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiPublic('/api/auth/logout', { method: 'POST', body: '{}' });
    } catch {
      /* ignore */
    }
    persist(null, null, null);
  }, [persist]);

  const value = useMemo(
    () => ({
      token,
      role,
      name,
      ready,
      isAuthenticated: Boolean(token),
      isCustomer: role === 'customer',
      isAdmin: role === 'admin',
      login,
      register,
      logout,
    }),
    [token, role, name, ready, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
