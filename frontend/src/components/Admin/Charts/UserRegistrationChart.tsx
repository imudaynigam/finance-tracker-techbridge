import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface UserRegistrationChartProps {
  data: any[];
}

const UserRegistrationChart: React.FC<UserRegistrationChartProps> = ({ data }) => {
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    users: parseInt(item.count),
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip 
          formatter={(value: number) => [value, 'New Users']}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Bar dataKey="users" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default UserRegistrationChart; 