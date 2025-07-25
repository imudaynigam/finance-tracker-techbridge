import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions, Transaction } from '@/contexts/TransactionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TransactionFormProps {
  transaction?: Transaction | null;
  onClose: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ transaction, onClose }) => {
  const { user } = useAuth();
  const { categories, addTransaction, updateTransaction } = useTransactions();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    type: transaction?.type || 'expense' as 'income' | 'expense',
    amount: transaction?.amount?.toString() || '',
    category: transaction?.category || '',
    description: transaction?.description || '',
    date: transaction?.date || new Date().toISOString().split('T')[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableCategories = categories.filter(cat => cat.type === formData.type);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (!formData.amount || !formData.category || !formData.description) {
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
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: formData.date,
        userId: user.id,
      };

      if (transaction) {
        updateTransaction(transaction.id, transactionData);
        toast({
          title: 'Transaction Updated',
          description: 'Your transaction has been successfully updated.',
        });
      } else {
        addTransaction(transactionData);
        toast({
          title: 'Transaction Added',
          description: 'Your transaction has been successfully added.',
        });
      }

      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while saving the transaction.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, user, transaction, addTransaction, updateTransaction, toast, onClose]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Transactions
        </Button>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>
            {transaction ? 'Edit Transaction' : 'Add New Transaction'}
          </CardTitle>
          <CardDescription>
            {transaction 
              ? 'Update the details of your transaction below.'
              : 'Enter the details of your new transaction below.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="type">Transaction Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: 'income' | 'expense') => {
                    handleInputChange('type', value);
                    handleInputChange('category', ''); // Reset category when type changes
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="0.00"
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter a description for this transaction"
                required
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting 
                  ? 'Saving...' 
                  : transaction 
                    ? 'Update Transaction' 
                    : 'Add Transaction'
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionForm;