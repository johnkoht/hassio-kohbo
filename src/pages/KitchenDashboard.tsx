import React from 'react';
import Room from '../components/Room/Room';
import RoomState from '../components/RoomState/RoomState';
import OccupancyState from '../components/OccupancyState/OccupancyState';
import DashboardHeader from '../components/DashboardHeader/DashboardHeader';
import RoomInfo from '../components/RoomInfo/RoomInfo';
import DeviceRow from '../components/DeviceRow/DeviceRow';
import LightCard, { LightScene } from '../components/DeviceCard/LightCard';
import FanCard from '../components/DeviceCard/FanCard';
import DoorCard from '../components/DeviceCard/DoorCard';
import WindowCard from '../components/DeviceCard/WindowCard';
import DeviceCard from '../components/DeviceCard/DeviceCard';
import SettingsButton from '../components/SettingsButton/SettingsButton';
import { SettingsGroup } from '../components/Modal/SettingsModal';
import { useEntityState } from '../contexts/HassContext';
import { ReactComponent as BrightIcon } from '../assets/utils/lights_bright.svg';
import { ReactComponent as DimmedIcon } from '../assets/utils/lights_dimmed.svg';
import { ReactComponent as NightlightIcon } from '../assets/utils/lights_nightlight.svg';
import { ReactComponent as LeakIcon } from '../assets/device_icons/leak_dry.svg';

// Using office background as placeholder - TODO: Add kitchen background image
import kitchenBg from '../assets/room_bgs/office-bg.jpg';
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

export default function KitchenDashboard() {
  const roomState = useEntityState('input_select.kitchen');
  const occupancy = useEntityState('input_boolean.kitchen_occupied');
  const leakSensor = useEntityState('binary_sensor.kitchen_sink_leak_sensor');

  // Define room-specific settings configuration
  const settingsGroups: SettingsGroup[] = [
    {
      id: 'settings',
      label: 'General Settings',
      items: [
        {
          id: 'speech_notifications',
          label: 'Speech Notifications',
          description: 'Enable voice announcements for kitchen events',
          entityId: 'input_boolean.kitchen_speech_notifications',
          entityType: 'input_boolean'
        },
        {
          id: 'light_automations',
          label: 'Lighting Automations',
          description: 'Enable lighting automations within the Kitchen',
          entityId: 'input_boolean.kitchen_lighting_automations',
          entityType: 'input_boolean'
        },
        {
          id: 'adaptive_lighting',
          label: 'Adaptive Lighting',
          description: 'Automatically adjust light color temperature based on time of day',
          entityId: 'switch.adaptive_lighting_kitchen',
          entityType: 'switch'
        },
        {
          id: 'adaptive_lighting_sleep_mode',
          label: 'Adaptive Lighting Sleep Mode',
          description: 'Automatically adjust light color temperature based on time of day for sleep mode',
          entityId: 'switch.adaptive_lighting_sleep_mode_kitchen',
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
          description: 'Enable air quality automations within the Kitchen',
          entityId: 'automation.kitchen_air_quality_sensor_detections',
          entityType: 'automation'
        },
        {
          id: 'vacuum_clean_kitchen_and_family_room_at_night',
          label: 'Clean Kitchen and Family Room at Night',
          description: 'Clean the kitchen and family room at night',
          entityId: 'automation.vacuum_clean_kitchen_and_family_room_at_night',
          entityType: 'automation'
        },
        {
          id: 'vacuum_clean_kitchen_when_unoccupied',
          label: 'Clean Kitchen when House is Unoccupied',
          description: 'Clean the kitchen when the house is unoccupied',
          entityId: 'automation.vacuum_clean_kitchen_when_unoccupied',
          entityType: 'automation'
        },
        {
          id: 'vacuum_clean_kitchen_during_nap',
          label: 'Clean Kitchen during Nap',
          description: 'Clean the kitchen during nap time',
          entityId: 'automation.vacuum_clean_kitchen_during_nap',
          entityType: 'automation'
        }
      ]
    }
  ];

  // Define all lights in this room (group first, then individual lights)
  const roomLights = [
    { entityId: 'light.kitchen_lights', name: 'All', displayName: 'All Lights' },
    { entityId: 'light.kitchen_main_light_switch', name: 'Main', displayName: 'Main Lights' },
    { entityId: 'light.kitchen_table_light_switch', name: 'Table', displayName: 'Table Lights' },
  ];

  // Define scenes for kitchen lights (brightness-based)
  const kitchenScenes: LightScene[] = [
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
            roomName="Kitchen"
            tempSensor="sensor.kitchen_awair_temperature"
            aqiSensor="sensor.kitchen_awair_score"
            humiditySensor="sensor.kitchen_awair_humidity"
            co2Sensor="sensor.kitchen_awair_carbon_dioxide"
            tvocSensor="sensor.kitchen_awair_vocs"
            pm25Sensor="sensor.kitchen_awair_pm2_5"
          />
        </div>
        <div style={{ width: '100%', marginTop: 25 }}>
          <DeviceRow>
            <LightCard
              entityId="light.kitchen_lights"
              name="Kitchen Lights"
              lightType="ceiling"
              roomName="Kitchen"
              roomLights={roomLights}
              scenes={kitchenScenes}
            />
            <FanCard 
              entityId="fan.kitchen_air_purifier" 
              name="Air Purifier"
            />
            <DoorCard 
              entityId="binary_sensor.kitchen_door" 
              name="Door"
            />
            <WindowCard 
              entityId="binary_sensor.kitchen_window_sensor"
              name="Window South"
            />
            <WindowCard 
              entityId="binary_sensor.kitchen_window_west_middle_sensor"
              name="Window West"
            />
            <DeviceCard
              icon={<LeakIcon />}
              name="Sink Leak Sensor"
              state={leakSensor?.state === 'on' ? 'Leak Detected' : 'Dry'}
              isActive={leakSensor?.state === 'on'}
            />
          </DeviceRow>
        </div>
        
        <SettingsButton roomName="Kitchen" settingsGroups={settingsGroups} />
      </div>
    </Room>
  );
} 