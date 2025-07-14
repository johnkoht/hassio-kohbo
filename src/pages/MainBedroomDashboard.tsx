import React from 'react';
import Room from '../components/Room/Room';
import RoomState from '../components/RoomState/RoomState';
import OccupancyState from '../components/OccupancyState/OccupancyState';
import DashboardHeader from '../components/DashboardHeader/DashboardHeader';
import RoomInfo from '../components/RoomInfo/RoomInfo';
import DeviceRow from '../components/DeviceRow/DeviceRow';
import LightCard, { LightScene } from '../components/DeviceCard/LightCard';
import DoorCard from '../components/DeviceCard/DoorCard';
import FanCard from '../components/DeviceCard/FanCard';
import SettingsButton from '../components/SettingsButton/SettingsButton';
import { SettingsGroup } from '../components/Modal/SettingsModal';
import { useEntityState } from '../contexts/HassContext';
import { ReactComponent as BrightIcon } from '../assets/utils/lights_bright.svg';
import { ReactComponent as DimmedIcon } from '../assets/utils/lights_dimmed.svg';
import { ReactComponent as NightlightIcon } from '../assets/utils/lights_nightlight.svg';

import kitchenBg from '../assets/room_bgs/main_bedroom.jpg';
import autoIcon from '../assets/room_mode_icons/auto.svg';
import bedtimeIcon from '../assets/room_mode_icons/bedtime.svg';
import dndIcon from '../assets/room_mode_icons/dnd.svg';
import ThermostatCard from '../components/DeviceCard/ThermostatCard';

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

export default function MainBedroomDashboard() {
  const roomState = useEntityState('input_select.main_bedroom');
  const occupancy = useEntityState('input_boolean.main_bedroom_occupied');

  // Define room-specific settings configuration
  const settingsGroups: SettingsGroup[] = [
    {
      id: 'settings',
      label: 'General Settings',
      items: [
        {
          id: 'speech_notifications',
          label: 'Speech Notifications',
          description: 'Enable voice announcements for main bedroom events',
          entityId: 'input_boolean.main_bedroom_speech_notifications',
          entityType: 'input_boolean'
        },
        {
          id: 'light_automations',
          label: 'Lighting Automations',
          description: 'Enable lighting automations within the Main Bedroom',
          entityId: 'input_boolean.main_bedroom_lighting_automations',
          entityType: 'input_boolean'
        },
        {
          id: 'adaptive_lighting',
          label: 'Adaptive Lighting',
          description: 'Automatically adjust light color temperature based on time of day',
          entityId: 'switch.adaptive_lighting_main_bedroom',
          entityType: 'switch'
        },
        {
          id: 'adaptive_lighting_sleep_mode',
          label: 'Adaptive Lighting Sleep Mode',
          description: 'Automatically adjust light color temperature based on time of day for sleep mode',
          entityId: 'switch.adaptive_lighting_sleep_mode_main_bedroom',
          entityType: 'switch'
        }
      ]
    },
    {
      id: 'automations',
      label: 'Automations',
      items: [
        {
          id: 'main_bedroom_air_quality_detections',
          label: 'Air Quality Automations',
          description: 'Enable air quality automations within the Main Bedroom',
          entityId: 'automation.main_bedroom_air_quality_sensor_detections',
          entityType: 'automation'
        },
        {
          id: 'main_bedroom_night_light_for_john',
          label: 'Night Light for John',
          description: 'Enable night light automation for John',
          entityId: 'automation.main_bedroom_night_light_for_john',
          entityType: 'automation'
        }
      ]
    }
  ];

  // Define all lights in this room
  const roomLights = [
    { entityId: 'light.main_bedroom_main_lights', name: 'All', displayName: 'All Lights' },
    { entityId: 'light.hue_ambiance_lamp_1', name: 'John\'s Lamp', displayName: 'John\'s Bedside Lamp' },
    { entityId: 'light.hue_ambiance_lamp_1_2', name: 'Cristina\'s Lamp', displayName: 'Cristina\'s Bedside Lamp' },
  ];

  // Define scenes for main bedroom lights
  const mainBedroomScenes: LightScene[] = [
    {
      id: 'bright',
      label: 'Bright White',
      icon: <BrightIcon />,
      service: 'light/turn_on',
      serviceData: { brightness_pct: 100, color_temp: 370 }
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
    }
  ];

  return (
    <Room bg={kitchenBg}>
      <div style={{ padding: '50px 60px 40px 60px', height: '100%' }}>
        <DashboardHeader>
          <RoomState
            mode={getMode(roomState?.state)}
            icon={stateIcons[getMode(roomState?.state)] || autoIcon}
          />
          <OccupancyState state={occupancy?.state === 'on' ? 'Occupied' : 'Empty'} />
        </DashboardHeader>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <RoomInfo
            roomName="Main Bedroom"
            tempSensor="sensor.main_bedroom_awair_temperature"
            aqiSensor="sensor.main_bedroom_awair_score"
            humiditySensor="sensor.main_bedroom_awair_humidity"
            co2Sensor="sensor.main_bedroom_awair_carbon_dioxide"
            tvocSensor="sensor.main_bedroom_awair_vocs"
            pm25Sensor="sensor.main_bedroom_awair_pm2_5"
          />
        </div>
        <div style={{ width: '100%', marginTop: 25 }}>
          <DeviceRow>
            <LightCard
              entityId="light.main_bedroom_main_lights"
              name="Main Bedroom Lights"
              lightType="ceiling"
              roomName="Main Bedroom"
              roomLights={roomLights}
              scenes={mainBedroomScenes}
            />
            <ThermostatCard
              entityId="climate.main_bedroom"
              name="Radiant Heat"
              type="radiant"
            />
            <LightCard
              entityId="light.hue_ambiance_lamp_1"
              name="John's Bedside Lamp"
              lightType="lamp"
              scenes={mainBedroomScenes}
            />
            <LightCard
              entityId="light.hue_ambiance_lamp_1_2"
              name="Cristina's Bedside Lamp"
              lightType="lamp"
              scenes={mainBedroomScenes}
            />
            <FanCard 
              entityId="fan.main_bedroom_air_purifier" 
              name="Air Purifier"
            />
            <DoorCard 
              entityId="binary_sensor.main_bedroom_door_sensor_status" 
              name="Door"
            />
          </DeviceRow>
        </div>
        
        <SettingsButton roomName="Main Bedroom" settingsGroups={settingsGroups} />
      </div>
    </Room>
  );
} 