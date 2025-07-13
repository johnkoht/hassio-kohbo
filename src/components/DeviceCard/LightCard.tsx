import React from 'react';
import {
  DeviceCard,
  DeviceCardIcon,
  DeviceCardInfo,
  DeviceCardMoreOptions
} from './shared';
import { hassApiFetch } from '../../api/hassApiFetch';
import { useEntityState } from '../../contexts/HassContext';
import { useModal } from '../../contexts/ModalContext';
import { ReactComponent as LightIcon } from '../../assets/device_icons/light.svg';
import { ReactComponent as LampIcon } from '../../assets/device_icons/lamp.svg';
import { ReactComponent as LightstripIcon } from '../../assets/device_icons/shelf_lights.svg';

interface RoomLight {
  entityId: string;
  name: string;
  displayName?: string;
}

export interface LightScene {
  id: string;
  label: string;
  icon: React.ReactNode;
  service?: string;
  serviceData?: Record<string, any>;
}

interface LightCardProps {
  entityId: string;
  name: string;
  lightType: 'ceiling' | 'lightstrip' | 'lamp';
  roomName?: string;
  roomLights?: RoomLight[];
  scenes?: LightScene[];
}

function getLightStateString(entity: any): string {
  if (!entity) return '--';
  const { state, attributes } = entity;
  let result = state === 'on' ? 'On' : 'Off';
  if (state === 'on' && attributes.brightness !== undefined) {
    const percent = Math.round(attributes.brightness / 2.55);
    result += ` – ${percent}%`;
  }
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
    let modalEntityId = '';
    if (roomName && roomLights && roomLights.length > 1) {
      const lightParts = roomLights.map(light =>
        `${light.entityId}:${light.name}:${light.displayName || ''}`
      );
      modalEntityId = `${roomName}|${lightParts.join('|')}`;
    } else {
      modalEntityId = `${roomName || 'Light'}|${entityId}:${name}:`;
    }
    if (scenes && scenes.length > 0) {
      const sceneParts = scenes.map(scene =>
        `${scene.id}:${scene.label}:${scene.service || ''}:${JSON.stringify(scene.serviceData || {})}`
      );
      modalEntityId += `|SCENES|${sceneParts.join('|')}`;
    }
    openModal('light', modalEntityId);
  }

  return (
    <DeviceCard
      isActive={entity?.state === 'on'}
      onClick={toggleLight}
      actions={null}
    >
      <DeviceCardIcon>{getLightIcon(lightType)}</DeviceCardIcon>
      <DeviceCardInfo name={name} state={getLightStateString(entity)} />
      <DeviceCardMoreOptions onClick={handleMoreOptions} />
    </DeviceCard>
  );
} 