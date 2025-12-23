
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
  const [grupos, setGrupos] = useState<Grupo[]>([
    {
      id: 1,
      nombre: 'Grupo de 8 meses',
      duracionMeses: 8,
      estado: 'EN_MARCHA',
      fechaInicio: new Date('2025-01-01'),
      turnoActual: 3
    },
    {
      id: 2,
      nombre: 'Grupo de 10 meses',
      duracionMeses: 10,
      estado: 'LLENO',
      fechaInicio: new Date('2025-02-01'),
      turnoActual: 1
    }
  ]);

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

  const [userGroups] = useState<UserGroup[]>([
    {
      id: 1,
      userId: 1, // Assuming current user is 1
      groupId: 1,
      posicion: 2,
      fechaUnion: new Date('2025-01-01')
    }
  ]);

  const [contributions] = useState<Contribution[]>([
    {
      id: 1,
      userId: 1,
      groupId: 1,
      monto: 75,
      moneda: 'USD',
      fechaPago: new Date('2025-01-15'),
      periodo: '2025-01',
      estado: 'CONFIRMADO'
    },
    {
      id: 2,
      userId: 1,
      groupId: 1,
      monto: 75,
      moneda: 'USD',
      fechaPago: new Date('2025-02-15'),
      periodo: '2025-02',
      estado: 'CONFIRMADO'
    }
  ]);

  const [deliveries] = useState<Delivery[]>([
    {
      id: 1,
      userId: 2,
      groupId: 1,
      productName: 'Lavadora Samsung',
      productValue: '$450',
      fechaEntrega: new Date('2025-01-31'),
      mesEntrega: '2025-01',
      estado: 'ENTREGADO'
    },
    {
      id: 2,
      userId: 3,
      groupId: 1,
      productName: 'Refrigerador LG',
      productValue: '$600',
      fechaEntrega: new Date('2025-02-28'),
      mesEntrega: '2025-02',
      estado: 'ENTREGADO'
    }
  ]);

  const [selectedGroup, setSelectedGroup] = useState<Grupo | null>(null);

  const updateGrupo = (grupo: Grupo) => {
    setGrupos(prev => prev.map(g => g.id === grupo.id ? grupo : g));
  };

  const addGrupo = (grupo: Grupo) => {
    setGrupos(prev => [...prev, grupo]);
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
      addGrupo
    }}>
      {children}
    </AppStateContext.Provider>
  );
};
