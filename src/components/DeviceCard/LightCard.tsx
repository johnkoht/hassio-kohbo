import React from 'react';
import DeviceCard from './DeviceCard';
import { hassApiFetch } from '../../api/hassApiFetch';
import { useEntityState } from '../../contexts/HassContext';
import { useModal } from '../../contexts/ModalContext';
import { ReactComponent as LightIcon } from '../../assets/device_icons/light.svg';
import { ReactComponent as LampIcon } from '../../assets/device_icons/lamp.svg';
import { ReactComponent as LightstripIcon } from '../../assets/device_icons/shelf_lights.svg';

interface RoomLight {
  entityId: string;
  name: string;
}

export interface LightScene {
  id: string;
  label: string;
  icon: React.ReactNode;
  service?: string; // Home Assistant service to call
  serviceData?: Record<string, any>; // Additional service data
}

interface LightCardProps {
  entityId: string;
  name: string;
  lightType: 'ceiling' | 'lightstrip' | 'lamp';
  roomName?: string;
  roomLights?: RoomLight[];
  scenes?: LightScene[]; // Available scenes for this light/room
}

function getLightStateString(entity: any): string {
  if (!entity) return '--';
  const { state, attributes } = entity;
  let result = state === 'on' ? 'On' : 'Off';
  // Dimmable
  if (state === 'on' && attributes.brightness !== undefined) {
    const percent = Math.round(attributes.brightness / 2.55);
    result += ` – ${percent}%`;
  }
  // Colored
  // if (state === 'on' && attributes.rgb_color) {
  //   const [r, g, b] = attributes.rgb_color;
  //   // Show color as a colored dot or hex (here, just append hex)
  //   const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  //   result += ` – ${hex}`;
  // }
  return result;
}

function getLightIcon(lightType: 'ceiling' | 'lightstrip' | 'lamp') {
  switch (lightType) {
    case 'ceiling':
      return <LightIcon />;
    case 'lightstrip':
      return <LightstripIcon />;
    case 'lamp':
      return <LampIcon />;
    default:
      return <LightIcon />;
  }
}

export default function LightCard({ entityId, name, lightType, roomName, roomLights, scenes }: LightCardProps) {
  const entity = useEntityState(entityId);
  const { openModal } = useModal();

  function toggleLight() {
    hassApiFetch(`/api/services/light/turn_${entity?.state === 'on' ? 'off' : 'on'}`, {
      method: 'POST',
      body: JSON.stringify({ entity_id: entityId }),
    });
  }

  function handleMoreOptions() {
    // Create modal entityId format: "roomName|light1EntityId:light1Name|light2EntityId:light2Name|...|SCENES|scene1Id:scene1Label:scene1Service|scene2Id:scene2Label:scene2Service|..."
    let modalEntityId = '';
    
    console.log('Opening light modal with:', { roomName, roomLights, scenes });
    
    if (roomName && roomLights && roomLights.length > 1) {
      const lightParts = roomLights.map(light => `${light.entityId}:${light.name}`);
      modalEntityId = `${roomName}|${lightParts.join('|')}`;
    } else {
      // Fallback to single light format for backwards compatibility
      modalEntityId = `${roomName || 'Light'}|${entityId}:${name}`;
    }
    
    console.log('Base modal entity ID:', modalEntityId);
    
    // Add scenes if provided
    if (scenes && scenes.length > 0) {
      const sceneParts = scenes.map(scene => 
        `${scene.id}:${scene.label}:${scene.service || ''}:${JSON.stringify(scene.serviceData || {})}`
      );
      modalEntityId += `|SCENES|${sceneParts.join('|')}`;
      console.log('Scene parts:', sceneParts);
    }
    
    console.log('Final modal entity ID:', modalEntityId);
    openModal('light', modalEntityId);
  }

  return (
    <DeviceCard
      icon={getLightIcon(lightType)}
      name={name}
      state={getLightStateString(entity)}
      isActive={entity?.state === 'on'}
      onClick={toggleLight}
      onMoreOptions={handleMoreOptions}
    />
  );
} 