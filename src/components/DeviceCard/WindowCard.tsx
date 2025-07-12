import React from 'react';
import DeviceCard from './DeviceCard';
import { useEntityState } from '../../contexts/HassContext';
import { ReactComponent as WindowIcon } from '../../assets/device_icons/window.svg';

interface WindowCardProps {
  entityId: string;
  name: string;
}

function getWindowStateString(entity: any): string {
  if (!entity) return '--';
  const { state } = entity;
  
  if (state === 'on' || state === 'open') return 'Open';
  if (state === 'off' || state === 'closed') return 'Closed';
  
  return state.charAt(0).toUpperCase() + state.slice(1);
}

export default function WindowCard({ entityId, name }: WindowCardProps) {
  const entity = useEntityState(entityId);

  return (
    <DeviceCard
      icon={<WindowIcon />}
      name={name}
      state={getWindowStateString(entity)}
      isActive={entity?.state === 'on' || entity?.state === 'open'}
    />
  );
} 