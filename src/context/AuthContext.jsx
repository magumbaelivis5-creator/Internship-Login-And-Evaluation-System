import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      auth.me().then(res => setUser(res.data)).catch(() => {
        localStorage.removeItem('token');
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const res = await auth.login(credentials);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await auth.register(data);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try { await auth.logout(); } catch {}
    localStorage.removeItem('token');
    setUser(null);
  };

  const role = user?.profile?.role || 'student';

  return (
    <AuthContext.Provider value={{ user, role, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
