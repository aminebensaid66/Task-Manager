import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publicSignupEnabled, setPublicSignupEnabled] = useState(true);

  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      const [configResult, meResult] = await Promise.allSettled([
        api.get('/auth/config'),
        api.get('/auth/me'),
      ]);
      if (!active) return;
      if (configResult.status === 'fulfilled') {
        setPublicSignupEnabled(Boolean(configResult.value.data.publicSignupEnabled));
      }
      if (meResult.status === 'fulfilled') setUser(meResult.value.data);
      setLoading(false);
    };
    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      publicSignupEnabled,
      async login(credentials) {
        const { data } = await api.post('/auth/login', credentials);
        setUser(data.user);
        return data.user;
      },
      async signup(credentials) {
        const { data } = await api.post('/auth/signup', credentials);
        setUser(data.user);
        return data.user;
      },
      async logout() {
        try {
          await api.post('/auth/logout');
        } finally {
          setUser(null);
        }
      },
      async refreshUser() {
        const { data } = await api.get('/auth/me');
        setUser(data);
        return data;
      },
    }),
    [loading, publicSignupEnabled, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
};
