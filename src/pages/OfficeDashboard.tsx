import React from 'react';
import Room from '../components/Room/Room';
import RoomState from '../components/RoomState/RoomState';
import OccupancyState from '../components/OccupancyState/OccupancyState';
import DashboardHeader from '../components/DashboardHeader/DashboardHeader';
import RoomInfo from '../components/RoomInfo/RoomInfo';
import DeviceRow from '../components/DeviceRow/DeviceRow';
import LightCard, { LightScene } from '../components/DeviceCard/LightCard';
import FanCard from '../components/DeviceCard/FanCard';
import OutletCard from '../components/DeviceCard/OutletCard';
import DoorCard from '../components/DeviceCard/DoorCard';
import WindowCard from '../components/DeviceCard/WindowCard';
import MediaPlayerCard from '../components/DeviceCard/MediaPlayerCard';
import SettingsButton from '../components/SettingsButton/SettingsButton';
import { SettingsGroup } from '../components/Modal/SettingsModal';
import { useEntityState } from '../contexts/HassContext';
import { ReactComponent as BrightIcon } from '../assets/utils/lights_bright.svg';
import { ReactComponent as DimmedIcon } from '../assets/utils/lights_dimmed.svg';
import { ReactComponent as NightlightIcon } from '../assets/utils/lights_nightlight.svg';

import officeBg from '../assets/room_bgs/office-bg.jpg';
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

export default function OfficeDashboard() {
  const roomState = useEntityState('input_select.office');
  const occupancy = useEntityState('input_boolean.office_occupied');

  // Define room-specific settings configuration
  const settingsGroups: SettingsGroup[] = [
    {
      id: 'settings',
      label: 'General Settings',
      items: [
        {
          id: 'speech_notifications',
          label: 'Speech Notifications',
          description: 'Enable voice announcements for room events',
          entityId: 'input_boolean.office_speech_notifications',
          entityType: 'input_boolean'
        },
        {
          id: 'light_automations',
          label: 'Lighting Automations',
          description: 'Enable lighting automations within the Office',
          entityId: 'input_boolean.office_lighting_automations',
          entityType: 'input_boolean'
        },
        {
          id: 'adaptive_lighting',
          label: 'Adaptive Lighting',
          description: 'Automatically adjust light color temperature based on time of day',
          entityId: 'switch.adaptive_lighting_office',
          entityType: 'switch'
        },
        {
          id: 'adaptive_lighting_sleep_mode',
          label: 'Adaptive Lighting Sleep Mode',
          description: 'Automatically adjust light color temperature for night time',
          entityId: 'switch.adaptive_lighting_sleep_mode_office',
          entityType: 'switch'
        },
        {
          id: 'office_guest_mode',
          label: 'Office Guest Mode',
          description: 'Enable guest mode within the Office',
          entityId: 'input_boolean.office_guest_mode',
          entityType: 'input_boolean'
        }
      ]
    },
    {
      id: 'automations',
      label: 'Automations',
      items: [
        {
          id: 'office_air_quality_detections',
          label: 'Air Quality Automations',
          description: 'Enable air quality automations within the Office',
          entityId: 'automation.office_air_quality_detections',
          entityType: 'automation'
        },
        {
          id: 'office_music_resume',
          label: 'Music Automation',
          description: 'Enable music automations within the Office',
          entityId: 'automation.office_music_resume',
          entityType: 'automation'
        }
      ]
    }
  ];

  // Define all lights in this room
  const roomLights = [
    { entityId: 'light.office_lights', name: 'Ceiling Lights', displayName: 'All Lights' },
    { entityId: 'light.office_el_gato_light', name: 'Desk Lamp' },
    { entityId: 'light.office_shelves', name: 'Office Shelves' },
  ];

  // Define scenes for Lutron Caseta lights (brightness-based)
  const casetaScenes: LightScene[] = [
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
      id: 'focus',
      label: 'Focus Blue',
      icon: <div>🔵</div>,
      service: 'light/turn_on',
      serviceData: { brightness_pct: 80, rgb_color: [100, 150, 255] }
    },
    {
      id: 'relax',
      label: 'Warm Relax',
      icon: <div>🟠</div>,
      service: 'light/turn_on',
      serviceData: { brightness_pct: 60, rgb_color: [255, 150, 100] }
    },
    {
      id: 'nightlight',
      label: 'Nightlight',
      icon: <NightlightIcon />,
      service: 'light/turn_on',
      serviceData: { brightness_pct: 10, rgb_color: [255, 100, 50] }
    }
  ];

  return (
    <Room bg={officeBg}>
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
            roomName="Office"
            tempSensor="sensor.office_awair_temperature"
            aqiSensor="sensor.office_awair_score"
            humiditySensor="sensor.office_awair_humidity"
            co2Sensor="sensor.office_awair_carbon_dioxide"
            tvocSensor="sensor.office_awair_vocs"
            pm25Sensor="sensor.office_awair_pm2_5"
          />
        </div>
        <div style={{ width: '100%', marginTop: 25 }}>
          <DeviceRow>
            <MediaPlayerCard 
              entityId="media_player.sonos_office"
              name="Office Speaker"
            />
            <LightCard
              entityId="light.office_lights"
              name="Ceiling Lights"
              lightType="ceiling"
              roomName="Office"
              roomLights={roomLights}
              scenes={hueScenes}
            />
            <LightCard
              entityId="light.office_el_gato_light"
              name="Desk Lamp"
              lightType="lamp"
              scenes={casetaScenes} // Lutron Caseta - brightness-based scenes
            />
            <LightCard
              entityId="light.office_shelves"
              name="Shelf Lights"
              lightType="lightstrip"
              scenes={hueScenes} // Philips Hue - color-capable scenes
            />
            <FanCard 
              entityId="fan.office_air_purifier" 
              name="Air Purifier"
            />
            <OutletCard 
              entityId="switch.smart_plug_11_switch" 
              name="Desk Outlet"
            />
            <DoorCard 
              entityId="binary_sensor.office_doors" 
              name="Door"
            />
            <WindowCard 
              entityId="binary_sensor.office_window_sensor"
              name="Window"
            />
          </DeviceRow>
        </div>
        
        <SettingsButton roomName="Office" settingsGroups={settingsGroups} />
      </div>
    </Room>
  );
} 