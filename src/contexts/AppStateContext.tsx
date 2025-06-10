
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Grupo, Producto } from '@/types';

interface AppStateContextType {
  grupos: Grupo[];
  productos: Producto[];
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
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [productos] = useState<Producto[]>([
    {
      id: '1',
      nombre: 'Producto Premium',
      valorMensual: 100000,
      valorQuincenal: 50000,
      tiempoDuracion: 12,
      descripcion: 'Producto de ahorro colaborativo premium'
    },
    {
      id: '2',
      nombre: 'Producto Estándar',
      valorMensual: 50000,
      valorQuincenal: 25000,
      tiempoDuracion: 6,
      descripcion: 'Producto de ahorro colaborativo estándar'
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
      selectedGroup,
      setSelectedGroup,
      updateGrupo,
      addGrupo
    }}>
      {children}
    </AppStateContext.Provider>
  );
};
