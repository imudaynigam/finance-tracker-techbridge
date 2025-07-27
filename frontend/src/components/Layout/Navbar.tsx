import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { getCurrencySymbol } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { preferences } = usePreferences();

  // Debug logging
  console.log('Navbar - preferences:', preferences);
  console.log('Navbar - currency value:', preferences?.currency);

  // Get currency symbol with fallback
  const currencySymbol = getCurrencySymbol(preferences?.currency || 'USD');
  
  console.log('Navbar - currency symbol:', currencySymbol);

  // Get user initials
  const getUserInitials = () => {
    if (!user) return '?';
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) {
      return user.firstName[0].toUpperCase();
    }
    return user.email[0].toUpperCase();
  };

  return (
    <nav className="w-full flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 font-sans">
      <div className="flex items-center gap-4">
        <span className="text-xl font-bold text-primary tracking-tight select-none">FinanceTracker</span>
        <span className="ml-2 px-2 py-1 rounded bg-primary/10 text-primary text-xs font-semibold">
          {currencySymbol}
        </span>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 focus:outline-none hover:opacity-80 transition-opacity">
                <Avatar className="w-10 h-10 border-2 border-primary/20 shadow-sm">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block font-medium text-sm text-foreground">
                  {user.firstName || user.email}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
};

export default Navbar;