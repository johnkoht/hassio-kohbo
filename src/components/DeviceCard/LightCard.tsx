import React from 'react';
import DeviceCard from './DeviceCard';
import { hassApiFetch } from '../../api/hassApiFetch';
import { useEntityState } from '../../contexts/HassContext';
import { ReactComponent as LightIcon } from '../../assets/device_icons/light.svg';
import { ReactComponent as LampIcon } from '../../assets/device_icons/lamp.svg';
import { ReactComponent as LightstripIcon } from '../../assets/device_icons/shelf_lights.svg';

interface LightCardProps {
  entityId: string;
  name: string;
  lightType: 'ceiling' | 'lightstrip' | 'lamp';
}

function getLightStateString(entity: any): string {
  if (!entity) return '--';
  const { state, attributes } = entity;
  let result = state === 'on' ? 'On' : 'Off';
  // Dimmable
  if (state === 'on' && attributes.brightness !== undefined) {
    const percent = Math.round(attributes.brightness / 2.55);
    result += ` – ${percent}%`;
  }
  // Colored
  // if (state === 'on' && attributes.rgb_color) {
  //   const [r, g, b] = attributes.rgb_color;
  //   // Show color as a colored dot or hex (here, just append hex)
  //   const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  //   result += ` – ${hex}`;
  // }
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

export default function LightCard({ entityId, name, lightType }: LightCardProps) {
  const entity = useEntityState(entityId);

  function toggleLight() {
    hassApiFetch(`/api/services/light/turn_${entity?.state === 'on' ? 'off' : 'on'}`, {
      method: 'POST',
      body: JSON.stringify({ entity_id: entityId }),
    });
  }

  return (
    <DeviceCard
      icon={getLightIcon(lightType)}
      name={name}
      state={getLightStateString(entity)}
      isActive={entity?.state === 'on'}
      onClick={toggleLight}
      onMoreOptions={() => {}}
    />
  );
} 