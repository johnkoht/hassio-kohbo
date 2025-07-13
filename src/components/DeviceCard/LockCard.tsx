import React from 'react';
import {
  DeviceCard,
  DeviceCardIcon,
  DeviceCardInfo
} from './shared';
import { hassApiFetch } from '../../api/hassApiFetch';
import { useEntityState } from '../../contexts/HassContext';
import { ReactComponent as LockedIcon } from '../../assets/device_icons/lock_locked.svg';
import { ReactComponent as UnlockedIcon } from '../../assets/device_icons/lock_unlocked.svg';

interface LockCardProps {
  entityId: string;
  name: string;
}

function getLockStateString(entity: any): string {
  if (!entity) return '--';
  const { state } = entity;
  if (state === 'locked') return 'Locked';
  if (state === 'unlocked') return 'Unlocked';
  if (state === 'locking') return 'Locking...';
  if (state === 'unlocking') return 'Unlocking...';
  return state.charAt(0).toUpperCase() + state.slice(1);
}

export default function LockCard({ entityId, name }: LockCardProps) {
  const entity = useEntityState(entityId);

  function toggleLock() {
    const service = entity?.state === 'locked' ? 'lock/unlock' : 'lock/lock';
    hassApiFetch(`/api/services/${service}`, {
      method: 'POST',
      body: JSON.stringify({ entity_id: entityId }),
    });
  }

  const isLocked = entity?.state === 'locked';
  const isTransitioning = entity?.state === 'locking' || entity?.state === 'unlocking';

  return (
    <DeviceCard
      isActive={isLocked}
      onClick={isTransitioning ? undefined : toggleLock}
      actions={null}
    >
      <DeviceCardIcon>{isLocked ? <LockedIcon /> : <UnlockedIcon />}</DeviceCardIcon>
      <DeviceCardInfo name={name} state={getLockStateString(entity)} />
    </DeviceCard>
  );
} 