import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/currency';

interface TransactionTrendsChartProps {
  data: any[];
  currency: string;
}

const TransactionTrendsChart: React.FC<TransactionTrendsChartProps> = ({ data, currency }) => {
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    transactions: parseInt(item.count),
    income: parseFloat(item.income || 0),
    expenses: parseFloat(item.expenses || 0),
  }));

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'transactions') {
      return [value, 'Transactions'];
    }
    return [formatCurrency(value, currency), name.charAt(0).toUpperCase() + name.slice(1)];
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip 
          formatter={formatTooltipValue}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="transactions"
          stroke="#8884d8"
          strokeWidth={2}
          name="Transactions"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="income"
          stroke="#22c55e"
          strokeWidth={2}
          name="Income"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="expenses"
          stroke="#ef4444"
          strokeWidth={2}
          name="Expenses"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TransactionTrendsChart; 