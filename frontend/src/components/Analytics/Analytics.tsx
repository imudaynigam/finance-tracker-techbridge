import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Calendar, PieChart, BarChart3, LineChart } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { parseAmount } from '@/lib/utils';

// Chart components
const MonthlyTrendsChart = React.lazy(() => import('./Charts/MonthlyTrendsChart'));
const CategoryBreakdownChart = React.lazy(() => import('./Charts/CategoryBreakdownChart'));
const YearlyOverviewChart = React.lazy(() => import('./Charts/YearlyOverviewChart'));
const SpendingPatternsChart = React.lazy(() => import('./Charts/SpendingPatternsChart'));

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const { preferences } = usePreferences();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [yearlyData, setYearlyData] = useState<any>(null);
  const [categoryData, setCategoryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const isReadOnly = user?.role === 'read-only';

  // Generate year options (current year and 2 years back)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 3 }, (_, i) => currentYear - i);
  }, []);

  // Generate month options
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: new Date(2024, i).toLocaleDateString('en-US', { month: 'long' })
    }));
  }, []);

  // Calculate key metrics from transactions
  const metrics = useMemo(() => {
    if (!transactions.length) return null;

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Filter transactions for current year and month
    const currentYearTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === currentYear;
    });

    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === currentYear && date.getMonth() + 1 === currentMonth;
    });

    // Calculate totals using safe parsing
    const currentYearIncome = currentYearTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseAmount(t.amount), 0);

    const currentYearExpenses = currentYearTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseAmount(t.amount), 0);

    const currentMonthIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseAmount(t.amount), 0);

    const currentMonthExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseAmount(t.amount), 0);

    // Calculate savings rate
    const yearlySavingsRate = currentYearIncome > 0 ? ((currentYearIncome - currentYearExpenses) / currentYearIncome * 100) : 0;
    const monthlySavingsRate = currentMonthIncome > 0 ? ((currentMonthIncome - currentMonthExpenses) / currentMonthIncome * 100) : 0;

    // Find top spending categories
    const categorySpending = currentYearTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const categoryName = t.category?.name || 'Other';
        acc[categoryName] = (acc[categoryName] || 0) + parseAmount(t.amount);
        return acc;
      }, {} as Record<string, number>);

    const topCategories = Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      currentYear: {
        income: currentYearIncome,
        expenses: currentYearExpenses,
        net: currentYearIncome - currentYearExpenses,
        savingsRate: yearlySavingsRate
      },
      currentMonth: {
        income: currentMonthIncome,
        expenses: currentMonthExpenses,
        net: currentMonthIncome - currentMonthExpenses,
        savingsRate: monthlySavingsRate
      },
      topCategories
    };
  }, [transactions]);

  // Calculate analytics data from transactions instead of API calls
  useEffect(() => {
    if (!user || !transactions.length) return;
    
    setLoading(true);
    
    try {
      // Calculate monthly data
      const monthlyTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getFullYear() === selectedYear && date.getMonth() + 1 === selectedMonth;
      });

      const monthlyIncome = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseAmount(t.amount), 0);

      const monthlyExpenses = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseAmount(t.amount), 0);

      setMonthlyData({
        year: selectedYear,
        month: selectedMonth,
        income: monthlyIncome,
        expenses: monthlyExpenses,
        net: monthlyIncome - monthlyExpenses
      });

      // Calculate yearly data
      const yearlyTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getFullYear() === selectedYear;
      });

      const yearlyIncome = yearlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseAmount(t.amount), 0);

      const yearlyExpenses = yearlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseAmount(t.amount), 0);

      setYearlyData({
        year: selectedYear,
        income: yearlyIncome,
        expenses: yearlyExpenses,
        net: yearlyIncome - yearlyExpenses
      });

      // Calculate category breakdown
      const categoryBreakdown = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          const categoryName = t.category?.name || 'Other';
          const existing = acc.find(item => item.categoryName === categoryName);
          if (existing) {
            existing.total += parseAmount(t.amount);
            existing.count += 1;
          } else {
            acc.push({
              categoryName,
              categoryColor: t.category?.color || '#6b7280',
              total: parseAmount(t.amount),
              count: 1
            });
          }
          return acc;
        }, [] as Array<{categoryName: string; categoryColor: string; total: number; count: number}>);

      const finalCategoryData = {
        year: selectedYear,
        month: selectedMonth,
        breakdown: categoryBreakdown.sort((a, b) => b.total - a.total)
      };

      console.log('Analytics - Category Data:', finalCategoryData);
      console.log('Analytics - Yearly Data:', { year: selectedYear, income: yearlyIncome, expenses: yearlyExpenses });
      console.log('Analytics - Monthly Data:', { year: selectedYear, month: selectedMonth, income: monthlyIncome, expenses: monthlyExpenses });

      setCategoryData(finalCategoryData);

    } catch (error) {
      console.error('Failed to calculate analytics data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, transactions, selectedYear, selectedMonth]);



  if (!user) return null;

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            Analytics
            {isReadOnly && <span className="text-blue-600 dark:text-blue-400 text-lg ml-2">(Read-Only)</span>}
          </h1>
          <p className="text-muted-foreground">
            {isReadOnly 
              ? "View your financial patterns and trends in read-only mode" 
              : "Deep insights into your financial patterns and trends"
            }
          </p>
        </div>
        {/* Filters */}
        <div className="flex items-center gap-4">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(month => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Key Metrics */}
      {metrics ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yearly Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.currentYear.income, preferences.currency)}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(metrics.currentMonth.income, preferences.currency)} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yearly Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.currentYear.expenses, preferences.currency)}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(metrics.currentMonth.expenses, preferences.currency)} this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${metrics.currentYear.net >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(metrics.currentYear.net, preferences.currency)}
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.currentYear.savingsRate.toFixed(1)}% savings rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Category</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.topCategories.length > 0 ? metrics.topCategories[0][0] : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.topCategories.length > 0 ? formatCurrency(metrics.topCategories[0][1], preferences.currency) : 'No expenses'}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-lg shadow-md" />
          ))}
        </div>
      )}
      {/* Charts & Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <Card className="md:col-span-2 shadow-md rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Monthly Trends</CardTitle>
            <CardDescription>Income vs expenses over time for {selectedYear}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[400px] bg-muted animate-pulse rounded-lg" />
            ) : (
              <React.Suspense fallback={<div className="h-[400px] bg-muted animate-pulse rounded-lg" />}>
                <MonthlyTrendsChart year={selectedYear} />
              </React.Suspense>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-md rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Category Breakdown</CardTitle>
            <CardDescription>Expense distribution for {monthOptions[selectedMonth - 1]?.label} {selectedYear}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] bg-muted animate-pulse rounded-lg" />
            ) : (
              <React.Suspense fallback={<div className="h-[300px] bg-muted animate-pulse rounded-lg" />}>
                <CategoryBreakdownChart data={categoryData} />
              </React.Suspense>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-md rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Yearly Overview</CardTitle>
            <CardDescription>Income and expenses comparison for {selectedYear}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] bg-muted animate-pulse rounded-lg" />
            ) : (
              <React.Suspense fallback={<div className="h-[300px] bg-muted animate-pulse rounded-lg" />}>
                <YearlyOverviewChart data={yearlyData} />
              </React.Suspense>
            )}
          </CardContent>
        </Card>
        <Card className="md:col-span-2 shadow-md rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Spending Patterns</CardTitle>
            <CardDescription>Monthly spending patterns and trends</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] bg-muted animate-pulse rounded-lg" />
            ) : (
              <React.Suspense fallback={<div className="h-[300px] bg-muted animate-pulse rounded-lg" />}>
                <SpendingPatternsChart year={selectedYear} />
              </React.Suspense>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Top Categories List */}
      {metrics && metrics.topCategories.length > 0 && (
        <Card className="shadow-md rounded-lg mt-6">
          <CardHeader>
            <CardTitle>Top Spending Categories</CardTitle>
            <CardDescription>Your highest expense categories for {selectedYear}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.topCategories.map(([category, amount], index) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{category}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(amount, preferences.currency)}</div>
                    <div className="text-sm text-muted-foreground">
                      {((amount / metrics.currentYear.expenses) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Financial Health Indicators */}
      {metrics && (
        <Card className="shadow-md rounded-lg mt-6">
          <CardHeader>
            <CardTitle>Financial Health Indicators</CardTitle>
            <CardDescription>Key metrics to assess your financial well-being</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{metrics.currentYear.savingsRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Savings Rate</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {metrics.currentYear.savingsRate >= 20 ? 'Excellent' : metrics.currentYear.savingsRate >= 10 ? 'Good' : metrics.currentYear.savingsRate >= 5 ? 'Fair' : 'Needs Improvement'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{metrics.currentYear.income > 0 ? ((metrics.currentYear.expenses / metrics.currentYear.income) * 100).toFixed(1) : 0}%</div>
                <div className="text-sm text-muted-foreground">Expense Ratio</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {metrics.currentYear.income > 0 && (metrics.currentYear.expenses / metrics.currentYear.income) <= 0.7 ? 'Healthy' : metrics.currentYear.income > 0 && (metrics.currentYear.expenses / metrics.currentYear.income) <= 0.8 ? 'Acceptable' : 'High'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{metrics.currentYear.net >= 0 ? 'Positive' : 'Negative'}</div>
                <div className="text-sm text-muted-foreground">Cash Flow</div>
                <div className="text-xs text-muted-foreground mt-1">{metrics.currentYear.net >= 0 ? 'Surplus' : 'Deficit'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Analytics;