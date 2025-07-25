import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ExpenseChartProps {
  data: Record<string, number>;
}

const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f59e0b', // amber
];

const ExpenseChart: React.FC<ExpenseChartProps> = ({ data }) => {
  const chartData = Object.entries(data).map(([category, amount], index) => ({
    name: category,
    value: amount,
    color: COLORS[index % COLORS.length],
  }));

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No expense data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(value),
            'Amount'
          ]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ExpenseChart;