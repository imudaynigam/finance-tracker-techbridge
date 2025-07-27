import React, { useMemo, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import StatCard from './StatCard';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';
import { parseAmount } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Lazy load charts for performance
const ExpenseChart = React.lazy(() => import('./Charts/ExpenseChart'));
const IncomeChart = React.lazy(() => import('./Charts/IncomeChart'));
const TrendChart = React.lazy(() => import('./Charts/TrendChart'));

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const { preferences } = usePreferences();
  const isReadOnly = user?.role === 'read-only';

  const stats = useMemo(() => {
    if (!user) return null;

    // Calculate totals from transactions using safe parsing
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseAmount(t.amount), 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseAmount(t.amount), 0);
    
    const balance = income - expenses;

    return {
      income,
      expenses,
      balance,
      savingsRate: income > 0 ? ((income - expenses) / income * 100).toFixed(1) : '0',
    };
  }, [user, transactions]);

  const expenseBreakdown = useMemo(() => {
    if (!user) return {};
    
    const breakdown: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const categoryName = t.category?.name || 'Other';
        breakdown[categoryName] = (breakdown[categoryName] || 0) + parseAmount(t.amount);
      });
    
    return breakdown;
  }, [user, transactions]);

  const incomeBreakdown = useMemo(() => {
    if (!user) return {};
    
    const breakdown: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'income')
      .forEach(t => {
        const categoryName = t.category?.name || 'Other';
        breakdown[categoryName] = (breakdown[categoryName] || 0) + parseAmount(t.amount);
      });
    
    return breakdown;
  }, [user, transactions]);

  if (!stats) return (
    <div className="space-y-6 font-sans">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-muted animate-pulse rounded-lg shadow-md" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <div className="h-[300px] bg-muted animate-pulse rounded-lg shadow-md md:col-span-2" />
        <div className="h-[300px] bg-muted animate-pulse rounded-lg shadow-md" />
      </div>
    </div>
  );

  const getUserDisplayName = () => {
    if (!user) return 'User';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    return user.email;
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Welcome back, {getUserDisplayName()}!
          {isReadOnly && <span className="text-blue-600 dark:text-blue-400 text-lg ml-2">(Read-Only)</span>}
        </h1>
        <p className="text-muted-foreground">
          {isReadOnly 
            ? "Here's your financial overview in read-only mode." 
            : "Here's an overview of your financial activity."
          }
        </p>
      </div>
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Balance"
          value={formatCurrency(stats.balance, preferences.currency)}
          change={`${stats.savingsRate}% savings rate`}
          changeType={stats.balance >= 0 ? 'positive' : 'negative'}
          icon={Wallet}
          gradient
        />
        <StatCard
          title="Total Income"
          value={formatCurrency(stats.income, preferences.currency)}
          icon={TrendingUp}
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(stats.expenses, preferences.currency)}
          icon={TrendingDown}
        />
        <StatCard
          title="Net Worth"
          value={formatCurrency(stats.balance, preferences.currency)}
          changeType={stats.balance >= 0 ? 'positive' : 'negative'}
          icon={DollarSign}
        />
      </div>
      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <Card className="md:col-span-2 shadow-md rounded-lg">
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>Your income vs expenses over time</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-[300px] bg-muted animate-pulse rounded-lg" />}>
              <TrendChart />
            </Suspense>
          </CardContent>
        </Card>
        <Card className="shadow-md rounded-lg">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Where your money goes</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-[300px] bg-muted animate-pulse rounded-lg" />}>
              <ExpenseChart data={expenseBreakdown} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
      {/* Quick Insights */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card className="shadow-md rounded-lg">
          <CardHeader>
            <CardTitle>Income Sources</CardTitle>
            <CardDescription>Your income distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-[250px] bg-muted animate-pulse rounded-lg" />}>
              <IncomeChart data={incomeBreakdown} />
            </Suspense>
          </CardContent>
        </Card>
        <Card className="shadow-md rounded-lg">
          <CardHeader>
            <CardTitle>Quick Insights</CardTitle>
            <CardDescription>Key financial metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Largest Expense Category</span>
              <span className="text-sm text-muted-foreground">
                {Object.keys(expenseBreakdown).length > 0 
                  ? Object.entries(expenseBreakdown).reduce((a, b) => a[1] > b[1] ? a : b)[0]
                  : 'No expenses yet'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Main Income Source</span>
              <span className="text-sm text-muted-foreground">
                {Object.keys(incomeBreakdown).length > 0 
                  ? Object.entries(incomeBreakdown).reduce((a, b) => a[1] > b[1] ? a : b)[0]
                  : 'No income yet'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Financial Health</span>
              <span className={cn('text-sm font-medium', stats.balance >= 0 ? 'text-success' : 'text-destructive')}>
                {stats.balance >= 0 ? 'Healthy' : 'Needs Attention'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;