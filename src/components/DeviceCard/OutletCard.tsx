import React from 'react';
import DeviceCard from './DeviceCard';
import { hassApiFetch } from '../../api/hassApiFetch';
import { useEntityState } from '../../contexts/HassContext';
import { ReactComponent as PlugIcon } from '../../assets/device_icons/plug.svg';

interface OutletCardProps {
  entityId: string;
  name: string;
}

function getOutletStateString(entity: any): string {
  if (!entity) return '--';
  const { state, attributes } = entity;
  
  if (state === 'on') return 'On';
  if (state === 'off') return 'Off';
  
  return state.charAt(0).toUpperCase() + state.slice(1);
}

export default function OutletCard({ entityId, name }: OutletCardProps) {
  const entity = useEntityState(entityId);

  function toggleOutlet() {
    const domain = entityId.split('.')[0]; // switch or outlet
    hassApiFetch(`/api/services/${domain}/turn_${entity?.state === 'on' ? 'off' : 'on'}`, {
      method: 'POST',
      body: JSON.stringify({ entity_id: entityId }),
    });
  }

  return (
    <DeviceCard
      icon={<PlugIcon />}
      name={name}
      state={getOutletStateString(entity)}
      isActive={entity?.state === 'on'}
      onClick={toggleOutlet}
    />
  );
} 