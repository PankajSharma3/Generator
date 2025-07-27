import { createContext, useContext, useEffect, useState } from 'react';
import { setAuthToken } from '../api.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) setAuthToken(token);
  }, [token]);

  const login = (t) => {
    localStorage.setItem('token', t);
    setToken(t);
    setAuthToken(t);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setAuthToken(null);
  };

  return <AuthContext.Provider value={{ token, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);