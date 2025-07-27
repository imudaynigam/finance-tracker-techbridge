import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface YearlyOverviewChartProps {
  data?: any;
}

const YearlyOverviewChart: React.FC<YearlyOverviewChartProps> = ({ data }) => {
  const chartData = data ? [
    {
      name: 'Income',
      value: data.income || 0,
      fill: 'hsl(var(--success))'
    },
    {
      name: 'Expenses',
      value: data.expenses || 0,
      fill: 'hsl(var(--destructive))'
    }
  ] : [];

  if (chartData.length === 0 || (chartData[0].value === 0 && chartData[1].value === 0)) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No yearly data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="name" 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip 
          formatter={(value: number) => [
            new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(value),
            'Amount'
          ]}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
        />
        <Legend />
        <Bar dataKey="value" fill="hsl(var(--primary))" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default YearlyOverviewChart; 