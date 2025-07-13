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

  useEffect(() => {
    if (!url || !token) return;
    const wsUrl = url.replace(/^http/, 'ws') + '/api/websocket';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    let msgId = 1;
    let subscribed = false;

    ws.onopen = () => {
      console.log('WebSocket connected, authenticating...');
      setIsConnected(true);
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

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setIsInitialized(false);
    };

    return () => {
      ws.close();
    };
  }, [url, token]);

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