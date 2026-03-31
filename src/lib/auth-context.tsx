import { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, mockUsers } from './mock-data';

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole) => {
    const found = mockUsers.find(u => u.role === role);
    if (found) setUser(found);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
