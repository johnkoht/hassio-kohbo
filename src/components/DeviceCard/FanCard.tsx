import React from 'react';
import DeviceCard from './DeviceCard';
import { hassApiFetch } from '../../api/hassApiFetch';
import { useEntityState } from '../../contexts/HassContext';
import { useModal } from '../../contexts/ModalContext';
import { ReactComponent as AirPurifierIcon } from '../../assets/device_icons/air_purifier.svg';

interface FanCardProps {
  entityId: string;
  name: string;
}

function getFanStateString(entity: any): string {
  if (!entity) return '--';
  const { state, attributes } = entity;
  
  if (state === 'off') return 'Off';
  
  // Fan is running - could be 'on' or a preset mode like 'auto'
  if (state !== 'off') {
    // Check for speed/preset mode
    if (attributes.preset_mode) {
      return `On – ${attributes.preset_mode}`;
    }
    if (attributes.percentage) {
      return `On – ${attributes.percentage}%`;
    }
    // If state is a preset mode (like 'auto'), show that
    if (state !== 'on') {
      return `On – ${state}`;
    }
    return 'On';
  }
  
  return state.charAt(0).toUpperCase() + state.slice(1);
}

export default function FanCard({ entityId, name }: FanCardProps) {
  const entity = useEntityState(entityId);
  const { openModal } = useModal();



  function toggleFan() {
    hassApiFetch(`/api/services/fan/turn_${entity?.state === 'on' ? 'off' : 'on'}`, {
      method: 'POST',
      body: JSON.stringify({ entity_id: entityId }),
    });
  }

  function handleMoreOptions() {
    // Open fan modal with entityId and name
    openModal('fan', `${entityId}|${name}`);
  }

  return (
    <DeviceCard
      icon={<AirPurifierIcon />}
      name={name}
      state={getFanStateString(entity)}
      isActive={entity?.state !== 'off'}
      onClick={toggleFan}
      onMoreOptions={handleMoreOptions}
    />
  );
} 