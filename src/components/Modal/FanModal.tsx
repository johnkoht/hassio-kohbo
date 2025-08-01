import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useModal } from '../../contexts/ModalContext';
import { useEntityState } from '../../contexts/HassContext';
import { hassApiFetch } from '../../api/hassApiFetch';
import VerticalSlider from '../VerticalSlider/VerticalSlider';
import ActionGrid, { ActionItem } from '../ActionGrid/ActionGrid';
import ModalHeader from './shared/ModalHeader';
import { ReactComponent as FanIcon } from '../../assets/device_icons/fan.svg';
import { ReactComponent as PowerIcon } from '../../assets/utils/power.svg';
import { ReactComponent as FanAutoIcon } from '../../assets/utils/fan_auto.svg';
import { ReactComponent as FanManualIcon } from '../../assets/utils/fan_manual.svg';
import { ReactComponent as NightlightIcon } from '../../assets/utils/lights_nightlight.svg';

const ModalContent = styled.div`
  padding: 35px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;



const Section = styled.div`
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
`;

const SectionTitle = styled.h3`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 20px 0;
`;

const PowerButton = styled.button<{ $isOn: boolean }>`
  width: 34px;
  height: 34px;
  border-radius: 17px;
  border: none;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 16px;
    height: 16px;
    fill: ${props => props.$isOn ? '#4CAF50' : '#fff'};
    transition: fill 0.3s ease;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;

const SpeedContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SpeedValue = styled.div`
  font-family: 'Poppins', Arial, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  text-align: center;
  color: #fff;
  background: #6C757D;
  border-radius: 11px;
  height: 22px;
  width: auto;
  padding: 0 8px;
`;

interface FanModalProps {
  entityId: string;
  name: string;
}

// Default preset modes for common air purifiers
const defaultPresetModes: ActionItem[] = [
  { id: 'auto', label: 'Auto', icon: <FanAutoIcon /> },
  { id: 'manual', label: 'Manual', icon: <FanManualIcon /> },
  { id: 'sleep', label: 'Sleep', icon: <NightlightIcon /> },
  
  // COMMENTED OUT - Other modes not currently displayed
  // { id: 'eco', label: 'Eco', icon: <div>🌱</div> },
  // { id: 'turbo', label: 'Turbo', icon: <div>💨</div> },
];

export default function FanModal({ entityId, name }: FanModalProps) {
  const { closeModal } = useModal();
  const entity = useEntityState(entityId);
  const [speed, setSpeed] = useState(0);
  const [isUpdatingSpeed, setIsUpdatingSpeed] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Determine if fan is on (could be 'on' or a preset mode like 'auto')
  const isOn = entity?.state !== 'off';

  // Get current speed percentage (handle null case)
  const currentSpeed = entity?.attributes?.percentage ?? 0;

  // Get available preset modes from entity or use defaults
  const allPresetModes = entity?.attributes?.preset_modes || ['auto', 'manual', 'sleep'];
  
  // Filter to only show the modes we want to display
  const allowedModes = ['auto', 'manual', 'sleep'];
  const presetModes = allPresetModes.filter((mode: string) => 
    allowedModes.includes(mode.toLowerCase())
  );
  
  const currentPresetMode = entity?.attributes?.preset_mode;
  
  // Check if this device supports percentage control
  const supportsPercentage = entity?.attributes?.percentage_step !== undefined;
  const currentPercentage = entity?.attributes?.percentage || 0;
  const percentageStep = entity?.attributes?.percentage_step || 25;
  
  // For Winix devices, map percentage to speed levels
  const getSpeedLevel = (percentage: number) => {
    if (percentage === 0) return 'Off';
    if (percentage <= 25) return 'Low';
    if (percentage <= 50) return 'Medium';
    if (percentage <= 75) return 'High';
    return 'Turbo';
  };
  
  const getPercentageFromSpeedLevel = (level: string) => {
    switch (level) {
      case 'Off': return 0;
      case 'Low': return 25;
      case 'Medium': return 50;
      case 'High': return 75;
      case 'Turbo': return 100;
      default: return 0;
    }
  };
  
  // Check if device is in preset mode (percentage is null) or manual mode
  const isInPresetMode = entity?.attributes?.percentage === null;
  
  // Get display percentage - use actual percentage or estimate from other attributes
  const getDisplayPercentage = () => {
    // FIRST: If device is off, always show 0 regardless of stored attributes
    if (!isOn) {
      return 0;
    }
    
    // If device has a percentage value (manual mode), use it
    if (currentPercentage !== null && currentPercentage !== undefined && !isInPresetMode) {
      return currentPercentage;
    }
    
    // If in preset mode and device is ON, try to estimate speed from other attributes
    // Check for airflow or other speed indicators
    const airflow = entity?.attributes?.airflow;
    if (airflow) {
      switch (airflow.toLowerCase()) {
        case 'low': return 25;
        case 'medium': return 50;
        case 'high': return 75;
        case 'turbo': return 100;
        default: return 15; // Default to low for unknown airflow
      }
    }
    
    // Fallback based on preset mode when device is on
    if (currentPresetMode) {
      switch (currentPresetMode.toLowerCase()) {
        case 'sleep': return 25;
        case 'auto': return 15; // Auto mode typically runs at low speed
        case 'auto (plasmawave off)': return 15;
        case 'manual': return 25; // Manual mode default to low
        case 'manual (plasmawave off)': return 25;
        default: return 15;
      }
    }
    
    // Default for unknown on state
    return 15;
  };
  
  const displayPercentage = getDisplayPercentage();
  const currentSpeedLevel = getSpeedLevel(displayPercentage);

  // Convert preset modes to ActionItems
  const presetActions: ActionItem[] = presetModes.map((mode: string) => ({
    id: mode,
    label: mode.charAt(0).toUpperCase() + mode.slice(1),
    icon: getPresetIcon(mode)
  }));

  // Update speed when entity state changes
  React.useEffect(() => {
    if (isUpdatingSpeed) return;
    setSpeed(currentSpeed);
  }, [currentSpeed, isUpdatingSpeed]);

  // Update active preset when entity state changes
  React.useEffect(() => {
    setActivePreset(currentPresetMode || null);
  }, [currentPresetMode]);

  const handleToggle = async () => {
    try {
      const action = isOn ? 'turn_off' : 'turn_on';
      await hassApiFetch(`/api/services/fan/${action}`, {
        method: 'POST',
        body: JSON.stringify({ entity_id: entityId }),
      });
    } catch (error) {
      console.error('Failed to toggle fan:', error);
    }
  };

  const handleSpeedChange = useCallback((value: number) => {
    // For devices with percentage steps, snap to nearest step during dragging
    if (supportsPercentage && percentageStep > 1) {
      const snappedValue = Math.round(value / percentageStep) * percentageStep;
      setSpeed(snappedValue);
    } else {
      setSpeed(value);
    }
  }, [supportsPercentage, percentageStep]);

  const handleSpeedRelease = useCallback(async (value: number) => {
    // For devices with percentage steps, snap to nearest step
    let finalValue = value;
    if (supportsPercentage && percentageStep > 1) {
      finalValue = Math.round(value / percentageStep) * percentageStep;
    }
    
    setSpeed(finalValue);
    setIsUpdatingSpeed(true);
    
    try {
      console.log('Setting fan percentage to:', finalValue, `(${getSpeedLevel(finalValue)})`);
      console.log('Current fan state - isOn:', isOn, 'isInPresetMode:', isInPresetMode);
      
      if (finalValue === 0) {
        // Turn off fan if speed is set to 0
        await hassApiFetch('/api/services/fan/turn_off', {
          method: 'POST',
          body: JSON.stringify({ entity_id: entityId }),
        });
      } else {
        // If fan is off, turn it on at the specified speed
        // If fan is in preset mode, switch to manual mode at the specified speed
        // This covers both scenarios: off->on and preset->manual
        await hassApiFetch('/api/services/fan/set_percentage', {
          method: 'POST',
          body: JSON.stringify({
            entity_id: entityId,
            percentage: finalValue,
          }),
        });
      }
      
      setTimeout(() => {
        setIsUpdatingSpeed(false);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to set fan speed:', error);
      setIsUpdatingSpeed(false);
    }
  }, [entityId, supportsPercentage, percentageStep, getSpeedLevel, isOn, isInPresetMode]);

  const handlePresetSelect = async (presetId: string) => {
    console.log('Preset selected:', presetId);
    setActivePreset(presetId);
    
    try {
      await hassApiFetch('/api/services/fan/set_preset_mode', {
        method: 'POST',
        body: JSON.stringify({
          entity_id: entityId,
          preset_mode: presetId,
        }),
      });
      
      console.log('Preset mode set successfully');
    } catch (error) {
      console.error('Failed to set preset mode:', error);
    }
  };

  // Use current speed value for slider
  const sliderValue = speed;

  return (
    <ModalContent>
      <ModalHeader 
        title={name}
        onClose={closeModal}
        centered={true}
        marginBottom="40px"
      />

      <Section>
        {supportsPercentage ? (
          <>
            <SpeedValue>
              {!isOn ? 'Off' : (isInPresetMode ? currentPresetMode : currentSpeedLevel)}
            </SpeedValue>
            <SpeedContainer>
              <VerticalSlider
                value={displayPercentage}
                onChange={handleSpeedChange}
                onRelease={handleSpeedRelease}
                disabled={false}
                hideHandle={!isOn}
              />
            </SpeedContainer>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: '5px' }}>
            </div>
          </>
        ) : (
          <SpeedValue>
            {!isOn ? 'Off' : (isInPresetMode ? `Preset: ${currentPresetMode}` : 'Manual Control')}
          </SpeedValue>
        )}
        <PowerButton $isOn={isOn} onClick={handleToggle}>
          <PowerIcon />
        </PowerButton>
      </Section>

      {presetActions.length > 0 && (
        <Section>
          <ActionGrid
            actions={presetActions}
            activeAction={activePreset}
            onActionSelect={handlePresetSelect}
          />
        </Section>
      )}
    </ModalContent>
  );
}

// Helper function to get appropriate icon for preset mode
function getPresetIcon(presetId: string) {
  switch (presetId.toLowerCase()) {
    case 'auto':
      return <FanAutoIcon />;
    case 'auto (plasmawave off)':
      return <FanAutoIcon />; // Same as auto but could be distinguished
    case 'manual':
      return <FanManualIcon />;
    case 'manual (plasmawave off)':
      return <FanManualIcon />; // Manual without plasma
    case 'sleep':
      return <NightlightIcon />;
    
    // COMMENTED OUT - Other modes not currently displayed
    // case 'eco':
    // case 'green':
    //   return <div>🌱</div>;
    // case 'turbo':
    // case 'high':
    // case 'max':
    //   return <div>💨</div>;
    // case 'smart':
    //   return <div>🧠</div>;
    // case 'quiet':
    // case 'silent':
    //   return <div>🤫</div>;
    // case 'breeze':
    //   return <div>🍃</div>;
    // case 'whoosh':
    //   return <div>🌪️</div>;
    
    default:
      return <div>⚙️</div>; // Fallback icon
  }
} 