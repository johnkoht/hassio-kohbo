import React from 'react';
import {
  DeviceCard,
  DeviceCardIcon,
  DeviceCardInfo,
  DeviceCardActions
} from './shared';
import { useEntityState } from '../../contexts/HassContext';
import { useModal } from '../../contexts/ModalContext';
import { hassApiFetch } from '../../api/hassApiFetch';
import { ReactComponent as HeatIcon } from '../../assets/device_icons/hvac_heating.svg';
import { ReactComponent as CoolIcon } from '../../assets/device_icons/hvac_cooling.svg';
import { ReactComponent as HeatCoolIcon } from '../../assets/device_icons/hvac_heat_cool.svg';
import { ReactComponent as EcoIcon } from '../../assets/device_icons/hvac_eco.svg';
import { ReactComponent as HeaterIcon } from '../../assets/device_icons/heater.svg';
import { ReactComponent as ThermostatIncreaseIcon } from '../../assets/device_icons/thermostat_increase.svg';
import { ReactComponent as ThermostatDecreaseIcon } from '../../assets/device_icons/thermostat_decrease.svg';

interface ThermostatCardProps {
  entityId: string;
  name: string;
  type: 'hvac' | 'radiant';
}

function getThermostatIcon(mode: string, type: 'hvac' | 'radiant', preset?: string): React.ReactNode {
  if (type === 'radiant') {
    return <HeaterIcon />;
  }
  if (preset === 'eco' || mode === 'off') {
    return <EcoIcon />;
  }
  switch (mode) {
    case 'heat':
      return <HeatIcon />;
    case 'cool':
      return <CoolIcon />;
    case 'heat_cool':
      return <HeatCoolIcon />;
    default:
      return <EcoIcon />;
  }
}

function getThermostatState(entity: any): string {
  if (!entity) return '--';
  const { state, attributes } = entity;
  
  // For Nest thermostats, use state as mode and hvac_action for activity
  const mode = state || attributes?.hvac_mode || 'off';
  const preset = attributes?.preset_mode;
  const targetTemp = attributes?.temperature;
  const currentTemp = attributes?.current_temperature;
  const fanMode = attributes?.fan_mode;
  const hvacAction = attributes?.hvac_action;
  
  if (preset === 'eco') return 'Eco Mode';
  if (fanMode === 'on') return 'Fan Running';
  
  // For Nest thermostats, use hvac_action to determine if actively heating/cooling
  if (hvacAction === 'heating') return `Heating to ${targetTemp}°`;
  if (hvacAction === 'cooling') return `Cooling to ${targetTemp}°`;
  
  // If not actively heating/cooling, show the mode
  if (mode === 'heat') return `Heat - idle`;
  if (mode === 'cool') return `Cool - idle`;
  if (mode === 'heat_cool') return `Heat/Cool - idle`;
  
  return 'Off';
}

function isThermostatActive(entity: any): boolean {
  if (!entity) return false;
  const { state, attributes } = entity;
  
  // For Nest thermostats, check if state is not 'off'
  // For other thermostats, check hvac_mode
  const mode = state || attributes?.hvac_mode || 'off';
  const preset = attributes?.preset_mode;
  
  // Debug logging for the active check
  console.log('isThermostatActive check:', {
    state,
    hvac_mode: attributes?.hvac_mode,
    mode,
    preset,
    modeIsOff: mode === 'off',
    presetIsEco: preset === 'eco',
    result: mode !== 'off' && preset !== 'eco'
  });
  
  return mode !== 'off' && preset !== 'eco';
}

export default function ThermostatCard({ entityId, name, type }: ThermostatCardProps) {
  const entity = useEntityState(entityId);
  const { openModal } = useModal();
  
  // For Nest thermostats, use state as the mode, otherwise use hvac_mode
  const mode = entity?.state || entity?.attributes?.hvac_mode || 'off';
  const preset = entity?.attributes?.preset_mode;
  const targetTemp = entity?.attributes?.temperature;
  const currentTemp = entity?.attributes?.current_temperature;
  const hvacAction = entity?.attributes?.hvac_action;
  const isActive = isThermostatActive(entity);

  // Debug logging
  React.useEffect(() => {
    console.log(`ThermostatCard ${entityId} state update:`, {
      entityId,
      state: entity?.state,
      mode,
      hvac_action: entity?.attributes?.hvac_action,
      hvac_mode: entity?.attributes?.hvac_mode,
      preset_mode: entity?.attributes?.preset_mode,
      temperature: entity?.attributes?.temperature,
      current_temperature: entity?.attributes?.current_temperature,
      isActive,
      timestamp: new Date().toISOString()
    });
    
    // Log the full entity object for debugging
    if (entity) {
      console.log(`Full entity object for ${entityId}:`, entity);
      console.log(`All attributes for ${entityId}:`, entity.attributes);
      console.log(`Available attribute keys for ${entityId}:`, Object.keys(entity.attributes || {}));
    }
    
    // Fetch available services for this entity
    const fetchServices = async () => {
      try {
        const response = await hassApiFetch(`/api/states/${entityId}`);
        const entityState = await response.json();
        console.log(`Available services for ${entityId}:`, entityState);
      } catch (error) {
        console.error(`Failed to fetch entity state for ${entityId}:`, error);
      }
    };
    
    fetchServices();
  }, [entity, entityId, isActive]);

  const handleModeChange = async (newMode: string) => {
    console.log(`Setting HVAC mode to ${newMode} for ${entityId}`);
    try {
      const requestBody = { entity_id: entityId, hvac_mode: newMode };
      console.log('API request body:', requestBody);
      
      const response = await hassApiFetch('/api/services/climate/set_hvac_mode', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      
      console.log('API response status:', response.status);
      const responseText = await response.text();
      console.log('API response body:', responseText);
      
      console.log(`Successfully set HVAC mode to ${newMode} for ${entityId}`);
    } catch (error) {
      console.error(`Failed to set HVAC mode to ${newMode} for ${entityId}:`, error);
    }
  };

  const handleTempChange = async (direction: 'up' | 'down') => {
    const currentTemp = targetTemp || 70;
    const newTemp = direction === 'up' ? currentTemp + 1 : currentTemp - 1;
    console.log(`Setting temperature to ${newTemp}° for ${entityId} (${direction} from ${currentTemp}°)`);
    try {
      await hassApiFetch('/api/services/climate/set_temperature', {
        method: 'POST',
        body: JSON.stringify({ entity_id: entityId, temperature: newTemp }),
      });
      console.log(`Successfully set temperature to ${newTemp}° for ${entityId}`);
    } catch (error) {
      console.error(`Failed to set temperature to ${newTemp}° for ${entityId}:`, error);
    }
  };

  let actions: Array<{ label: React.ReactNode; onClick: (e: React.MouseEvent) => void; isPrimary?: boolean }> | null = null;
  
  if (type === 'radiant') {
    // Radiant heating: only show controls when active, no controls when off
    if (isActive) {
      actions = [
        { label: <ThermostatIncreaseIcon />, onClick: (e: React.MouseEvent) => { e.stopPropagation(); handleTempChange('up'); } },
        { label: `${targetTemp}°`, onClick: (e: React.MouseEvent) => {}, isPrimary: true },
        { label: <ThermostatDecreaseIcon />, onClick: (e: React.MouseEvent) => { e.stopPropagation(); handleTempChange('down'); } },
      ];
    }
    // When off, actions = null (no action buttons, just clickable card)
  } else {
    // HVAC thermostat: original logic
    if (!isActive) {
      // Show mode selection buttons when thermostat is off or in eco mode
      actions = [
        { label: <HeatIcon />, onClick: (e: React.MouseEvent) => { e.stopPropagation(); handleModeChange('heat'); } },
        { label: <HeatCoolIcon />, onClick: (e: React.MouseEvent) => { e.stopPropagation(); handleModeChange('heat_cool'); } },
        { label: <CoolIcon />, onClick: (e: React.MouseEvent) => { e.stopPropagation(); handleModeChange('cool'); } },
      ];
    } else {
      // Show temperature controls when thermostat is on
      actions = [
        { label: <ThermostatIncreaseIcon />, onClick: (e: React.MouseEvent) => { e.stopPropagation(); handleTempChange('up'); } },
        { label: `${targetTemp}°`, onClick: (e: React.MouseEvent) => {}, isPrimary: true },
        { label: <ThermostatDecreaseIcon />, onClick: (e: React.MouseEvent) => { e.stopPropagation(); handleTempChange('down'); } },
      ];
    }
  }

  const handleCardClick = () => {
    openModal('thermostat', `${entityId}|${type}`);
  };

  return (
    <DeviceCard
      isActive={isActive}
      actions={actions ? <DeviceCardActions actions={actions} /> : null}
      onClick={handleCardClick}
    >
      <DeviceCardIcon>{getThermostatIcon(mode, type, preset)}</DeviceCardIcon>
      <DeviceCardInfo name={name} state={getThermostatState(entity)} />
    </DeviceCard>
  );
} 