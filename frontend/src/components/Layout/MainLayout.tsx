import React, { useState, Suspense } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Card } from '@/components/ui/card';

// Lazy load components for performance
const Dashboard = React.lazy(() => import('../Dashboard/Dashboard'));
const TransactionList = React.lazy(() => import('../Transactions/TransactionList'));
const Analytics = React.lazy(() => import('../Analytics/Analytics'));
const Settings = React.lazy(() => import('../Settings/Settings'));
const UserManagement = React.lazy(() => import('../Admin/UserManagement'));

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <TransactionList />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      case 'users':
        return <UserManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-6">
          <Suspense fallback={
            <Card className="h-96 animate-pulse bg-muted" />
          }>
            {renderContent()}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;