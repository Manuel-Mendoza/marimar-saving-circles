
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppStateProvider } from '@/contexts/AppStateContext';
import Header from '@/components/Layout/Header';
import LoginForm from '@/components/Auth/LoginForm';
import RegistrationForm from '@/components/Auth/RegistrationForm';
import UserDashboard from '@/components/Dashboard/UserDashboard';
import AdminDashboard from '@/components/Dashboard/AdminDashboard';
import LandingPage from '@/components/Landing/LandingPage';
import PendingApproval from '@/components/Auth/PendingApproval';

const AppContent = () => {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const [showRegistration, setShowRegistration] = useState(false);
  const [showAuthSection, setShowAuthSection] = useState(false);

  // Mostrar loading mientras se verifica la autenticación
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

  // Si no está autenticado y no ha decidido entrar al sistema, mostrar landing
  if (!isAuthenticated && !showAuthSection) {
    return <LandingPage onGetStarted={() => setShowAuthSection(true)} />;
  }

  // Si no está autenticado pero ya decidió entrar, mostrar formularios
  if (!isAuthenticated) {
    if (showRegistration) {
      return <RegistrationForm onBack={() => setShowRegistration(false)} />;
    }
    return <LoginForm onNewUser={() => setShowRegistration(true)} />;
  }

  // Si está autenticado pero pendiente de aprobación, mostrar vista de espera
  if (user?.estado === 'PENDIENTE') {
    return <PendingApproval />;
  }

  // Si el usuario fue rechazado, mostrar mensaje de rechazo
  if (user?.estado === 'RECHAZADO') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Registro Rechazado
            </h2>
            <p className="text-gray-600 mb-6">
              Lo sentimos, tu solicitud de registro ha sido rechazada.
              Por favor, contacta al administrador para más información.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('sanmarimar_user');
                window.location.reload();
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si está aprobado, mostrar dashboard correspondiente
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {isAdmin ? <AdminDashboard /> : <UserDashboard />}
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <AppStateProvider>
        <AppContent />
      </AppStateProvider>
    </AuthProvider>
  );
};

export default Index;
