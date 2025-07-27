import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TransactionProvider } from "@/contexts/TransactionContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import LoginForm from "@/components/Auth/LoginForm";
import MainLayout from "@/components/Layout/MainLayout";
import { useEffect } from "react";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Set document title
  useEffect(() => {
    document.title = "Finance Tracker";
  }, []);
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <LoginForm />;
  }
  
  return <MainLayout />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <PreferencesProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <TransactionProvider>
              <AppContent />
            </TransactionProvider>
          </AuthProvider>
        </TooltipProvider>
      </PreferencesProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
