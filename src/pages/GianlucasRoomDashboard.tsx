import React from 'react';
import Room from '../components/Room/Room';
import RoomContainer from '../components/Room/RoomContainer';
import RoomState from '../components/RoomState/RoomState';
import OccupancyState from '../components/OccupancyState/OccupancyState';
import DashboardHeader from '../components/DashboardHeader/DashboardHeader';
import RoomInfo from '../components/RoomInfo/RoomInfo';
import DeviceRow from '../components/DeviceRow/DeviceRow';
import LightCard, { LightScene } from '../components/DeviceCard/LightCard';
import FanCard from '../components/DeviceCard/FanCard';
import OutletCard from '../components/DeviceCard/OutletCard';
import DoorCard from '../components/DeviceCard/DoorCard';
import SettingsButton from '../components/SettingsButton/SettingsButton';
import { SettingsGroup } from '../components/Modal/SettingsModal';
import { useEntityState } from '../contexts/HassContext';
import { ReactComponent as BrightIcon } from '../assets/utils/lights_bright.svg';
import { ReactComponent as DimmedIcon } from '../assets/utils/lights_dimmed.svg';
import { ReactComponent as NightlightIcon } from '../assets/utils/lights_nightlight.svg';

import gianlucasRoomBg from '../assets/room_bgs/gianlucas_bedroom.jpg';
import autoIcon from '../assets/room_mode_icons/auto.svg';
import bedtimeIcon from '../assets/room_mode_icons/bedtime.svg';
import dndIcon from '../assets/room_mode_icons/dnd.svg';

const stateIcons: Record<string, string> = {
  Auto: autoIcon,
  Bedtime: bedtimeIcon,
  DnD: dndIcon,
};

const allowedModes = ['Auto', 'Bedtime', 'DnD'] as const;
type Mode = typeof allowedModes[number];
function getMode(state?: string): Mode {
  return allowedModes.includes(state as Mode) ? (state as Mode) : 'Auto';
}

export default function GianlucasRoomDashboard() {
  const roomState = useEntityState('input_select.gianlucas_bedroom');
  const occupancy = useEntityState('input_boolean.gianlucas_room_occupied');

  // Define room-specific settings configuration
  const settingsGroups: SettingsGroup[] = [
    {
      id: 'settings',
      label: 'General Settings',
      items: [
        {
          id: 'adaptive_lighting',
          label: 'Adaptive Lighting',
          description: 'Automatically adjust light color temperature based on time of day',
          entityId: 'switch.adaptive_lighting_gianluca_bedroom',
          entityType: 'switch'
        },
        {
          id: 'adaptive_lighting_sleep_mode',
          label: 'Adaptive Lighting Sleep Mode',
          description: 'Automatically adjust light color temperature for night time',
          entityId: 'switch.adaptive_lighting_sleep_mode_gianluca_bedroom',
          entityType: 'switch'
        }
      ]
    },
    {
      id: 'automations',
      label: 'Automations',
      items: [
        {
          id: 'air_quality_detections',
          label: 'Air Quality Automations',
          description: 'Enable air quality automations within Gianluca\'s Bedroom',
          entityId: 'automation.gianluca_s_bedroom_air_quality_sensor_detections',
          entityType: 'automation'
        },
        {
          id: 'heater_automation',
          label: 'Heater Automation',
          description: 'Automatically turn on heater when temperature drops below threshold',
          entityId: 'automation.gianluca_heater_on',
          entityType: 'automation'
        }
      ]
    }
  ];

  // Define scenes for Philips Hue lights (color-capable)
  const hueScenes: LightScene[] = [
    {
      id: 'bright',
      label: 'Bright White',
      icon: <BrightIcon />,
      service: 'light/turn_on',
      serviceData: { brightness_pct: 100, color_temp: 250 }
    },
    {
      id: 'dimmed',
      label: 'Dimmed',
      icon: <DimmedIcon />,
      service: 'light/turn_on',
      serviceData: { brightness_pct: 40, color_temp: 370 }
    },
    {
      id: 'nightlight',
      label: 'Nightlight',
      icon: <NightlightIcon />,
      service: 'light/turn_on',
      serviceData: { brightness_pct: 5, color_temp: 500 }
    },
    {
      id: 'cozy',
      label: 'Cozy Orange',
      icon: <div>🟠</div>,
      service: 'light/turn_on',
      serviceData: { brightness_pct: 60, rgb_color: [255, 150, 100] }
    },
    {
      id: 'cool',
      label: 'Cool Blue',
      icon: <div>🔵</div>,
      service: 'light/turn_on',
      serviceData: { brightness_pct: 70, rgb_color: [100, 150, 255] }
    }
  ];

  return (
    <Room bg={gianlucasRoomBg}>
      <RoomContainer>
        <DashboardHeader>
          <RoomState
            mode={getMode(roomState?.state)}
            icon={stateIcons[getMode(roomState?.state)] || autoIcon}
          />
          <OccupancyState state={occupancy?.state === 'on' ? 'Occupied' : 'Empty'} />
        </DashboardHeader>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <RoomInfo
            roomName="Gianluca's Room"
            tempSensor="sensor.gianluca_bedroom_awair_temperature"
            aqiSensor="sensor.gianluca_bedroom_awair_score"
            humiditySensor="sensor.gianluca_bedroom_awair_humidity"
            co2Sensor="sensor.gianluca_bedroom_awair_carbon_dioxide"
            tvocSensor="sensor.gianluca_bedroom_awair_vocs"
            pm25Sensor="sensor.gianluca_bedroom_awair_pm2_5"
          />
        </div>
      
        <DeviceRow>
          <LightCard
            entityId="light.gianluca_bedroom_lights"
            name="Ceiling Lights"
            lightType="ceiling"
            scenes={hueScenes}
          />
          <LightCard
            entityId="light.hue_color_candle_1"
            name="Lamp"
            lightType="lamp"
            scenes={hueScenes}
          />
          <FanCard 
            entityId="fan.gianlucas_bedroom_air_purifier" 
            name="Air Purifier"
          />
          <OutletCard 
            entityId="switch.hue_smart_plug_1" 
            name="Heater"
          />
          <DoorCard 
            entityId="binary_sensor.gianlucas_door_sensor_status" 
            name="Door"
          />
        </DeviceRow>
        
        <SettingsButton roomName="Gianluca's Room" settingsGroups={settingsGroups} />
      </RoomContainer>
    </Room>
  );
} 