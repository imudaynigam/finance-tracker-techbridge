import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

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

  return (
    <nav className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">FinanceTracker</span>
          </div>
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{user.name}</span>
              <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                {user.role}
              </Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={logout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;