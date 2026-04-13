import React, { createContext, useContext, useState, useEffect } from 'react';

type User = {
  email: string;
  role: 'admin' | 'user';
} | null;

type AuthContextType = {
  user: User;
  login: (email: string, passkey: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    // Check local storage on mount
    const stored = localStorage.getItem('qb_mock_auth');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = (email: string, passkey: string) => {
    if (email === 'dev@qb.com' && passkey === '1234') {
      const adminUser: User = { email, role: 'admin' };
      setUser(adminUser);
      localStorage.setItem('qb_mock_auth', JSON.stringify(adminUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('qb_mock_auth');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
