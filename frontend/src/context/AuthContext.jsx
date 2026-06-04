import { createContext, useContext, useEffect, useState } from 'react';
import { api, setAuthToken } from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(({ user: u }) => setUser(u))
      .catch(() => setAuthToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { token, user: u } = await api.login({ email, password });
    setAuthToken(token);
    setUser(u);
    return u;
  };

  const register = async (data) => {
    const { token, user: u } = await api.register(data);
    setAuthToken(token);
    setUser(u);
    return u;
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const { user: u } = await api.me();
    setUser(u);
    return u;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
