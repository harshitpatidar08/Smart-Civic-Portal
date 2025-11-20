import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  registerUser: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('scp_token');
    if (!token) {
      setLoading(false);
      return;
    }

    authAPI
      .profile()
      .then(({ data }) => {
        setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem('scp_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    localStorage.setItem('scp_token', data.token);
    setUser(data.user);
    toast.success('Welcome back!');
    return data.user;
  };

  const registerUser = async (payload) => {
    const { data } = await authAPI.register(payload);
    localStorage.setItem('scp_token', data.token);
    setUser(data.user);
    toast.success('Account created!');
    return data.user;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // ignore best-effort logout
    } finally {
      localStorage.removeItem('scp_token');
      setUser(null);
      toast.success('Logged out');
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      registerUser,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

