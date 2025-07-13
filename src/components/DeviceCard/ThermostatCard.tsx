import React from 'react';
import styled from 'styled-components';
import { useEntityState } from '../../contexts/HassContext';
import { hassApiFetch } from '../../api/hassApiFetch';
import { ReactComponent as HeatIcon } from '../../assets/device_icons/hvac_heating.svg';
import { ReactComponent as CoolIcon } from '../../assets/device_icons/hvac_cooling.svg';
import { ReactComponent as HeatCoolIcon } from '../../assets/device_icons/hvac_heat_cool.svg';
import { ReactComponent as EcoIcon } from '../../assets/device_icons/hvac_eco.svg';
import { ReactComponent as HeaterIcon } from '../../assets/device_icons/heater.svg';
import { ReactComponent as ThermostatIncreaseIcon } from '../../assets/device_icons/thermostat_increase.svg';
import { ReactComponent as ThermostatDecreaseIcon } from '../../assets/device_icons/thermostat_decrease.svg';

const Card = styled.div<{ $isActive: boolean }>`
  width: 220px;
  height: 150px;
  background: radial-gradient(68.86% 108.57% at 29.04% 31.2%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%), rgba(233, 236, 239, ${props => props.$isActive ? '0.4' : '0.005'});  
  backdrop-filter: blur(5px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 30px 20px;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  outline: none;
  transform: scale(1);
  
  /* Disable mobile tap highlights */
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  
  &:hover {
    box-shadow: 0 8px 32px rgba(0,0,0,0.16);
  }
  
  &:focus {
    outline: none;
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const IconContainer = styled.div`
  width: 40px;
  height: 35px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  margin-bottom: 21px;
`;

const Name = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  margin-bottom: 8px;
`;

const State = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 15px;
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
`;

const ActionButton = styled.button<{ $isPrimary?: boolean }>`
  background: ${props => props.$isPrimary ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const TempDisplay = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  min-width: 40px;
  text-align: center;
`;

interface ThermostatCardProps {
  entityId: string;
  name: string;
  type: 'hvac' | 'radiant';
}

function getThermostatIcon(mode: string, type: 'hvac' | 'radiant', preset?: string): React.ReactNode {
  // For radiant heating, always use heater icon
  if (type === 'radiant') {
    return <HeaterIcon />;
  }

  // For HVAC systems
  // Check for eco mode or off mode first
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
  const mode = attributes?.hvac_mode || 'off';
  const preset = attributes?.preset_mode;
  const targetTemp = attributes?.temperature;
  const currentTemp = attributes?.current_temperature;
  const fanMode = attributes?.fan_mode;

  // Check for eco mode
  if (preset === 'eco') {
    return 'Eco Mode';
  }

  // Check if fan is running
  if (fanMode === 'on') {
    return 'Fan Running';
  }

  // Check if actively heating/cooling
  if (state === 'heating' && mode === 'heat') {
    return `Heating to ${targetTemp}°`;
  }
  if (state === 'cooling' && mode === 'cool') {
    return `Cooling to ${targetTemp}°`;
  }
  if (state === 'heating' && mode === 'heat_cool') {
    return `Heating to ${targetTemp}°`;
  }
  if (state === 'cooling' && mode === 'heat_cool') {
    return `Cooling to ${targetTemp}°`;
  }

  // Idle states
  if (mode === 'heat') {
    return `Heat - idle`;
  }
  if (mode === 'cool') {
    return `Cool - idle`;
  }
  if (mode === 'heat_cool') {
    return `Heat/Cool - idle`;
  }

  return 'Off';
}

function isThermostatActive(entity: any): boolean {
  if (!entity) return false;
  
  const { state, attributes } = entity;
  const mode = attributes?.hvac_mode || 'off';
  const preset = attributes?.preset_mode;

  return mode !== 'off' && preset !== 'eco';
}

export default function ThermostatCard({ entityId, name, type }: ThermostatCardProps) {
  const entity = useEntityState(entityId);

  const mode = entity?.attributes?.hvac_mode || 'off';
  const preset = entity?.attributes?.preset_mode;
  const targetTemp = entity?.attributes?.temperature;
  const isActive = isThermostatActive(entity);

  const handleModeChange = (newMode: string) => {
    hassApiFetch('/api/services/climate/set_hvac_mode', {
      method: 'POST',
      body: JSON.stringify({ 
        entity_id: entityId,
        hvac_mode: newMode 
      }),
    });
  };

  const handleTempChange = (direction: 'up' | 'down') => {
    const currentTemp = targetTemp || 70;
    const newTemp = direction === 'up' ? currentTemp + 1 : currentTemp - 1;
    
    hassApiFetch('/api/services/climate/set_temperature', {
      method: 'POST',
      body: JSON.stringify({ 
        entity_id: entityId,
        temperature: newTemp 
      }),
    });
  };

  const renderActions = () => {
    if (!isActive) {
      // Show mode selection buttons when off or in eco
      return (
        <ActionsContainer>
          <ActionButton onClick={(e) => { e.stopPropagation(); handleModeChange('heat'); }}>
            Heat
          </ActionButton>
          {type === 'hvac' && (
            <ActionButton onClick={(e) => { e.stopPropagation(); handleModeChange('heat_cool'); }}>
              Heat/Cool
            </ActionButton>
          )}
          <ActionButton onClick={(e) => { e.stopPropagation(); handleModeChange('cool'); }}>
            Cool
          </ActionButton>
        </ActionsContainer>
      );
    } else {
      // Show temperature controls when active
      return (
        <ActionsContainer>
          <ActionButton onClick={(e) => { e.stopPropagation(); handleTempChange('down'); }}>
            -
          </ActionButton>
          <TempDisplay>{targetTemp}°</TempDisplay>
          <ActionButton onClick={(e) => { e.stopPropagation(); handleTempChange('up'); }}>
            +
          </ActionButton>
        </ActionsContainer>
      );
    }
  };

  return (
    <Card $isActive={isActive}>
      <IconContainer>
        {getThermostatIcon(mode, type, preset)}
      </IconContainer>
      <Name>{name}</Name>
      <State>{getThermostatState(entity)}</State>
      {renderActions()}
    </Card>
  );
} 