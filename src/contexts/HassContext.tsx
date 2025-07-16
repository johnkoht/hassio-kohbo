import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getHassConfig } from '../api/hassConfig';
import { HassEntity } from '../api/hassWebSocket';

interface HassState {
  [entityId: string]: HassEntity;
}

interface HassContextType {
  entities: HassState;
  isConnected: boolean;
  isInitialized: boolean;
}

const HassStateContext = createContext<HassContextType>({
  entities: {},
  isConnected: false,
  isInitialized: false,
});

export function HassProvider({ children }: { children: React.ReactNode }) {
  const [entities, setEntities] = useState<HassState>({});
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { url, token } = getHassConfig();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  const baseReconnectDelay = 1000; // Start with 1 second

  const connect = React.useCallback(() => {
    if (!url || !token) {
      console.error('HassContext: Missing URL or token, cannot connect');
      return;
    }

    // Clear any existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    const wsUrl = url.replace(/^http/, 'ws') + '/api/websocket';
    console.log('HassContext: Connecting to WebSocket:', wsUrl, `(attempt ${reconnectAttemptsRef.current + 1})`);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    let msgId = 1;
    let subscribed = false;

    ws.onopen = () => {
      console.log('WebSocket connected, authenticating...');
      setIsConnected(true);
      reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
      ws.send(JSON.stringify({ type: 'auth', access_token: token }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'auth_ok') {
        console.log('WebSocket authenticated, fetching initial states...');
        ws.send(JSON.stringify({ id: msgId++, type: 'get_states' }));
      } else if (data.type === 'result' && Array.isArray(data.result)) {
        // Initial state list
        console.log('Received initial states:', data.result.length, 'entities');
        const newEntities: HassState = {};
        data.result.forEach((e: HassEntity) => {
          newEntities[e.entity_id] = e;
        });
        setEntities(newEntities);
        setIsInitialized(true);
        if (!subscribed) {
          ws.send(JSON.stringify({ id: msgId++, type: 'subscribe_events', event_type: 'state_changed' }));
          subscribed = true;
          console.log('Subscribed to state changes');
        }
      } else if (data.type === 'event' && data.event?.data?.entity_id) {
        // State changed event
        console.log('State change received:', {
          entityId: data.event.data.entity_id,
          oldState: data.event.data.old_state?.state,
          newState: data.event.data.new_state?.state,
          oldHvacMode: data.event.data.old_state?.attributes?.hvac_mode,
          newHvacMode: data.event.data.new_state?.attributes?.hvac_mode,
          timestamp: new Date().toISOString()
        });
        setEntities(prev => ({
          ...prev,
          [data.event.data.entity_id]: data.event.data.new_state,
        }));
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setIsConnected(false);
    };

    ws.onclose = (event) => {
      console.log('WebSocket disconnected', { code: event.code, reason: event.reason });
      setIsConnected(false);
      setIsInitialized(false);
      
      // Attempt to reconnect if we haven't exceeded max attempts
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current), 30000); // Max 30 seconds
        console.log(`Scheduling reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      } else {
        console.error('Max reconnection attempts reached. Please refresh the page.');
      }
    };
  }, [url, token]);

  // Handle page visibility changes (PWA wake/sleep)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, checking connection...');
        // If we're not connected and the WebSocket is closed, reconnect
        if (!isConnected && (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED)) {
          console.log('Reconnecting after page became visible...');
          reconnectAttemptsRef.current = 0; // Reset attempts when manually reconnecting
          connect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isConnected, connect]);

  // Initial connection
  useEffect(() => {
    console.log('HassContext: Initializing with config:', { url, token: token ? '***' : 'missing' });
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return (
    <HassStateContext.Provider value={{ entities, isConnected, isInitialized }}>
      {children}
    </HassStateContext.Provider>
  );
}

export function useEntityState(entityId: string): HassEntity | undefined {
  const { entities } = useContext(HassStateContext);
  return entities[entityId];
}

export function useHassConnection() {
  const { isConnected, isInitialized } = useContext(HassStateContext);
  return { isConnected, isInitialized };
} 