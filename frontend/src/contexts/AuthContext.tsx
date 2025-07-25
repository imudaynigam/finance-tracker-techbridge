import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type UserRole = 'admin' | 'user' | 'read-only';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (action: 'read' | 'write' | 'admin') => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock users for demonstration
const mockUsers: User[] = [
  { id: '1', email: 'admin@finance.com', name: 'Admin User', role: 'admin' },
  { id: '2', email: 'user@finance.com', name: 'Regular User', role: 'user' },
  { id: '3', email: 'readonly@finance.com', name: 'Read Only User', role: 'read-only' },
];

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app, this would call an API
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === 'password123') {
      setUser(foundUser);
      localStorage.setItem('auth_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('auth_user');
  }, []);

  const hasPermission = useCallback((action: 'read' | 'write' | 'admin'): boolean => {
    if (!user) return false;
    
    switch (action) {
      case 'read':
        return true; // All authenticated users can read
      case 'write':
        return user.role === 'admin' || user.role === 'user';
      case 'admin':
        return user.role === 'admin';
      default:
        return false;
    }
  }, [user]);

  // Check for stored user on mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};