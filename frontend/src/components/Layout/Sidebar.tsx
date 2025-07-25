import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  CreditCard, 
  BarChart3, 
  Settings,
  Users
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { hasPermission } = useAuth();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      permission: 'read',
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: CreditCard,
      permission: 'read',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      permission: 'read',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      permission: 'read',
    },
  ];

  // Add admin-only items
  if (hasPermission('admin')) {
    menuItems.push({
      id: 'users',
      label: 'User Management',
      icon: Users,
      permission: 'admin',
    });
  }

  return (
    <div className="w-64 bg-card border-r border-border h-full">
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            if (!hasPermission(item.permission as 'read' | 'write' | 'admin')) {
              return null;
            }

            return (
              <Button
                key={item.id}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-primary/10 text-primary'
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;