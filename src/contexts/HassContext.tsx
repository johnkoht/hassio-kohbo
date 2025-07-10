import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getHassConfig } from '../api/hassConfig';
import { HassEntity } from '../api/hassWebSocket';

interface HassState {
  [entityId: string]: HassEntity;
}

const HassStateContext = createContext<HassState>({});

export function HassProvider({ children }: { children: React.ReactNode }) {
  const [entities, setEntities] = useState<HassState>({});
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
      ws.send(JSON.stringify({ type: 'auth', access_token: token }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'auth_ok') {
        ws.send(JSON.stringify({ id: msgId++, type: 'get_states' }));
      } else if (data.type === 'result' && Array.isArray(data.result)) {
        // Initial state list
        const newEntities: HassState = {};
        data.result.forEach((e: HassEntity) => {
          newEntities[e.entity_id] = e;
        });
        setEntities(newEntities);
        if (!subscribed) {
          ws.send(JSON.stringify({ id: msgId++, type: 'subscribe_events', event_type: 'state_changed' }));
          subscribed = true;
        }
      } else if (data.type === 'event' && data.event?.data?.entity_id) {
        // State changed event
        setEntities(prev => ({
          ...prev,
          [data.event.data.entity_id]: data.event.data.new_state,
        }));
      }
    };

    ws.onerror = (err) => {
      // eslint-disable-next-line no-console
      console.error('WebSocket error:', err);
    };

    return () => {
      ws.close();
    };
  }, [url, token]);

  return (
    <HassStateContext.Provider value={entities}>
      {children}
    </HassStateContext.Provider>
  );
}

export function useEntityState(entityId: string): HassEntity | undefined {
  const entities = useContext(HassStateContext);
  return entities[entityId];
} 