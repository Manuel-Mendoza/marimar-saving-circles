
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppStateProvider } from '@/contexts/AppStateContext';
import Header from '@/components/Layout/Header';
import LoginForm from '@/components/Auth/LoginForm';
import RegistrationForm from '@/components/Auth/RegistrationForm';
import UserDashboard from '@/components/Dashboard/UserDashboard';
import AdminDashboard from '@/components/Dashboard/AdminDashboard';

const AppContent = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [showRegistration, setShowRegistration] = useState(false);

  if (!isAuthenticated) {
    if (showRegistration) {
      return <RegistrationForm onBack={() => setShowRegistration(false)} />;
    }
    return <LoginForm onNewUser={() => setShowRegistration(true)} />;
  }

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
