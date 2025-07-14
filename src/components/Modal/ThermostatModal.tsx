import React, { useState } from 'react';
import styled from 'styled-components';
import { useModal } from '../../contexts/ModalContext';
import { useEntityState } from '../../contexts/HassContext';
import { hassApiFetch } from '../../api/hassApiFetch';
import ModalHeader from './shared/ModalHeader';
import ActionGrid, { ActionItem } from '../ActionGrid/ActionGrid';
import { ReactComponent as HeatIcon } from '../../assets/device_icons/hvac_heating.svg';
import { ReactComponent as CoolIcon } from '../../assets/device_icons/hvac_cooling.svg';
import { ReactComponent as HeatCoolIcon } from '../../assets/device_icons/hvac_heat_cool.svg';
import { ReactComponent as EcoIcon } from '../../assets/device_icons/hvac_eco.svg';
import { ReactComponent as PowerIcon } from '../../assets/utils/power.svg';
import { ReactComponent as ThermostatIncreaseIcon } from '../../assets/device_icons/thermostat_increase.svg';
import { ReactComponent as ThermostatDecreaseIcon } from '../../assets/device_icons/thermostat_decrease.svg';
import { ReactComponent as TemperatureIcon } from '../../assets/utils/temperature.svg';
import { ReactComponent as HumidityIcon } from '../../assets/utils/humidity.svg';
import { ReactComponent as ClearDayIcon } from '../../assets/utils/weather/Clear Day Icon (1).svg';
import { ReactComponent as CloudyIcon } from '../../assets/utils/weather/Cloud Icon.svg';
import { ReactComponent as FoggyIcon } from '../../assets/utils/weather/Foggy Icon.svg';
import { ReactComponent as RainyIcon } from '../../assets/utils/weather/Rainy Icon.svg';
import { ReactComponent as PartlyCloudyDayIcon } from '../../assets/utils/weather/Partly Cloudy Day Icon.svg';
import { ReactComponent as PartlyCloudyNightIcon } from '../../assets/utils/weather/Partly Cloudy Night Icon.svg';
import { ReactComponent as ThunderstormIcon } from '../../assets/utils/weather/Thunderstorm Icon.svg';
import { ReactComponent as SnowyIcon } from '../../assets/utils/weather/Snowy Weather Icon.svg';
import { ReactComponent as HailIcon } from '../../assets/utils/weather/Hail Icon.svg';
import { ReactComponent as MoonStarsIcon } from '../../assets/utils/weather/Moon Stars Icon (1).svg';

const ModalContent = styled.div`
  padding: 35px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const SensorRow = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
`;

const SensorCard = styled.div`
  background: rgba(173, 181, 189, 0.1);
  border-radius: 12px;
  padding: 15px;
  min-width: 100px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const SensorIcon = styled.div`
  width: 24px;
  height: 24px;
  opacity: 0.8;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 24px;
    height: 24px;
    fill: #fff;
    margin-bottom: 4px;
  }
`;

const SensorValue = styled.div`
  font-size: 22px;
  font-weight: 400;
  color: #fff;
  line-height: 22px;
`;

const SensorLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #ADB5BD;
`;

const ThermostatContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  justify-content: center;
  margin-bottom: 40px;
`;



const ModeLabel = styled.div<{ $color: string }>`
  color: ${props => props.$color};
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
`;

const TemperatureDisplay = styled.div`
  font-size: 56px;
  font-weight: 400;
  color: #fff;
  line-height: 1;
  
  span {
    font-size: 20px;
    font-weight: 400;
    vertical-align: top;
    position: relative;
    top: 0px;
  }
`;

const ControlButtons = styled.div`
  display: flex;
  gap: 24px;
  margin-top: -80px;
`;

const ControlButton = styled.button`
  background: none;
  border: 1px solid #555;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  color: #fff;
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #777;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
`;

interface ThermostatModalProps {
  entityId: string;
  type?: 'hvac' | 'radiant';
}

const modeConfig = {
  heat: { label: 'Heating', color: '#FF3B30', arcColor: '#99342E', icon: <HeatIcon /> },
  cool: { label: 'Cooling', color: '#2196f3', arcColor: '#133C55', icon: <CoolIcon /> },
  heat_cool: { label: 'Heat/Cool', color: '#8e44ad', arcColor: '#8e44ad', icon: <HeatCoolIcon /> },
  eco: { label: 'Eco', color: '#43a047', arcColor: '#43a047', icon: <EcoIcon /> },
  off: { label: 'Idle', color: '#444', arcColor: '#444', icon: <EcoIcon /> },
};

const minTemp = 50;
const maxTemp = 90;
const arcStart = 0; // degrees - start at right (3 o'clock)
const arcEnd = 273; // degrees - extend past top to add more length on right side

// Weather condition mapping
function getWeatherIcon(condition: string): React.ReactNode {
  const normalizedCondition = condition?.toLowerCase() || '';
  
  switch (normalizedCondition) {
    case 'clear-day':
    case 'sunny':
    case 'clear':
      return <ClearDayIcon />;
    case 'clear-night':
      return <MoonStarsIcon />;
    case 'partly-cloudy-day':
    case 'partlycloudy':
      return <PartlyCloudyDayIcon />;
    case 'partly-cloudy-night':
      return <PartlyCloudyNightIcon />;
    case 'cloudy':
    case 'overcast':
      return <CloudyIcon />;
    case 'fog':
    case 'foggy':
      return <FoggyIcon />;
    case 'rain':
    case 'rainy':
    case 'drizzle':
      return <RainyIcon />;
    case 'thunderstorm':
    case 'lightning':
      return <ThunderstormIcon />;
    case 'snow':
    case 'snowy':
      return <SnowyIcon />;
    case 'hail':
      return <HailIcon />;
    default:
      return <ClearDayIcon />; // Default fallback
  }
}

function getArcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  // Convert to match Home Assistant's coordinate system
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const arcSweep = endAngle - startAngle;
  const largeArcFlag = arcSweep > 180 ? '1' : '0';
  
  return [
    'M', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 1, end.x, end.y
  ].join(' ');
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  // Home Assistant uses 0° = right, 90° = bottom, 180° = left, 270° = top
  const a = angle * Math.PI / 180.0;
  return {
    x: cx + r * Math.cos(a),
    y: cy + r * Math.sin(a)
  };
}

export default function ThermostatModal({ entityId, type = 'hvac' }: ThermostatModalProps) {
  const { closeModal } = useModal();
  const entity = useEntityState(entityId);
  const [dragTemp, setDragTemp] = useState<number | null>(null);
  
  // Determine appropriate sensors based on thermostat entity ID
  const getSensorEntities = (thermostatEntityId: string) => {
    if (thermostatEntityId.includes('main_bedroom')) {
      return {
        tempSensor: 'sensor.main_bedroom_awair_temperature',
        humiditySensor: 'sensor.main_bedroom_awair_humidity'
      };
    } else if (thermostatEntityId.includes('jr_suite')) {
      return {
        tempSensor: 'sensor.jr_suite_awair_temperature',
        humiditySensor: 'sensor.jr_suite_awair_humidity'
      };
    } else if (thermostatEntityId.includes('office')) {
      return {
        tempSensor: 'sensor.office_awair_temperature',
        humiditySensor: 'sensor.office_awair_humidity'
      };
    } else {
      // Default to kitchen/family room sensors
      return {
        tempSensor: 'sensor.kitchen_awair_temperature',
        humiditySensor: 'sensor.kitchen_awair_humidity'
      };
    }
  };

  const { tempSensor, humiditySensor } = getSensorEntities(entityId);

  // Sensor entities for contextual information
  const outsideTempEntity = useEntityState('sensor.tempest_temperature');
  const insideTempEntity = useEntityState(tempSensor);
  const humidityEntity = useEntityState(humiditySensor);
  const weatherEntity = useEntityState('weather.kpwk');
  
  // Get thermostat state from entity - fix mode detection
  const rawMode = entity?.state || entity?.attributes?.hvac_mode || 'off';
  const preset = entity?.attributes?.preset_mode;
  const setTemp = entity?.attributes?.temperature || 70;
  const heatSetTemp = entity?.attributes?.target_temp_low || entity?.attributes?.temperature || 70;
  const coolSetTemp = entity?.attributes?.target_temp_high || entity?.attributes?.temperature || 75;
  const currentTemp = entity?.attributes?.current_temperature || 70;
  const hvacAction = entity?.attributes?.hvac_action;
  
  // Determine actual mode - if preset is eco, use eco mode
  const mode = preset === 'eco' ? 'eco' : rawMode;
  
  // For heat/cool mode, we need to track which handle is being dragged
  const [dragHeatTemp, setDragHeatTemp] = useState<number | null>(null);
  const [dragCoolTemp, setDragCoolTemp] = useState<number | null>(null);
  
  const displayHeatTemp = dragHeatTemp !== null ? dragHeatTemp : heatSetTemp;
  const displayCoolTemp = dragCoolTemp !== null ? dragCoolTemp : coolSetTemp;
  const displayTemp = mode === 'heat_cool' ? displayCoolTemp : (dragTemp !== null ? dragTemp : setTemp);
  
  const modeInfo = modeConfig[mode as keyof typeof modeConfig] || modeConfig['off'];
  
  // Determine display label based on mode and hvac_action
  const getDisplayLabel = () => {
    if (preset === 'eco') return 'Eco';
    if (mode === 'off') return 'Idle';
    if (mode === 'heat_cool') return 'Heat/Cool';
    
    // For heat/cool modes, check if actively heating/cooling
    if (hvacAction === 'heating') return 'Heating';
    if (hvacAction === 'cooling') return 'Cooling';
    
    // If not actively heating/cooling, show as idle
    return 'Idle';
  };

  // Arc paths
  const size = 300; // Increased from 240 (25% larger)
  const center = size / 2;
  const radius = 125; // Increased from 100 (25% larger)

  // Calculate arc for set temp(s)
  const tempPercent = (displayTemp - minTemp) / (maxTemp - minTemp);
  const tempAngle = arcStart + (arcEnd - arcStart) * tempPercent;
  
  const heatTempPercent = (displayHeatTemp - minTemp) / (maxTemp - minTemp);
  const heatTempAngle = arcStart + (arcEnd - arcStart) * heatTempPercent;
  
  const coolTempPercent = (displayCoolTemp - minTemp) / (maxTemp - minTemp);
  const coolTempAngle = arcStart + (arcEnd - arcStart) * coolTempPercent;

  // Calculate foreground arc based on mode direction
  let fgArc;
  let heatArc = '';
  let coolArc = '';
  
  if (mode === 'heat_cool') {
    // Heat/Cool: show both red arc from left to heat setpoint and blue arc from right to cool setpoint
    heatArc = getArcPath(0, 0, radius, arcStart, heatTempAngle);
    coolArc = getArcPath(0, 0, radius, coolTempAngle, arcEnd);
    fgArc = ''; // We'll render separate arcs
  } else if (mode === 'cool') {
    // Cooling: show arc from right end (arcEnd) towards set point (tempAngle)
    fgArc = getArcPath(0, 0, radius, tempAngle, arcEnd);
  } else if (mode === 'heat') {
    // Heating: show arc from left end (arcStart) towards set point (tempAngle)
    fgArc = getArcPath(0, 0, radius, arcStart, tempAngle);
  } else {
    // For eco, off - show from start to set point
    fgArc = getArcPath(0, 0, radius, arcStart, tempAngle);
  }

  // Handle drag for heat setpoint
  const handleHeatDrag = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = (e.target as SVGElement).getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
    if (angle < 0) angle += 360;
    // Clamp to arc and ensure heat setpoint doesn't exceed cool setpoint
    if (angle < arcStart) angle = arcStart;
    if (angle > arcEnd) angle = arcEnd;
    const percent = (angle - arcStart) / (arcEnd - arcStart);
    let temp = Math.round(minTemp + percent * (maxTemp - minTemp));
    temp = Math.max(minTemp, Math.min(maxTemp, Math.min(temp, displayCoolTemp - 1))); // Keep 1 degree below cool
    setDragHeatTemp(temp);
  };

  const handleHeatDragEnd = () => {
    if (dragHeatTemp !== null) {
      handleHeatTempChange(dragHeatTemp);
      setDragHeatTemp(null);
    }
  };

  // Handle drag for cool setpoint
  const handleCoolDrag = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = (e.target as SVGElement).getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
    if (angle < 0) angle += 360;
    // Clamp to arc and ensure cool setpoint doesn't go below heat setpoint
    if (angle < arcStart) angle = arcStart;
    if (angle > arcEnd) angle = arcEnd;
    const percent = (angle - arcStart) / (arcEnd - arcStart);
    let temp = Math.round(minTemp + percent * (maxTemp - minTemp));
    temp = Math.max(minTemp, Math.min(maxTemp, Math.max(temp, displayHeatTemp + 1))); // Keep 1 degree above heat
    setDragCoolTemp(temp);
  };

  const handleCoolDragEnd = () => {
    if (dragCoolTemp !== null) {
      handleCoolTempChange(dragCoolTemp);
      setDragCoolTemp(null);
    }
  };

  // Handle drag
  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = (e.target as SVGElement).getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
    if (angle < 0) angle += 360;
    // Clamp to arc
    if (angle < arcStart) angle = arcStart;
    if (angle > arcEnd) angle = arcEnd;
    const percent = (angle - arcStart) / (arcEnd - arcStart);
    let temp = Math.round(minTemp + percent * (maxTemp - minTemp));
    temp = Math.max(minTemp, Math.min(maxTemp, temp));
    setDragTemp(temp);
  };

  const handleDragEnd = () => {
    if (dragTemp !== null) {
      handleTempChange(dragTemp);
      setDragTemp(null);
    }
  };

  const handleTempChange = async (newTemp: number) => {
    console.log(`Setting temperature to ${newTemp}° for ${entityId}`);
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

  const handleHeatTempChange = async (newTemp: number) => {
    console.log(`Setting heat temperature to ${newTemp}° for ${entityId}`);
    try {
      await hassApiFetch('/api/services/climate/set_temperature', {
        method: 'POST',
        body: JSON.stringify({ entity_id: entityId, target_temp_low: newTemp }),
      });
      console.log(`Successfully set heat temperature to ${newTemp}° for ${entityId}`);
    } catch (error) {
      console.error(`Failed to set heat temperature to ${newTemp}° for ${entityId}:`, error);
    }
  };

  const handleCoolTempChange = async (newTemp: number) => {
    console.log(`Setting cool temperature to ${newTemp}° for ${entityId}`);
    try {
      await hassApiFetch('/api/services/climate/set_temperature', {
        method: 'POST',
        body: JSON.stringify({ entity_id: entityId, target_temp_high: newTemp }),
      });
      console.log(`Successfully set cool temperature to ${newTemp}° for ${entityId}`);
    } catch (error) {
      console.error(`Failed to set cool temperature to ${newTemp}° for ${entityId}:`, error);
    }
  };

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

  const bgArc = getArcPath(0, 0, radius, arcStart, arcEnd);
  // fgArc is calculated above based on mode

  // Handle positions (relative to origin since we're using transform)
  const handlePos = polarToCartesian(0, 0, radius, tempAngle);
  const heatHandlePos = polarToCartesian(0, 0, radius, heatTempAngle);
  const coolHandlePos = polarToCartesian(0, 0, radius, coolTempAngle);
  const currentPos = polarToCartesian(0, 0, radius, arcStart + (arcEnd - arcStart) * ((currentTemp - minTemp) / (maxTemp - minTemp)));

  // Mode action items - different for radiant vs HVAC
  const modeActions: ActionItem[] = type === 'radiant' ? [
    { id: 'heat', label: 'Heat', icon: <HeatIcon /> },
    { id: 'off', label: 'Off', icon: <PowerIcon /> },
  ] : [
    { id: 'heat', label: 'Heat', icon: <HeatIcon /> },
    { id: 'heat_cool', label: 'Heat/Cool', icon: <HeatCoolIcon /> },
    { id: 'cool', label: 'Cool', icon: <CoolIcon /> },
    { id: 'eco', label: 'Eco', icon: <EcoIcon /> },
  ];

  const handleModeSelect = (modeId: string) => {
    handleModeChange(modeId);
  };

  return (
    <ModalContent>
      <ModalHeader 
        title="Thermostat"
        onClose={closeModal}
        centered={true}
        marginBottom="20px"
      />

      <SensorRow>
        <SensorCard>
          <SensorIcon>
            {getWeatherIcon(weatherEntity?.state || '')}
          </SensorIcon>
          <SensorValue>
            {outsideTempEntity?.state ? `${Math.round(parseFloat(outsideTempEntity.state))}°` : '--'}
          </SensorValue>
          <SensorLabel>Outside</SensorLabel>
        </SensorCard>
        <SensorCard>
          <SensorIcon>
            <TemperatureIcon />
          </SensorIcon>
          <SensorValue>
            {insideTempEntity?.state ? `${Math.round(parseFloat(insideTempEntity.state))}°` : '--'}
          </SensorValue>
          <SensorLabel>Inside</SensorLabel>
        </SensorCard>
        <SensorCard>
          <SensorIcon>
            <HumidityIcon />
          </SensorIcon>
          <SensorValue>
            {humidityEntity?.state ? `${Math.round(parseFloat(humidityEntity.state))}%` : '--'}
          </SensorValue>
          <SensorLabel>Humidity</SensorLabel>
        </SensorCard>
      </SensorRow>

      <ThermostatContainer>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <svg width={size} height={size} style={{ display: 'block', marginBottom: 20 }}>
            <g transform={`translate(${center} ${center}) rotate(135)`}>
              {/* Background arc */}
              <path d={bgArc} stroke="#343A40" strokeWidth={18} fill="none" />
              
              {mode === 'heat_cool' ? (
                <>
                  {/* Heat arc (red) */}
                  <path d={heatArc} stroke="#99342E" strokeWidth={18} fill="none" />
                  {/* Cool arc (blue) */}
                  <path d={coolArc} stroke="#133C55" strokeWidth={18} fill="none" />
                                      {/* Heat handle */}
                    <circle
                      cx={heatHandlePos.x}
                      cy={heatHandlePos.y}
                      r={10}
                      fill="#fff"
                      stroke="#FF3B30"
                      strokeWidth={3}
                    style={{ cursor: 'pointer' }}
                    onMouseDown={e => { e.preventDefault(); const move = (ev: MouseEvent) => { handleHeatDrag(ev as any); }; const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); handleHeatDragEnd(); }; window.addEventListener('mousemove', move); window.addEventListener('mouseup', up); }}
                    onTouchStart={e => { e.preventDefault(); const move = (ev: TouchEvent) => { handleHeatDrag(ev as any); }; const up = () => { window.removeEventListener('touchmove', move); window.removeEventListener('touchend', up); handleHeatDragEnd(); }; window.addEventListener('touchmove', move); window.addEventListener('touchend', up); }}
                  />
                  {/* Heat inner circle */}
                  <circle cx={heatHandlePos.x} cy={heatHandlePos.y} r={7} fill="#fff" />
                  {/* Cool handle */}
                  <circle
                    cx={coolHandlePos.x}
                    cy={coolHandlePos.y}
                    r={14}
                    fill="#ffffff"
                    stroke="#2196f3"
                    strokeWidth={3}
                    style={{ cursor: 'pointer' }}
                    onMouseDown={e => { e.preventDefault(); const move = (ev: MouseEvent) => { handleCoolDrag(ev as any); }; const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); handleCoolDragEnd(); }; window.addEventListener('mousemove', move); window.addEventListener('mouseup', up); }}
                    onTouchStart={e => { e.preventDefault(); const move = (ev: TouchEvent) => { handleCoolDrag(ev as any); }; const up = () => { window.removeEventListener('touchmove', move); window.removeEventListener('touchend', up); handleCoolDragEnd(); }; window.addEventListener('touchmove', move); window.addEventListener('touchend', up); }}
                  />
                  {/* Cool inner circle */}
                  <circle cx={coolHandlePos.x} cy={coolHandlePos.y} r={7} fill="#fff" />
                </>
              ) : (
                <>
                  {/* Foreground arc */}
                  <path d={fgArc} stroke={modeInfo.arcColor} strokeWidth={18} fill="none" />
                  {/* Set temp handle */}
                  <circle
                    cx={handlePos.x}
                    cy={handlePos.y}
                    r={10}
                    fill="#fff"
                    stroke={modeInfo.color}
                    strokeWidth={3}
                    style={{ cursor: 'pointer' }}
                    onMouseDown={e => { e.preventDefault(); const move = (ev: MouseEvent) => { handleDrag(ev as any); }; const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); handleDragEnd(); }; window.addEventListener('mousemove', move); window.addEventListener('mouseup', up); }}
                    onTouchStart={e => { e.preventDefault(); const move = (ev: TouchEvent) => { handleDrag(ev as any); }; const up = () => { window.removeEventListener('touchmove', move); window.removeEventListener('touchend', up); handleDragEnd(); }; window.addEventListener('touchmove', move); window.addEventListener('touchend', up); }}
                  />
                  {/* Set temp inner circle */}
                  <circle cx={handlePos.x} cy={handlePos.y} r={7} fill="#fff" />
                </>
              )}
              
              {/* Current temp marker - prominent gray dot like Home Assistant */}
              <circle cx={currentPos.x} cy={currentPos.y} r={4} fill="#6C757D" />
            </g>
          </svg>
          
          {/* Center text overlay */}
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            marginTop: -10 // Adjust for visual centering
          }}>
            <ModeLabel $color={modeInfo.color}>{getDisplayLabel()}</ModeLabel>
            {mode === 'heat_cool' ? (
              <TemperatureDisplay>{displayHeatTemp}-{displayCoolTemp}<span>°</span></TemperatureDisplay>
            ) : (
              <TemperatureDisplay>{displayTemp}<span>°</span></TemperatureDisplay>
            )}
          </div>
        </div>

        <ControlButtons>
          <ControlButton onClick={() => handleTempChange(Math.max(minTemp, setTemp - 1))}>
            <ThermostatDecreaseIcon />
          </ControlButton>
          <ControlButton onClick={() => handleTempChange(Math.min(maxTemp, setTemp + 1))}>
            <ThermostatIncreaseIcon />
          </ControlButton>
        </ControlButtons>
      </ThermostatContainer>

      <Section>
        <ActionGrid 
          actions={modeActions} 
          onActionSelect={handleModeSelect}
          activeAction={mode}
          variant="simple"
        />
      </Section>
    </ModalContent>
  );
} 