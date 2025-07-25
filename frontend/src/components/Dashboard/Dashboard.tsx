import React, { useMemo, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/contexts/TransactionContext';
import StatCard from './StatCard';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Lazy load charts for performance
const ExpenseChart = React.lazy(() => import('./Charts/ExpenseChart'));
const IncomeChart = React.lazy(() => import('./Charts/IncomeChart'));
const TrendChart = React.lazy(() => import('./Charts/TrendChart'));

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { getTotalIncome, getTotalExpenses, getNetBalance, getCategoryBreakdown } = useTransactions();

  const stats = useMemo(() => {
    if (!user) return null;

    const income = getTotalIncome(user.id);
    const expenses = getTotalExpenses(user.id);
    const balance = getNetBalance(user.id);

    return {
      income,
      expenses,
      balance,
      savingsRate: income > 0 ? ((income - expenses) / income * 100).toFixed(1) : '0',
    };
  }, [user, getTotalIncome, getTotalExpenses, getNetBalance]);

  const expenseBreakdown = useMemo(() => {
    if (!user) return {};
    return getCategoryBreakdown(user.id, 'expense');
  }, [user, getCategoryBreakdown]);

  const incomeBreakdown = useMemo(() => {
    if (!user) return {};
    return getCategoryBreakdown(user.id, 'income');
  }, [user, getCategoryBreakdown]);

  if (!stats) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground">
          Here's an overview of your financial activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Balance"
          value={formatCurrency(stats.balance)}
          change={`${stats.savingsRate}% savings rate`}
          changeType={stats.balance >= 0 ? 'positive' : 'negative'}
          icon={Wallet}
          gradient
        />
        <StatCard
          title="Total Income"
          value={formatCurrency(stats.income)}
          icon={TrendingUp}
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(stats.expenses)}
          icon={TrendingDown}
        />
        <StatCard
          title="Net Worth"
          value={formatCurrency(stats.balance)}
          changeType={stats.balance >= 0 ? 'positive' : 'negative'}
          icon={DollarSign}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>
              Your income vs expenses over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-[300px] bg-muted animate-pulse rounded" />}>
              <TrendChart />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>
              Where your money goes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-[300px] bg-muted animate-pulse rounded" />}>
              <ExpenseChart data={expenseBreakdown} />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Income Sources</CardTitle>
            <CardDescription>
              Your income distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-[250px] bg-muted animate-pulse rounded" />}>
              <IncomeChart data={incomeBreakdown} />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Insights</CardTitle>
            <CardDescription>
              Key financial metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Largest Expense Category</span>
              <span className="text-sm text-muted-foreground">
                {Object.keys(expenseBreakdown).length > 0 
                  ? Object.entries(expenseBreakdown).reduce((a, b) => a[1] > b[1] ? a : b)[0]
                  : 'No expenses yet'
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Main Income Source</span>
              <span className="text-sm text-muted-foreground">
                {Object.keys(incomeBreakdown).length > 0 
                  ? Object.entries(incomeBreakdown).reduce((a, b) => a[1] > b[1] ? a : b)[0]
                  : 'No income yet'
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Financial Health</span>
              <span className={`text-sm font-medium ${stats.balance >= 0 ? 'text-success' : 'text-destructive'}`}>
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