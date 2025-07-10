import React from 'react';
import DeviceCard from './DeviceCard';
import { hassApiFetch } from '../../api/hassApiFetch';
import { useEntityState } from '../../contexts/HassContext';
import { ReactComponent as AirPurifierIcon } from '../../assets/device_icons/air_purifier.svg';

interface FanCardProps {
  entityId: string;
  name: string;
}

function getFanStateString(entity: any): string {
  if (!entity) return '--';
  const { state, attributes } = entity;
  
  if (state === 'off') return 'Off';
  if (state === 'on') {
    // Check for speed/preset mode
    if (attributes.preset_mode) {
      return `On – ${attributes.preset_mode}`;
    }
    if (attributes.percentage) {
      return `On – ${attributes.percentage}%`;
    }
    return 'On';
  }
  
  return state.charAt(0).toUpperCase() + state.slice(1);
}

export default function FanCard({ entityId, name }: FanCardProps) {
  const entity = useEntityState(entityId);

  function toggleFan() {
    hassApiFetch(`/api/services/fan/turn_${entity?.state === 'on' ? 'off' : 'on'}`, {
      method: 'POST',
      body: JSON.stringify({ entity_id: entityId }),
    });
  }

  return (
    <DeviceCard
      icon={<AirPurifierIcon />}
      name={name}
      state={getFanStateString(entity)}
      isActive={entity?.state === 'on'}
      onClick={toggleFan}
      onMoreOptions={() => {}}
    />
  );
} 