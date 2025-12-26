import { useState, useEffect, useCallback } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';

export interface DrawMessage {
  type: 'DRAW_STARTED';
  groupId: number;
  animationSequence: Array<{
    position: number;
    userId: number;
    name: string;
    delay: number;
  }>;
  startTime: number;
  finalPositions: Array<{
    position: number;
    userId: number;
    name: string;
  }>;
}

export interface ConnectedMessage {
  type: 'CONNECTED';
  groupId: number;
  message: string;
}

export type WebSocketMessage = DrawMessage | ConnectedMessage;

export const useGroupRealtime = (groupId: number | null) => {
  const [socket, setSocket] = useState<ReconnectingWebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!groupId) return;

    const WS_PORT = 6001; // Backend WebSocket server port
    const wsUrl = `ws://localhost:${WS_PORT}/groups/${groupId}`;

    const ws = new ReconnectingWebSocket(wsUrl, [], {
      maxRetries: 10,
      startClosed: false,
    });

    ws.onopen = () => {
      console.log(`WebSocket connected to group ${groupId}`);
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('WebSocket message received:', message);
        setLastMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log(`WebSocket disconnected from group ${groupId}`);
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setSocket(ws);

    // Cleanup on unmount or groupId change
    return () => {
      ws.close();
      setSocket(null);
      setIsConnected(false);
      setLastMessage(null);
    };
  }, [groupId]);

  const sendMessage = useCallback((message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, [socket]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
  };
};
