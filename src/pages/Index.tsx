
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

const AppContent = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [showRegistration, setShowRegistration] = useState(false);
  const [showAuthSection, setShowAuthSection] = useState(false);

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

  // Si está autenticado, mostrar dashboard correspondiente
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
