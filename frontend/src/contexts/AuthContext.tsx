import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { authAPI } from '../services/api';

export type UserRole = 'admin' | 'user' | 'read-only';

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: { firstName?: string; lastName?: string; email?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (action: 'read' | 'write' | 'admin') => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const hasCheckedAuth = useRef(false);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Attempting login for:', email);
      const response = await authAPI.login({ email, password });
      console.log('Login response:', response.data);
      
      const { user: userData, token } = response.data;
      
      if (!token) {
        console.error('No token received from login response');
        return { success: false, error: 'No authentication token received' };
      }
      
      console.log('Token received:', token.substring(0, 50) + '...');
      console.log('User data:', userData);
      
      setUser(userData);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log('Login successful, token stored');
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Login failed';
      return { success: false, error: errorMessage };
    }
  }, []);

  const register = useCallback(async (data: { email: string; password: string; firstName?: string; lastName?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authAPI.register(data);
      const { user: userData, token } = response.data;
      
      if (!token) {
        console.error('No token received from registration response');
        return { success: false, error: 'No authentication token received' };
      }
      
      setUser(userData);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const updateProfile = useCallback(async (data: { firstName?: string; lastName?: string; email?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      // In a real app, you would call an API endpoint to update the profile
      // For now, we'll just update the local state
      if (user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      return { success: true };
    } catch (error: any) {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      return { success: false, error: errorMessage };
    }
  }, [user]);

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

  // Check for stored user and validate token on mount (only once)
  useEffect(() => {
    const checkAuth = async () => {
      if (hasCheckedAuth.current) {
        setLoading(false);
        return;
      }
      
      hasCheckedAuth.current = true;
      
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        console.log('Checking stored auth - Token exists:', !!token);
        console.log('Stored user exists:', !!storedUser);
        
        if (token && storedUser) {
          try {
            // For simplified backend, just use stored user
            const userData = JSON.parse(storedUser);
            console.log('Restoring user from storage:', userData.email);
            setUser(userData);
          } catch (error) {
            console.error('Error parsing stored user:', error);
            // Token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    login,
    register,
    updateProfile,
    logout,
    isAuthenticated: !!user,
    hasPermission,
    loading,
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