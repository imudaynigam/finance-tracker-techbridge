import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/lib/currency';

interface CategoryUsageChartProps {
  data: any[];
  currency: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1'];

const CategoryUsageChart: React.FC<CategoryUsageChartProps> = ({ data, currency }) => {
  const chartData = data.slice(0, 8).map((item, index) => ({
    name: item.category,
    value: parseFloat(item.total || 0),
    count: parseInt(item.count),
    color: COLORS[index % COLORS.length],
  }));

  const formatTooltipValue = (value: number, name: string) => {
    const item = chartData.find(d => d.name === name);
    return [
      `${formatCurrency(value, currency)} (${item?.count} transactions)`,
      name
    ];
  };

  return (
    <ResponsiveContainer width="100%" height={250}>
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
        <Tooltip formatter={formatTooltipValue} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryUsageChart; 