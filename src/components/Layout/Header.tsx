
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">San Marimar</h1>
          {isAdmin && (
            <span className="bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
              Administrador
            </span>
          )}
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User size={20} />
              <span className="hidden md:inline">
                {user.nombre} {user.apellido}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="bg-transparent border-white text-white hover:bg-white hover:text-blue-800"
            >
              <LogOut size={16} className="mr-2" />
              Salir
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
