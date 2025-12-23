
import React, { createContext, useContext, useState, ReactNode } from 'react';

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

interface UserGroup {
  id: number;
  userId: number;
  groupId: number;
  posicion: number;
  fechaUnion: Date;
  user?: any;
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

  const [productos] = useState<Producto[]>([
    {
      id: 1,
      nombre: 'Lavadora Samsung',
      precioUsd: 450,
      precioVes: 12500000,
      tiempoDuracion: 8,
      descripcion: 'Lavadora automática con capacidad de 15kg',
      activo: true
    },
    {
      id: 2,
      nombre: 'Refrigerador LG',
      precioUsd: 600,
      precioVes: 16666667,
      tiempoDuracion: 8,
      descripcion: 'Refrigerador side by side de 500L',
      activo: true
    },
    {
      id: 3,
      nombre: 'TV LED 55"',
      precioUsd: 300,
      precioVes: 8333333,
      tiempoDuracion: 10,
      descripcion: 'Smart TV LED 4K con Android TV',
      activo: true
    },
    {
      id: 4,
      nombre: 'Microondas Panasonic',
      precioUsd: 150,
      precioVes: 4166667,
      tiempoDuracion: 10,
      descripcion: 'Microondas digital de 1.2 cu ft',
      activo: true
    }
  ]);

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
