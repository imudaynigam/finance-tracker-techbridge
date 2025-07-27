import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Home, BarChart2, Settings, Users, LogOut, CreditCard, Eye } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navItems = [
    { to: '/', label: 'Dashboard', icon: Home },
  ];
  
  // Add transactions for regular users and read-only users
  if (user?.role === 'user' || user?.role === 'read-only') {
    navItems.push({ to: '/transactions', label: 'Transactions', icon: CreditCard });
  }
  
  navItems.push(
    { to: '/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/settings', label: 'Settings', icon: Settings }
  );
  
  if (user?.role === 'admin') {
    navItems.push({ to: '/admin', label: 'Admin', icon: Users });
  }

  return (
    <aside className="h-full w-56 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col py-6 px-3 gap-2 font-sans">
      {/* Read-Only Indicator */}
      {user?.role === 'read-only' && (
        <div className="mb-4 px-3 py-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Eye className="w-4 h-4" />
            <span className="text-xs font-medium">Read-Only Mode</span>
          </div>
        </div>
      )}
      
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors font-medium text-base',
                isActive
                  ? 'bg-primary/10 text-primary border-l-4 border-primary shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/50'
              )
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
            {user?.role === 'read-only' && label === 'Transactions' && (
              <Eye className="w-3 h-3 ml-auto text-blue-500" />
            )}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={logout}
        className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-destructive hover:bg-destructive/10 font-medium text-base transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;