import React from 'react';
import Room from '../components/Room/Room';
import RoomContainer from '../components/Room/RoomContainer';
import RoomState from '../components/RoomState/RoomState';
import OccupancyState from '../components/OccupancyState/OccupancyState';
import DashboardHeader from '../components/DashboardHeader/DashboardHeader';
import RoomInfo from '../components/RoomInfo/RoomInfo';
import DeviceRow from '../components/DeviceRow/DeviceRow';
import LightCard, { LightScene } from '../components/DeviceCard/LightCard';
import WindowCard from '../components/DeviceCard/WindowCard';
import OutletCard from '../components/DeviceCard/OutletCard';
import SettingsButton from '../components/SettingsButton/SettingsButton';
import { SettingsGroup } from '../components/Modal/SettingsModal';
import { useEntityState } from '../contexts/HassContext';
import { ReactComponent as BrightIcon } from '../assets/utils/lights_bright.svg';
import { ReactComponent as DimmedIcon } from '../assets/utils/lights_dimmed.svg';
import { ReactComponent as NightlightIcon } from '../assets/utils/lights_nightlight.svg';

import playroomBg from '../assets/room_bgs/playroom.jpg';
import autoIcon from '../assets/room_mode_icons/auto.svg';
import bedtimeIcon from '../assets/room_mode_icons/bedtime.svg';
import dndIcon from '../assets/room_mode_icons/dnd.svg';
import MediaPlayerCard from '../components/DeviceCard/MediaPlayerCard';

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

export default function PlayroomDashboard() {
  const roomState = useEntityState('input_select.playroom');
  const occupancy = useEntityState('input_boolean.playroom_occupied');

  // Define room-specific settings configuration
  const settingsGroups: SettingsGroup[] = [
    {
      id: 'settings',
      label: 'General Settings',
      items: [
        // {
        //   id: 'speech_notifications',
        //   label: 'Speech Notifications',
        //   description: 'Enable voice announcements for playroom events',
        //   entityId: 'input_boolean.playroom_speech_notifications',
        //   entityType: 'input_boolean'
        // },
        {
          id: 'light_automations',
          label: 'Lighting Automations',
          description: 'Enable lighting automations within the Playroom',
          entityId: 'input_boolean.playroom_lighting_automations',
          entityType: 'input_boolean'
        },
        // {
        //   id: 'adaptive_lighting',
        //   label: 'Adaptive Lighting',
        //   description: 'Automatically adjust light color temperature based on time of day',
        //   entityId: 'switch.adaptive_lighting_playroom',
        //   entityType: 'switch'
        // },
        // {
        //   id: 'adaptive_lighting_sleep_mode',
        //   label: 'Adaptive Lighting Sleep Mode',
        //   description: 'Automatically adjust light color temperature based on time of day for sleep mode',
        //   entityId: 'switch.adaptive_lighting_sleep_mode_playroom',
        //   entityType: 'switch'
        // }
      ]
    },
    {
      id: 'automations',
      label: 'Automations',
      items: [
        // {
        //   id: 'playroom_cleanup_reminders',
        //   label: 'Cleanup Reminders',
        //   description: 'Enable cleanup reminders for the playroom',
        //   entityId: 'automation.playroom_cleanup_reminders',
        //   entityType: 'automation'
        // },
        // {
        //   id: 'playroom_quiet_time',
        //   label: 'Quiet Time Automation',
        //   description: 'Enable quiet time automations in the playroom',
        //   entityId: 'automation.playroom_quiet_time',
        //   entityType: 'automation'
        // }
      ]
    }
  ];

  // Define all lights in this room
  const roomLights = [
    { entityId: 'light.playroom_lights', name: 'All', displayName: 'All Lights' },
  ];

  // Define scenes for playroom lights
  const playroomScenes: LightScene[] = [
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
    <Room bg={playroomBg}>
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
            roomName="Playroom"
            tempSensor="sensor.playroom_temperature"
            humiditySensor="sensor.playroom_humidity"
          />
        </div>
        
        <DeviceRow>
          <MediaPlayerCard 
            entityId="media_player.sonos_playroom"
            name="Playroom Speaker"
          />
          <LightCard
            entityId="light.playroom_lights"
            name="Playroom Lights"
            lightType="ceiling"
            roomName="Playroom"
            roomLights={roomLights}
            scenes={playroomScenes}
          />
          <OutletCard
            entityId="switch.christmas_playroom_lights"
            name="Christmas Lights"
          />
          <WindowCard 
            entityId="binary_sensor.playroom_window_sensor"
            name="Window"
          />
          <WindowCard 
            entityId="binary_sensor.playroom_window_west_left_opening"
            name="Window West"
          />
        </DeviceRow>
        
        <SettingsButton roomName="Playroom" settingsGroups={settingsGroups} />
      </RoomContainer>
    </Room>
  );
} 