import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTransactions } from '@/contexts/TransactionContext';
import { parseAmount } from '@/lib/utils';

interface MonthlyTrendsChartProps {
  year: number;
}

const MonthlyTrendsChart: React.FC<MonthlyTrendsChartProps> = ({ year }) => {
  const { transactions } = useTransactions();
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Generate monthly data for the selected year
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getFullYear() === year && date.getMonth() + 1 === month;
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseAmount(t.amount), 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseAmount(t.amount), 0);

      return {
        month: new Date(year, i).toLocaleDateString('en-US', { month: 'short' }),
        income,
        expenses,
        net: income - expenses
      };
    });

    setChartData(monthlyData);
  }, [transactions, year]);

  if (chartData.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        No data available for {year}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
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
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip 
          formatter={(value: number, name: string) => [
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(value),
            name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Net'
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
        <Line 
          type="monotone" 
          dataKey="net" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ fill: 'hsl(var(--primary))' }}
          name="Net"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MonthlyTrendsChart; 