import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserPreferences {
  emailNotifications: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  budgetAlerts: boolean;
  currency: string;
  dateFormat: string;
}

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
  emailNotifications: true,
  weeklyReports: false,
  monthlyReports: true,
  budgetAlerts: true,
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
};

const PreferencesContext = createContext<PreferencesContextType | null>(null);

interface PreferencesProviderProps {
  children: ReactNode;
}

export const PreferencesProvider: React.FC<PreferencesProviderProps> = ({ children }) => {
  const [preferences, setPreferencesState] = useState<UserPreferences>(() => {
    // Load preferences from localStorage or use defaults
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      try {
        return { ...defaultPreferences, ...JSON.parse(savedPreferences) };
      } catch (error) {
        console.error('Error parsing saved preferences:', error);
        return defaultPreferences;
      }
    }
    return defaultPreferences;
  });

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferencesState(newPreferences);
    localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
  };

  const resetPreferences = () => {
    setPreferencesState(defaultPreferences);
    localStorage.setItem('userPreferences', JSON.stringify(defaultPreferences));
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences, resetPreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}; 