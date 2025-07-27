import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTransactions } from '@/contexts/TransactionContext';
import { parseAmount } from '@/lib/utils';

interface SpendingPatternsChartProps {
  year: number;
}

const SpendingPatternsChart: React.FC<SpendingPatternsChartProps> = ({ year }) => {
  const { transactions } = useTransactions();
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Generate monthly spending data for the selected year
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getFullYear() === year && date.getMonth() + 1 === month;
      });

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseAmount(t.amount), 0);

      return {
        month: new Date(year, i).toLocaleDateString('en-US', { month: 'short' }),
        expenses,
        cumulative: 0 // Will be calculated below
      };
    });

    // Calculate cumulative expenses
    let cumulative = 0;
    monthlyData.forEach(item => {
      cumulative += item.expenses;
      item.cumulative = cumulative;
    });

    setChartData(monthlyData);
  }, [transactions, year]);

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No spending data available for {year}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
            name === 'expenses' ? 'Monthly Expenses' : 'Cumulative Expenses'
          ]}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
        />
        <Area 
          type="monotone" 
          dataKey="expenses" 
          stackId="1"
          stroke="hsl(var(--destructive))" 
          fill="hsl(var(--destructive))" 
          fillOpacity={0.6}
          name="Monthly Expenses"
        />
        <Area 
          type="monotone" 
          dataKey="cumulative" 
          stackId="2"
          stroke="hsl(var(--primary))" 
          fill="hsl(var(--primary))" 
          fillOpacity={0.3}
          name="Cumulative Expenses"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default SpendingPatternsChart; 