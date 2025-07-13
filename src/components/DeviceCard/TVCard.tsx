import React from 'react';
import {
  DeviceCard,
  DeviceCardIcon,
  DeviceCardInfo,
  DeviceCardMoreOptions
} from './shared';
import { useEntityState } from '../../contexts/HassContext';
import { useModal } from '../../contexts/ModalContext';
import { hassApiFetch } from '../../api/hassApiFetch';
import { ReactComponent as TVIcon } from '../../assets/device_icons/tv.svg';

interface TVCardProps {
  entityId: string;
  name: string;
}

function getTVStateString(entity: any): string {
  if (!entity) return '--';
  const { state } = entity;
  
  if (state === 'playing') return 'Playing';
  if (state === 'paused') return 'Paused';
  if (state === 'idle') return 'Idle';
  if (state === 'off') return 'Off';
  
  return state.charAt(0).toUpperCase() + state.slice(1);
}

export default function TVCard({ entityId, name }: TVCardProps) {
  const entity = useEntityState(entityId);
  const { openModal } = useModal();

  function toggleTV() {
    const service = entity?.state === 'off' ? 'media_player/turn_on' : 'media_player/turn_off';
    hassApiFetch(`/api/services/${service}`, {
      method: 'POST',
      body: JSON.stringify({ entity_id: entityId }),
    });
  }

  function handleMoreOptions() {
    openModal('tv', `${entityId}|${name}`);
  }

  return (
    <DeviceCard
      isActive={entity?.state !== 'off'}
      onClick={toggleTV}
      actions={null}
    >
      <DeviceCardIcon>
        <TVIcon />
      </DeviceCardIcon>
      <DeviceCardInfo name={name} state={getTVStateString(entity)} />
      <DeviceCardMoreOptions onClick={handleMoreOptions} />
    </DeviceCard>
  );
} 