import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { transactionsAPI, categoriesAPI } from '../services/api';
import { useAuth } from './AuthContext';

export interface Category {
  id: number;
  name: string;
  description?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  amount: number | string; // Can be string from API or number after parsing
  type: 'income' | 'expense';
  description: string;
  date: string;
  userId: number;
  categoryId: number;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: string;
  categoryId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  fetchTransactions: (filters?: TransactionFilters) => Promise<void>;
  fetchAllTransactions: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  createTransaction: (data: {
    amount: number;
    type: 'income' | 'expense';
    description: string;
    date: string;
    categoryId: number;
  }) => Promise<{ success: boolean; error?: string }>;
  updateTransaction: (id: number, data: {
    amount?: number;
    type?: 'income' | 'expense';
    description?: string;
    date?: string;
    categoryId?: number;
  }) => Promise<{ success: boolean; error?: string }>;
  deleteTransaction: (id: number) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

const TransactionContext = createContext<TransactionContextType | null>(null);

interface TransactionProviderProps {
  children: ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  
  const hasInitialized = useRef(false);

  const fetchTransactions = useCallback(async (filters?: TransactionFilters) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await transactionsAPI.getAll(filters);
      setTransactions(response.data.transactions || []);
      setPagination(response.data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      });
    } catch (error: any) {
      console.error('Fetch transactions error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch transactions';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchAllTransactions = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all transactions without pagination for analytics
      const response = await transactionsAPI.getAllForAnalytics();
      setTransactions(response.data.transactions || []);
      setPagination({
        page: 1,
        limit: response.data.transactions?.length || 0,
        total: response.data.transactions?.length || 0,
        pages: 1,
      });
    } catch (error: any) {
      console.error('Fetch all transactions error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch transactions';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchCategories = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data.categories || []);
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      // Set default categories if API fails
      setCategories([
        { id: 1, name: 'Salary', description: 'Income from salary', color: '#22c55e', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 2, name: 'Food', description: 'Food and dining expenses', color: '#ef4444', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 3, name: 'Transport', description: 'Transportation costs', color: '#f97316', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ]);
    }
  }, [isAuthenticated]);

  const createTransaction = useCallback(async (data: {
    amount: number;
    type: 'income' | 'expense';
    description: string;
    date: string;
    categoryId: number;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      await transactionsAPI.create(data);
      // Refresh transactions list with all transactions for real-time updates
      await fetchAllTransactions();
      return { success: true };
    } catch (error: any) {
      console.error('Create transaction error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create transaction';
      return { success: false, error: errorMessage };
    }
  }, [fetchAllTransactions]);

  const updateTransaction = useCallback(async (id: number, data: {
    amount?: number;
    type?: 'income' | 'expense';
    description?: string;
    date?: string;
    categoryId?: number;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      await transactionsAPI.update(id, data);
      // Refresh transactions list with all transactions for real-time updates
      await fetchAllTransactions();
      return { success: true };
    } catch (error: any) {
      console.error('Update transaction error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update transaction';
      return { success: false, error: errorMessage };
    }
  }, [fetchAllTransactions]);

  const deleteTransaction = useCallback(async (id: number): Promise<{ success: boolean; error?: string }> => {
    try {
      await transactionsAPI.delete(id);
      // Refresh transactions list with all transactions for real-time updates
      await fetchAllTransactions();
      return { success: true };
    } catch (error: any) {
      console.error('Delete transaction error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete transaction';
      return { success: false, error: errorMessage };
    }
  }, [fetchAllTransactions]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load initial data when user is authenticated
  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish loading
    
    if (isAuthenticated && user) {
      console.log('User authenticated, fetching transaction data...');
      fetchCategories();
      // Fetch all transactions for dashboard charts and analytics
      fetchAllTransactions();
    } else {
      // Clear data when user is not authenticated
      setTransactions([]);
      setCategories([]);
      setError(null);
    }
  }, [isAuthenticated, user, authLoading, fetchCategories, fetchAllTransactions]);

  const value: TransactionContextType = {
    transactions,
    categories,
    loading,
    error,
    pagination,
    fetchTransactions,
    fetchAllTransactions,
    fetchCategories,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    clearError,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};