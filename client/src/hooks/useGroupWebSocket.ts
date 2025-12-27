import { useState, useEffect, useCallback } from 'react';
import { UserGroup } from '@/lib/types';

interface DrawPosition {
  position: number;
  userId: number;
  name: string;
  delay?: number;
}

interface DrawData {
  groupId: number;
  finalPositions: DrawPosition[];
  animationSequence: DrawPosition[];
}

/**
 * Hook: Group WebSocket for Real-time Updates
 * Connects to WebSocket for all user's groups to receive real-time updates like draws
 */
export const useGroupWebSocket = (userGroups: UserGroup[]) => {
  const [wsConnections, setWsConnections] = useState<Map<number, WebSocket>>(new Map());
  const [activeDraw, setActiveDraw] = useState<DrawData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<Map<number, 'connecting' | 'connected' | 'disconnected'>>(new Map());

  // Connect to a specific group
  const connectToGroup = useCallback((groupId: number) => {
    if (wsConnections.has(groupId)) {
      return; // Already connected
    }

    setConnectionStatus(prev => new Map(prev).set(groupId, 'connecting'));

    const ws = new WebSocket(`ws://localhost:6001/groups/${groupId}`);

    ws.onopen = () => {
      console.log(`Conectado al WebSocket del grupo ${groupId}`);
      setConnectionStatus(prev => new Map(prev).set(groupId, 'connected'));
      setWsConnections(prev => new Map(prev).set(groupId, ws));
    };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log(`Mensaje WebSocket recibido para grupo ${groupId}:`, data);

          if (data.type === 'DRAW_STARTED') {
            console.log(`🎯 Iniciando animación del sorteo para grupo ${groupId}`);
            console.log('Datos del sorteo:', data);

            // Show draw animation for this group
            setActiveDraw({
              groupId,
              finalPositions: data.finalPositions || data.animationSequence || [],
              animationSequence: data.animationSequence || data.finalPositions || [],
            });
          }
        } catch (error) {
          console.error('Error procesando mensaje WebSocket:', error);
        }
      };

    ws.onerror = (error) => {
      console.error(`Error en WebSocket del grupo ${groupId}:`, error);
      setConnectionStatus(prev => new Map(prev).set(groupId, 'disconnected'));
    };

    ws.onclose = () => {
      console.log(`WebSocket desconectado del grupo ${groupId}`);
      setConnectionStatus(prev => new Map(prev).set(groupId, 'disconnected'));
      setWsConnections(prev => {
        const newMap = new Map(prev);
        newMap.delete(groupId);
        return newMap;
      });
    };
  }, [wsConnections]);

  // Disconnect from a specific group
  const disconnectFromGroup = useCallback((groupId: number) => {
    const ws = wsConnections.get(groupId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
    setWsConnections(prev => {
      const newMap = new Map(prev);
      newMap.delete(groupId);
      return newMap;
    });
    setConnectionStatus(prev => {
      const newMap = new Map(prev);
      newMap.delete(groupId);
      return newMap;
    });
  }, [wsConnections]);

  // Connect to all user's groups when userGroups changes
  useEffect(() => {
    const groupIds = userGroups.map(ug => ug.groupId);

    // Connect to new groups
    groupIds.forEach(groupId => {
      if (!wsConnections.has(groupId)) {
        connectToGroup(groupId);
      }
    });

    // Disconnect from groups no longer in user's groups
    Array.from(wsConnections.keys()).forEach(groupId => {
      if (!groupIds.includes(groupId)) {
        disconnectFromGroup(groupId);
      }
    });
  }, [userGroups, connectToGroup, disconnectFromGroup, wsConnections]);

  // Cleanup all connections on unmount
  useEffect(() => {
    return () => {
      wsConnections.forEach((ws, groupId) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      });
    };
  }, [wsConnections]);

  // Clear active draw
  const clearActiveDraw = useCallback(() => {
    setActiveDraw(null);
  }, []);

  return {
    activeDraw,
    connectionStatus,
    clearActiveDraw,
  };
};
