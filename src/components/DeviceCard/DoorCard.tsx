import React from 'react';
import DeviceCard from './DeviceCard';
import { useEntityState } from '../../contexts/HassContext';
import { ReactComponent as DoorIcon } from '../../assets/device_icons/door.svg';

interface DoorCardProps {
  entityId: string;
  name: string;
}

function getDoorStateString(entity: any): string {
  if (!entity) return '--';
  const { state } = entity;
  
  if (state === 'on' || state === 'open') return 'Open';
  if (state === 'off' || state === 'closed') return 'Closed';
  
  return state.charAt(0).toUpperCase() + state.slice(1);
}

export default function DoorCard({ entityId, name }: DoorCardProps) {
  const entity = useEntityState(entityId);

  return (
    <DeviceCard
      icon={<DoorIcon />}
      name={name}
      state={getDoorStateString(entity)}
      isActive={entity?.state === 'on' || entity?.state === 'open'}
    />
  );
} 