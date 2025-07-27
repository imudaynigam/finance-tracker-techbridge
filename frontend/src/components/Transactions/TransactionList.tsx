import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions, Transaction } from '@/contexts/TransactionContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  Filter,
  Eye,
  Lock
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TransactionForm from './TransactionForm';
import { formatCurrency } from '@/lib/currency';
import { parseAmount } from '@/lib/utils';

const ITEMS_PER_PAGE = 10;

const TransactionList: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { transactions, categories, deleteTransaction } = useTransactions();
  const { preferences } = usePreferences();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Check if user is read-only
  const isReadOnly = user?.role === 'read-only';
  const canEdit = hasPermission('write') || hasPermission('admin');

  const userTransactions = useMemo(() => {
    if (!user) return [];
    return transactions;
  }, [user, transactions]);

  const filteredTransactions = useMemo(() => {
    return userTransactions.filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.category?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || transaction.category?.name === categoryFilter;
      const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
      
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [userTransactions, searchTerm, categoryFilter, typeFilter]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  const handleEdit = useCallback((transaction: Transaction) => {
    if (isReadOnly) return;
    setEditingTransaction(transaction);
    setShowForm(true);
  }, [isReadOnly]);

  const handleDelete = useCallback((id: number) => {
    if (isReadOnly) return;
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
    }
  }, [deleteTransaction, isReadOnly]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (showForm) {
    return (
      <TransactionForm
        transaction={editingTransaction}
        onClose={() => {
          setShowForm(false);
          setEditingTransaction(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            {isReadOnly 
              ? "View your transaction history (read-only mode)" 
              : "Manage your income and expenses"
            }
          </p>
        </div>
        {!isReadOnly && (
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Transaction
          </Button>
        )}
      </div>

      {/* Read-Only Alert */}
      {isReadOnly && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <Eye className="h-4 w-4" />
          <AlertDescription>
            You are in <strong>read-only mode</strong>. You can view transactions but cannot add, edit, or delete them.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transaction History</span>
            <span className="text-sm font-normal text-muted-foreground">
              {filteredTransactions.length} transactions
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all'
                  ? 'No transactions match your filters.'
                  : 'No transactions found.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatDate(transaction.date)}</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {transaction.category?.name || 'Uncategorized'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(parseAmount(transaction.amount), preferences.currency)}
                    </span>
                    {!isReadOnly && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(transaction)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(transaction.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    {isReadOnly && (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionList;