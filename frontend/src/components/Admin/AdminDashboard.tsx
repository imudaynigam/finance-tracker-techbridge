import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Activity,
  UserPlus,
  Settings,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { adminAPI } from '@/services/api';
import { formatCurrency } from '@/lib/currency';
import UserManagement from './UserManagement';
import SystemAnalytics from './SystemAnalytics';

interface SystemOverview {
  totalUsers: number;
  totalTransactions: number;
  totalCategories: number;
  recentTransactions: number;
  newUsers: number;
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
}

interface UserRole {
  role: string;
  count: number;
}

interface AdminDashboardProps {
  activeTab?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeTab = 'dashboard' }) => {
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const [overview, setOverview] = useState<SystemOverview | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemOverview();
  }, []);

  const fetchSystemOverview = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSystemOverview();
      setOverview(response.data.overview);
      setUserRoles(response.data.userRoles);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch system overview:', err);
      setError(err.response?.data?.message || 'Failed to load system overview');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'user':
        return 'default';
      case 'read-only':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchSystemOverview}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!overview) return null;

  // Render different content based on activeTab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                System overview and management for administrators
              </p>
            </div>

            {/* System Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    +{overview.newUsers} new this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview.totalTransactions}</div>
                  <p className="text-xs text-muted-foreground">
                    +{overview.recentTransactions} this week
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
                    {formatCurrency(overview.totalIncome, preferences.currency)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all users
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
                    {formatCurrency(overview.totalExpenses, preferences.currency)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all users
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Net Amount and Categories */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Net System Amount
                  </CardTitle>
                  <CardDescription>
                    Total income minus total expenses across all users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${
                    overview.netAmount >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {formatCurrency(overview.netAmount, preferences.currency)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {overview.netAmount >= 0 ? 'Positive net amount' : 'Negative net amount'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    User Role Distribution
                  </CardTitle>
                  <CardDescription>
                    Distribution of users by role
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {userRoles.map((roleData) => (
                      <div key={roleData.role} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={getRoleBadgeVariant(roleData.role)}>
                            {roleData.role}
                          </Badge>
                        </div>
                        <span className="text-sm font-medium">{roleData.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'users':
        return <UserManagement />;

      case 'analytics':
        return <SystemAnalytics />;

      default:
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                System overview and management for administrators
              </p>
            </div>
            {/* Default dashboard content */}
          </div>
        );
    }
  };

  return renderContent();
};

export default AdminDashboard; 