import React from 'react';
import { ReactComponent as LeakWetIcon } from '../../assets/device_icons/leak_wet.svg';
import { ReactComponent as LeakDryIcon } from '../../assets/device_icons/leak_dry.svg';
import DeviceCard from './shared/DeviceCard';
import DeviceCardIcon from './shared/DeviceCardIcon';
import DeviceCardInfo from './shared/DeviceCardInfo';

interface LeakSensorCardProps {
  entityId: string;
  name: string;
  state?: string; // 'on' for wet, 'off' for dry
}

export default function LeakSensorCard({ entityId, name, state }: LeakSensorCardProps) {
  const isWet = state === 'on';
  return (
    <DeviceCard isActive={isWet}>
      <DeviceCardIcon>
        {isWet ? <LeakWetIcon /> : <LeakDryIcon />}
      </DeviceCardIcon>
      <DeviceCardInfo
        name={name}
        state={isWet ? 'Leak Detected' : 'Dry'}
      />
    </DeviceCard>
  );
} 