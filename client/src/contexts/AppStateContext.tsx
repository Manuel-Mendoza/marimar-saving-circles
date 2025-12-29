import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Grupo, Producto, User, UserGroup, Contribution, Delivery } from '@/lib/types';

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

/* eslint-disable react-refresh/only-export-components */
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
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  // Fetch all initial data sequentially to avoid rate limiting
  // Only fetch after authentication check is complete
  useEffect(() => {
    // Don't fetch if auth is still loading or user is not authenticated
    if (authLoading || !isAuthenticated) return;

    let isMounted = true;

    const fetchInitialData = async () => {
      if (!isMounted) return;

      try {
        // Fetch groups first
        const groupsResponse = await apiClient.getGroups();
        if (isMounted && groupsResponse.success && groupsResponse.data?.groups) {
          setGrupos(groupsResponse.data.groups);
        }

        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));

        // Fetch products
        const productsResponse = await apiClient.getProducts();
        if (isMounted && productsResponse.success && productsResponse.data?.products) {
          setProductos(productsResponse.data.products);
        }

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // Fetch user groups
        const userGroupsResponse = await apiClient.getMyGroups();
        if (isMounted && userGroupsResponse.success && userGroupsResponse.data?.userGroups) {
          setUserGroups(userGroupsResponse.data.userGroups);
        }

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // Fetch contributions
        const contributionsResponse = await apiClient.getMyContributions();
        if (
          isMounted &&
          contributionsResponse.success &&
          contributionsResponse.data?.contributions
        ) {
          setContributions(contributionsResponse.data.contributions);
        }

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // Fetch deliveries
        const deliveriesResponse = await apiClient.getMyDeliveries();
        if (isMounted && deliveriesResponse.success && deliveriesResponse.data?.deliveries) {
          setDeliveries(deliveriesResponse.data.deliveries);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        // Keep empty arrays - the app should still work
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, [authLoading, isAuthenticated]);

  const [selectedGroup, setSelectedGroup] = useState<Grupo | null>(null);

  const updateGrupo = (grupo: Grupo) => {
    setGrupos(prev => prev.map(g => (g.id === grupo.id ? grupo : g)));
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

      // Small delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // Refresh products
      const productsResponse = await apiClient.getProducts();
      if (productsResponse.success && productsResponse.data?.products) {
        setProductos(productsResponse.data.products);
      }

      // Small delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // Refresh user groups
      const userGroupsResponse = await apiClient.getMyGroups();
      if (userGroupsResponse.success && userGroupsResponse.data?.userGroups) {
        setUserGroups(userGroupsResponse.data.userGroups);
      }

      // Small delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // Refresh contributions
      const contributionsResponse = await apiClient.getMyContributions();
      if (contributionsResponse.success && contributionsResponse.data?.contributions) {
        setContributions(contributionsResponse.data.contributions);
      }

      // Small delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // Refresh deliveries
      const deliveriesResponse = await apiClient.getMyDeliveries();
      if (deliveriesResponse.success && deliveriesResponse.data?.deliveries) {
        setDeliveries(deliveriesResponse.data.deliveries);
      }

      // Data refreshed successfully
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  return (
    <AppStateContext.Provider
      value={{
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
        refreshData,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};
