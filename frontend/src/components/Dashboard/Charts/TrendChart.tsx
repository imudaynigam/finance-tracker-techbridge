import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/contexts/TransactionContext';

const TrendChart: React.FC = () => {
  const { user } = useAuth();
  const { getTransactionsByUser } = useTransactions();

  const chartData = useMemo(() => {
    if (!user) return [];

    const transactions = getTransactionsByUser(user.id);
    const monthlyData: Record<string, { income: number; expenses: number; month: string }> = {};

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0, month: monthName };
      }

      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expenses += transaction.amount;
      }
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }, [user, getTransactionsByUser]);

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No trend data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="month" 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <Tooltip 
          formatter={(value: number, name: string) => [
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(value),
            name === 'income' ? 'Income' : 'Expenses'
          ]}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="income" 
          stroke="hsl(var(--success))" 
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--success))' }}
          name="Income"
        />
        <Line 
          type="monotone" 
          dataKey="expenses" 
          stroke="hsl(var(--destructive))" 
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--destructive))' }}
          name="Expenses"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TrendChart;