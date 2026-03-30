import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

// Safe JSON parse helper — Bug 3 fix
const safeParseUser = () => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem('user'); // Clear corrupted data
    return null;
  }
};

// Check if JWT token is expired — Bug 2 fix
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const storedToken = localStorage.getItem('token');

  // Bug 2 fix — clear expired token on load
  const [user, setUser] = useState(() => {
    if (isTokenExpired(storedToken)) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
    return safeParseUser();
  });

  const [token, setToken] = useState(() => {
    return isTokenExpired(storedToken) ? null : storedToken;
  });

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', tokenData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};