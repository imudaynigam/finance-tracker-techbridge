import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// Lazy load components for performance
const Dashboard = React.lazy(() => import('../Dashboard/Dashboard'));
const TransactionList = React.lazy(() => import('../Transactions/TransactionList'));
const Analytics = React.lazy(() => import('../Analytics/Analytics'));
const Settings = React.lazy(() => import('../Settings/Settings'));
const AdminDashboard = React.lazy(() => import('../Admin/AdminDashboard'));

const MainLayout: React.FC = () => {
  const { loading, hasPermission } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto bg-background min-w-0">
          <Suspense fallback={
            <Card className="h-96 animate-pulse bg-muted flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading...</span>
              </div>
            </Card>
          }>
            <Routes>
              {hasPermission('admin') ? (
                // Admin routes
                <>
                  <Route path="/" element={<AdminDashboard activeTab="dashboard" />} />
                  <Route path="/admin" element={<AdminDashboard activeTab="dashboard" />} />
                  <Route path="/analytics" element={<AdminDashboard activeTab="analytics" />} />
                  <Route path="/settings" element={<Settings />} />
                </>
              ) : (
                // User routes
                <>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/transactions" element={<TransactionList />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />
                </>
              )}
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;