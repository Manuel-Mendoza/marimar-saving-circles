
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api';

// Local type definitions for coherence with analysis
interface Grupo {
  id: number;
  nombre: string;
  duracionMeses: number;
  estado: 'SIN_COMPLETAR' | 'LLENO' | 'EN_MARCHA' | 'COMPLETADO';
  fechaInicio?: Date;
  fechaFinal?: Date;
  turnoActual: number;
}

interface Producto {
  id: number;
  nombre: string;
  precioUsd: number;
  precioVes: number;
  tiempoDuracion: number;
  imagen?: string;
  descripcion: string;
  tags?: string[];
  activo: boolean;
}

interface User {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  direccion: string;
  correoElectronico: string;
  tipo: 'USUARIO' | 'ADMINISTRADOR';
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  imagenCedula?: string;
  fechaRegistro: Date;
  ultimoAcceso?: Date;
  aprobadoPor?: number;
  fechaAprobacion?: Date;
}

interface UserGroup {
  id: number;
  userId: number;
  groupId: number;
  posicion: number;
  fechaUnion: Date;
  productoSeleccionado?: string;
  monedaPago?: string;
  user?: User;
  group?: Grupo;
}

interface Contribution {
  id: number;
  userId: number;
  groupId: number;
  monto: number;
  moneda: 'USD' | 'VES';
  fechaPago: Date;
  periodo: string;
  metodoPago?: string;
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'RECHAZADO';
  referenciaPago?: string;
}

interface Delivery {
  id: number;
  userId: number;
  groupId: number;
  productName: string;
  productValue: string;
  fechaEntrega: Date;
  mesEntrega: string;
  estado: 'PENDIENTE' | 'ENTREGADO';
  notas?: string;
}

interface AppStateContextType {
  grupos: Grupo[];
  productos: Producto[];
  userGroups: UserGroup[];
  contributions: Contribution[];
  deliveries: Delivery[];
  selectedGroup: Grupo | null;
  setSelectedGroup: (grupo: Grupo | null) => void;
  updateGrupo: (grupo: Grupo) => void;
  addGrupo: (grupo: Grupo) => void;
  addUserGroup: (userGroup: UserGroup) => void;
  refreshData: () => Promise<void>;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

interface AppStateProviderProps {
  children: ReactNode;
}

export const AppStateProvider = ({ children }: AppStateProviderProps) => {
  const [grupos, setGrupos] = useState<Grupo[]>([]);

  // Fetch groups from API on mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await apiClient.getGroups();
        if (response.success && response.data?.groups) {
          setGrupos(response.data.groups);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
        // Keep empty array or show error
      }
    };

    fetchGroups();
  }, []);

  const [productos, setProductos] = useState<Producto[]>([]);

  // Fetch products from API on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.getProducts();
        if (response.success && response.data?.products) {
          setProductos(response.data.products);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // Keep empty array or show error
      }
    };

    fetchProducts();
  }, []);

  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);

  // Fetch user groups from API on mount
  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        console.log('Fetching user groups...');
        const response = await apiClient.getMyGroups();
        console.log('User groups response:', response);
        if (response.success && response.data?.userGroups) {
          console.log('Setting user groups:', response.data.userGroups);
          setUserGroups(response.data.userGroups);
        } else {
          console.log('No user groups found or error:', response);
        }
      } catch (error) {
        console.error('Error fetching user groups:', error);
        // Keep empty array
      }
    };

    fetchUserGroups();
  }, []);

  const [contributions, setContributions] = useState<Contribution[]>([]);

  // Fetch user contributions from API on mount
  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const response = await apiClient.getMyContributions();
        if (response.success && response.data?.contributions) {
          setContributions(response.data.contributions);
        }
      } catch (error) {
        console.error('Error fetching contributions:', error);
        // Keep empty array
      }
    };

    fetchContributions();
  }, []);

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  // Fetch user deliveries from API on mount
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await apiClient.getMyDeliveries();
        if (response.success && response.data?.deliveries) {
          setDeliveries(response.data.deliveries);
        }
      } catch (error) {
        console.error('Error fetching deliveries:', error);
        // Keep empty array
      }
    };

    fetchDeliveries();
  }, []);

  const [selectedGroup, setSelectedGroup] = useState<Grupo | null>(null);

  const updateGrupo = (grupo: Grupo) => {
    setGrupos(prev => prev.map(g => g.id === grupo.id ? grupo : g));
  };

  const addGrupo = (grupo: Grupo) => {
    setGrupos(prev => [...prev, grupo]);
  };

  const addUserGroup = (userGroup: UserGroup) => {
    setUserGroups(prev => [...prev, userGroup]);
  };

  const refreshData = async () => {
    try {
      // Refresh groups
      const groupsResponse = await apiClient.getGroups();
      if (groupsResponse.success && groupsResponse.data?.groups) {
        setGrupos(groupsResponse.data.groups);
      }

      // Refresh products
      const productsResponse = await apiClient.getProducts();
      if (productsResponse.success && productsResponse.data?.products) {
        setProductos(productsResponse.data.products);
      }

      // Refresh user groups
      const userGroupsResponse = await apiClient.getMyGroups();
      if (userGroupsResponse.success && userGroupsResponse.data?.userGroups) {
        setUserGroups(userGroupsResponse.data.userGroups);
      }

      // Refresh contributions
      const contributionsResponse = await apiClient.getMyContributions();
      if (contributionsResponse.success && contributionsResponse.data?.contributions) {
        setContributions(contributionsResponse.data.contributions);
      }

      // Refresh deliveries
      const deliveriesResponse = await apiClient.getMyDeliveries();
      if (deliveriesResponse.success && deliveriesResponse.data?.deliveries) {
        setDeliveries(deliveriesResponse.data.deliveries);
      }

      console.log('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  return (
    <AppStateContext.Provider value={{
      grupos,
      productos,
      userGroups,
      contributions,
      deliveries,
      selectedGroup,
      setSelectedGroup,
      updateGrupo,
      addGrupo,
      addUserGroup,
      refreshData
    }}>
      {children}
    </AppStateContext.Provider>
  );
};
