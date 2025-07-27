import React, { useState, useEffect, Suspense } from 'react';
import { usePreferences } from '@/contexts/PreferencesContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity,
  Calendar,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { adminAPI } from '@/services/api';
import { formatCurrency } from '@/lib/currency';

// Lazy load chart components
const TransactionTrendsChart = React.lazy(() => import('./Charts/TransactionTrendsChart'));
const UserRegistrationChart = React.lazy(() => import('./Charts/UserRegistrationChart'));
const CategoryUsageChart = React.lazy(() => import('./Charts/CategoryUsageChart'));

const SystemAnalytics: React.FC = () => {
  const { preferences } = usePreferences();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSystemAnalytics(period);
      setAnalytics(response.data);
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Analytics</h2>
          <p className="text-muted-foreground">
            Platform performance and user activity insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Period:</span>
          <Select value={period.toString()} onValueChange={(value) => setPeriod(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.transactionTrends.reduce((sum: number, item: any) => sum + parseInt(item.count), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Last {period} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.userTrends.reduce((sum: number, item: any) => sum + parseInt(item.count), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Last {period} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(
                analytics.transactionTrends.reduce((sum: number, item: any) => sum + parseFloat(item.income || 0), 0),
                preferences.currency
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Last {period} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(
                analytics.transactionTrends.reduce((sum: number, item: any) => sum + parseFloat(item.expenses || 0), 0),
                preferences.currency
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Last {period} days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Transaction Trends */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Transaction Trends
            </CardTitle>
            <CardDescription>
              Daily transaction volume and financial trends over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-[300px] bg-muted animate-pulse rounded" />}>
              <TransactionTrendsChart 
                data={analytics.transactionTrends} 
                currency={preferences.currency}
              />
            </Suspense>
          </CardContent>
        </Card>

        {/* User Registration Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              User Registration
            </CardTitle>
            <CardDescription>
              New user registrations over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-[250px] bg-muted animate-pulse rounded" />}>
              <UserRegistrationChart data={analytics.userTrends} />
            </Suspense>
          </CardContent>
        </Card>

        {/* Category Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Category Usage
            </CardTitle>
            <CardDescription>
              Most used transaction categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-[250px] bg-muted animate-pulse rounded" />}>
              <CategoryUsageChart 
                data={analytics.categoryUsage} 
                currency={preferences.currency}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Top Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Active Users
          </CardTitle>
          <CardDescription>
            Users with the highest transaction activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topUsers.map((user: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {user.firstName ? user.firstName[0] : user.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user.email
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{user.transactionCount} transactions</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(parseFloat(user.totalAmount || 0), preferences.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Usage Details */}
      <Card>
        <CardHeader>
          <CardTitle>Category Usage Details</CardTitle>
          <CardDescription>
            Detailed breakdown of category usage across all users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.categoryUsage.map((category: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-primary rounded-full"></div>
                  <div>
                    <p className="font-medium">{category.category}</p>
                    <p className="text-sm text-muted-foreground">
                      {category.count} transactions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(parseFloat(category.total || 0), preferences.currency)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {((parseFloat(category.total || 0) / analytics.transactionTrends.reduce((sum: number, item: any) => 
                      sum + parseFloat(item.income || 0) + parseFloat(item.expenses || 0), 0)) * 100).toFixed(1)}% of total
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemAnalytics; 