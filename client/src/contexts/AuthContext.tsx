/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  direccion: string;
  correoElectronico: string;
  tipo: 'USUARIO' | 'ADMINISTRADOR';
  estado?: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'SUSPENDIDO' | 'REACTIVADO';
  imagenCedula?: string;
  fechaRegistro: Date;
  ultimoAcceso?: Date;
  aprobadoPor?: number;
  fechaAprobacion?: Date;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login({
        correoElectronico: email,
        password,
      });

      if (response.success && response.data) {
        setUser(response.data.user);
        // Guardar token en localStorage
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('sanmarimar_user', JSON.stringify(response.data.user));
      } else {
        throw new Error(response.message || 'Error en login');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('sanmarimar_user');
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.tipo === 'ADMINISTRADOR';

  // Cargar usuario al inicializar si hay token
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      if (!isMounted) return;

      const token = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('sanmarimar_user');

      if (token && savedUser) {
        try {
          // Verificar que el token sea válido y el usuario esté aprobado
          const response = await apiClient.getCurrentUser();

          if (isMounted && response.success && response.data) {
            const currentUser = response.data.user;
            // Verificar que el usuario esté aprobado o reactivado (no suspendido, rechazado o pendiente)
            if (currentUser.estado === 'APROBADO' || currentUser.estado === 'REACTIVADO') {
              setUser(currentUser);
            } else {
              // Usuario no aprobado, suspendido o pendiente, limpiar datos y forzar logout
              localStorage.removeItem('auth_token');
              localStorage.removeItem('sanmarimar_user');
              setUser(null);
            }
          } else {
            // Token inválido, limpiar
            localStorage.removeItem('auth_token');
            localStorage.removeItem('sanmarimar_user');
            setUser(null);
          }
        } catch (error) {
          console.error('Error verificando sesión:', error);
          // Solo limpiar si es un error de autenticación (401), no por errores de red
          if (
            error.message?.includes('Token') ||
            error.message?.includes('autenticación') ||
            error.message?.includes('401')
          ) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('sanmarimar_user');
            setUser(null);
          }
          // Si es error de red, mantener la sesión local y reintentar después
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
