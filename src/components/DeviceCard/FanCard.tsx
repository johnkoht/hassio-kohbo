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
import { ReactComponent as AirPurifierIcon } from '../../assets/device_icons/air_purifier.svg';

interface FanCardProps {
  entityId: string;
  name: string;
}

function getFanStateString(entity: any): string {
  if (!entity) return '--';
  const { state, attributes } = entity;
  if (state === 'off') return 'Off';
  if (state !== 'off') {
    if (attributes.preset_mode) {
      return `On – ${attributes.preset_mode}`;
    }
    if (attributes.percentage) {
      return `On – ${attributes.percentage}%`;
    }
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
    openModal('fan', `${entityId}|${name}`);
  }

  return (
    <DeviceCard
      isActive={entity?.state !== 'off'}
      onClick={toggleFan}
      actions={null}
    >
      <DeviceCardIcon><AirPurifierIcon /></DeviceCardIcon>
      <DeviceCardInfo name={name} state={getFanStateString(entity)} />
      <DeviceCardMoreOptions onClick={handleMoreOptions} />
    </DeviceCard>
  );
} 