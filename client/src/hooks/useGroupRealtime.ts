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
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [maxConnectionAttempts] = useState(3); // Limit reconnection attempts

  // Initialize WebSocket connection
  useEffect(() => {
    if (!groupId) return;

    // Reset attempts for new group
    setConnectionAttempts(0);

    const WS_PORT = 6001; // Backend WebSocket server port
    const wsUrl = `ws://localhost:${WS_PORT}/groups/${groupId}`;

    const ws = new ReconnectingWebSocket(wsUrl, [], {
      maxRetries: maxConnectionAttempts,
      startClosed: false,
    });

    ws.onopen = () => {
      setIsConnected(true);
      setConnectionAttempts(0); // Reset on successful connection
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

    ws.onclose = (event) => {
      setIsConnected(false);

      // Check if we should stop retrying
      if (event.code === 1006 || connectionAttempts >= maxConnectionAttempts) {
        ws.close();
        return;
      }

      setConnectionAttempts(prev => prev + 1);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionAttempts(prev => prev + 1);

      // Stop retrying if we've exceeded max attempts
      if (connectionAttempts >= maxConnectionAttempts) {
        ws.close();
      }
    };

    setSocket(ws);

    // Cleanup on unmount or groupId change
    return () => {
      ws.close();
      setSocket(null);
      setIsConnected(false);
      setLastMessage(null);
      setConnectionAttempts(0);
    };
  }, [groupId, maxConnectionAttempts, connectionAttempts]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
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
