import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  userId: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

interface TransactionContextType {
  transactions: Transaction[];
  categories: Category[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByUser: (userId: string) => Transaction[];
  getTotalIncome: (userId: string) => number;
  getTotalExpenses: (userId: string) => number;
  getNetBalance: (userId: string) => number;
  getCategoryBreakdown: (userId: string, type: 'income' | 'expense') => Record<string, number>;
}

const TransactionContext = createContext<TransactionContextType | null>(null);

// Mock categories
const mockCategories: Category[] = [
  { id: '1', name: 'Salary', type: 'income', color: '#22c55e' },
  { id: '2', name: 'Freelance', type: 'income', color: '#16a34a' },
  { id: '3', name: 'Investment', type: 'income', color: '#15803d' },
  { id: '4', name: 'Food', type: 'expense', color: '#ef4444' },
  { id: '5', name: 'Transport', type: 'expense', color: '#f97316' },
  { id: '6', name: 'Entertainment', type: 'expense', color: '#8b5cf6' },
  { id: '7', name: 'Shopping', type: 'expense', color: '#ec4899' },
  { id: '8', name: 'Bills', type: 'expense', color: '#6b7280' },
  { id: '9', name: 'Healthcare', type: 'expense', color: '#06b6d4' },
];

// Mock transactions
const mockTransactions: Transaction[] = [
  { id: '1', type: 'income', amount: 5000, category: 'Salary', description: 'Monthly salary', date: '2024-01-15', userId: '1' },
  { id: '2', type: 'expense', amount: 120, category: 'Food', description: 'Grocery shopping', date: '2024-01-16', userId: '1' },
  { id: '3', type: 'expense', amount: 50, category: 'Transport', description: 'Gas refill', date: '2024-01-17', userId: '1' },
  { id: '4', type: 'income', amount: 3500, category: 'Salary', description: 'Monthly salary', date: '2024-01-15', userId: '2' },
  { id: '5', type: 'expense', amount: 80, category: 'Food', description: 'Dinner out', date: '2024-01-18', userId: '2' },
  { id: '6', type: 'expense', amount: 200, category: 'Shopping', description: 'New clothes', date: '2024-01-19', userId: '2' },
  { id: '7', type: 'income', amount: 2500, category: 'Salary', description: 'Monthly salary', date: '2024-01-15', userId: '3' },
  { id: '8', type: 'expense', amount: 60, category: 'Food', description: 'Lunch', date: '2024-01-20', userId: '3' },
];

interface TransactionProviderProps {
  children: ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const categories = mockCategories;

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  }, []);

  const updateTransaction = useCallback((id: string, updatedTransaction: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, ...updatedTransaction } : t)
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const getTransactionsByUser = useCallback((userId: string) => {
    return transactions.filter(t => t.userId === userId);
  }, [transactions]);

  const getTotalIncome = useMemo(() => (userId: string) => {
    return transactions
      .filter(t => t.userId === userId && t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getTotalExpenses = useMemo(() => (userId: string) => {
    return transactions
      .filter(t => t.userId === userId && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getNetBalance = useMemo(() => (userId: string) => {
    return getTotalIncome(userId) - getTotalExpenses(userId);
  }, [getTotalIncome, getTotalExpenses]);

  const getCategoryBreakdown = useMemo(() => (userId: string, type: 'income' | 'expense') => {
    const userTransactions = transactions.filter(t => t.userId === userId && t.type === type);
    const breakdown: Record<string, number> = {};
    
    userTransactions.forEach(t => {
      breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
    });
    
    return breakdown;
  }, [transactions]);

  const value: TransactionContextType = {
    transactions,
    categories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsByUser,
    getTotalIncome,
    getTotalExpenses,
    getNetBalance,
    getCategoryBreakdown,
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