import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { apiClient } from "@/lib/api";

interface User {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  direccion: string;
  correoElectronico: string;
  tipo: string;
  imagenCedula?: string;
  grupos?: any[];
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
    throw new Error("useAuth must be used within an AuthProvider");
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
        localStorage.setItem(
          "sanmarimar_user",
          JSON.stringify(response.data.user)
        );
      } else {
        throw new Error(response.message || "Error en login");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("sanmarimar_user");
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.tipo === "administrador";

  // Cargar usuario al inicializar si hay token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("auth_token");
      const savedUser = localStorage.getItem("sanmarimar_user");

      if (token && savedUser) {
        try {
          // Verificar que el token sea válido haciendo una llamada a /me
          const response = await apiClient.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data.user);
          } else {
            // Token inválido, limpiar
            localStorage.removeItem("auth_token");
            localStorage.removeItem("sanmarimar_user");
          }
        } catch (error) {
          // Token inválido, limpiar
          localStorage.removeItem("auth_token");
          localStorage.removeItem("sanmarimar_user");
        }
      }
      setIsLoading(false);
    };

    initAuth();
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
