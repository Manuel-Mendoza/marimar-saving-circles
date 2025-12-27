import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Index, NotFound, DashboardLayout } from '@/components/pages';
import { useAuth } from '@/contexts/AuthContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppStateProvider } from '@/contexts/AppStateContext';

const queryClient = new QueryClient();

const ProtectedDashboardRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  if (user.estado === 'PENDIENTE' || user.estado === 'RECHAZADO') {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('sanmarimar_user');
    window.location.href = '/';
  };

  return <DashboardLayout user={user} onLogout={handleLogout} />;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppStateProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard/*" element={<ProtectedDashboardRoute />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppStateProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
