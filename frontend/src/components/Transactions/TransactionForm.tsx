import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions, Transaction } from '@/contexts/TransactionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Lock, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TransactionFormProps {
  transaction?: Transaction | null;
  onClose: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ transaction, onClose }) => {
  const { user } = useAuth();
  const { categories, createTransaction, updateTransaction } = useTransactions();
  const { toast } = useToast();
  
  // Check if user is read-only
  const isReadOnly = user?.role === 'read-only';
  
  const [formData, setFormData] = useState({
    type: transaction?.type || 'expense' as 'income' | 'expense',
    amount: transaction?.amount?.toString() || '',
    categoryId: transaction?.categoryId?.toString() || '',
    description: transaction?.description || '',
    date: transaction?.date || new Date().toISOString().split('T')[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableCategories = categories.filter(cat => cat.isActive);

  const handleInputChange = useCallback((field: string, value: string) => {
    if (isReadOnly) return; // Prevent changes for read-only users
    setFormData(prev => ({ ...prev, [field]: value }));
  }, [isReadOnly]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isReadOnly) {
      toast({
        title: 'Read-Only Mode',
        description: 'You cannot modify transactions in read-only mode.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!user) return;
    
    if (!formData.amount || !formData.categoryId || !formData.description) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const transactionData = {
        type: formData.type as 'income' | 'expense',
        amount: parseFloat(formData.amount),
        categoryId: parseInt(formData.categoryId),
        description: formData.description,
        date: formData.date,
      };

      if (transaction) {
        const result = await updateTransaction(transaction.id, transactionData);
        if (result.success) {
          toast({
            title: 'Transaction Updated',
            description: 'Your transaction has been successfully updated.',
          });
          onClose();
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to update transaction.',
            variant: 'destructive',
          });
        }
      } else {
        const result = await createTransaction(transactionData);
        if (result.success) {
          toast({
            title: 'Transaction Added',
            description: 'Your transaction has been successfully added.',
          });
          onClose();
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to add transaction.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while saving the transaction.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, user, transaction, createTransaction, updateTransaction, toast, onClose, isReadOnly]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Transactions
        </Button>
      </div>

      {/* Read-Only Alert */}
      {isReadOnly && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <Eye className="h-4 w-4" />
          <AlertDescription>
            You are in <strong>read-only mode</strong>. You can view transaction details but cannot modify them.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isReadOnly && <Lock className="h-4 w-4 text-muted-foreground" />}
            {transaction ? 'Transaction Details' : 'Add New Transaction'}
          </CardTitle>
          <CardDescription>
            {isReadOnly 
              ? 'View transaction information (read-only mode)'
              : transaction 
                ? 'Update your transaction details' 
                : 'Add a new income or expense transaction'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transaction Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select transaction type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                required
                disabled={isReadOnly}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => handleInputChange('categoryId', value)}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter transaction description..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                required
                disabled={isReadOnly}
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
                disabled={isReadOnly}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                {isReadOnly ? 'Close' : 'Cancel'}
              </Button>
              {!isReadOnly && (
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : (transaction ? 'Update Transaction' : 'Add Transaction')}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionForm;