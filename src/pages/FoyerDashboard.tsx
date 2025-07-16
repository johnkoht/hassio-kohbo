import React from 'react';
import Room from '../components/Room/Room';
import RoomContainer from '../components/Room/RoomContainer';
import RoomState from '../components/RoomState/RoomState';
import DashboardHeader from '../components/DashboardHeader/DashboardHeader';
import RoomInfo from '../components/RoomInfo/RoomInfo';
import DeviceRow from '../components/DeviceRow/DeviceRow';
import LightCard, { LightScene } from '../components/DeviceCard/LightCard';
import DoorCard from '../components/DeviceCard/DoorCard';
import LockCard from '../components/DeviceCard/LockCard';
import SettingsButton from '../components/SettingsButton/SettingsButton';
import { SettingsGroup } from '../components/Modal/SettingsModal';
import { useEntityState } from '../contexts/HassContext';
import { ReactComponent as BrightIcon } from '../assets/utils/lights_bright.svg';
import { ReactComponent as DimmedIcon } from '../assets/utils/lights_dimmed.svg';
import { ReactComponent as NightlightIcon } from '../assets/utils/lights_nightlight.svg';

import foyerBg from '../assets/room_bgs/foyer.jpg';
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

export default function FoyerDashboard() {
  const roomState = useEntityState('input_select.foyer');

  // Define room-specific settings configuration
  const settingsGroups: SettingsGroup[] = [
    {
      id: 'settings',
      label: 'General Settings',
      items: [
        // {
        //   id: 'light_automations',
        //   label: 'Lighting Automations',
        //   description: 'Enable lighting automations within the Foyer',
        //   entityId: 'input_boolean.foyer_lighting_automations',
        //   entityType: 'input_boolean'
        // },
        {
          id: 'adaptive_lighting',
          label: 'Adaptive Lighting',
          description: 'Automatically adjust light color temperature based on time of day',
          entityId: 'switch.adaptive_lighting_foyer',
          entityType: 'switch'
        },
        {
          id: 'adaptive_lighting_sleep_mode',
          label: 'Adaptive Lighting Sleep Mode',
          description: 'Automatically adjust light color temperature based on time of day for sleep mode',
          entityId: 'switch.adaptive_lighting_sleep_mode_foyer',
          entityType: 'switch'
        }
      ]
    },
    {
      id: 'automations',
      label: 'Automations',
      items: [
        {
          id: 'vacuum_clean_dining_and_foyer_at_night',
          label: 'Clean Dining and Foyer at Night',
          description: 'Clean dining and foyer at night',
          entityId: 'automation.vacuum_clean_dining_and_foyer_at_night',
          entityType: 'automation'
        },
        {
          id: "foyer_lights_nightlight",
          label: "Foyer Lights Nightlight",
          description: "Turn on foyer lights at night",
          entityId: "input_boolean.foyer_lights_nightlight",
          entityType: "input_boolean"
        }
      ]
    },
    {
      id: "security",
      label: "Security",
      items: [
        {
          id: "front_door_security",
          label: "Automatically Lock Front Door",
          description: "Lock front door if open for too long",
          entityId: "automation.front_door_lock_if_open_too_long",
          entityType: "automation"
        }
      ]
    }
  ];

  // Define all lights in this room (group first, then individual lights)
  const roomLights = [
    { entityId: 'light.foyer_ceiling_lights_group', name: 'All', displayName: 'All Lights' },
    { entityId: 'light.foyer_ceiling_lights', name: 'Ceiling', displayName: 'Ceiling Lights' },
    { entityId: 'light.foyer_coat_closet', name: 'Closet', displayName: 'Coat Closet' },
  ];

  // Define scenes for foyer lights
  const foyerScenes: LightScene[] = [
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
    <Room bg={foyerBg}>
      <RoomContainer>
        <DashboardHeader>
          <RoomState
            mode={getMode(roomState?.state)}
            icon={stateIcons[getMode(roomState?.state)] || autoIcon}
          />
        </DashboardHeader>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <RoomInfo
            roomName="Foyer"
          />
        </div>
      
        <DeviceRow>
          <LightCard
            entityId="light.foyer_ceiling_lights_group"
            name="Ceiling Lights"
            lightType="ceiling"
            roomName="Foyer"
            roomLights={roomLights}
            scenes={foyerScenes}
          />
          <LightCard
            entityId="light.foyer_chandelier"
            name="Chandelier"
            lightType="ceiling"
            scenes={foyerScenes}
          />
          <LightCard
            entityId="light.stairs_light"
            name="Stair Lights"
            lightType="lightstrip"
            scenes={foyerScenes}
          />
          <DoorCard 
            entityId="binary_sensor.front_door" 
            name="Front Door"
          />
          <LockCard
            entityId="lock.front_door"
            name="Front Door Lock"
          />
        </DeviceRow>
        
        <SettingsButton roomName="Foyer" settingsGroups={settingsGroups} />
      </RoomContainer>
    </Room>
  );
} 