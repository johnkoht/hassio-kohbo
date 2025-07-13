import React from 'react';
import Room from '../components/Room/Room';
import RoomState from '../components/RoomState/RoomState';
import OccupancyState from '../components/OccupancyState/OccupancyState';
import DashboardHeader from '../components/DashboardHeader/DashboardHeader';
import RoomInfo from '../components/RoomInfo/RoomInfo';
import DeviceRow from '../components/DeviceRow/DeviceRow';
import LightCard, { LightScene } from '../components/DeviceCard/LightCard';
import ThermostatCard from '../components/DeviceCard/ThermostatCard';
import TVCard from '../components/DeviceCard/TVCard';
import SettingsButton from '../components/SettingsButton/SettingsButton';
import { SettingsGroup } from '../components/Modal/SettingsModal';
import { useEntityState } from '../contexts/HassContext';
import { hassApiFetch } from '../api/hassApiFetch';
import { ReactComponent as BrightIcon } from '../assets/utils/lights_bright.svg';
import { ReactComponent as DimmedIcon } from '../assets/utils/lights_dimmed.svg';
import { ReactComponent as NightlightIcon } from '../assets/utils/lights_nightlight.svg';

import familyRoomBg from '../assets/room_bgs/family_room.jpg';
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

export default function FamilyRoomDashboard() {
  const roomState = useEntityState('input_select.family_room');
  const occupancy = useEntityState('input_boolean.family_room_occupied');
  const sonyTV = useEntityState('media_player.sony_bravia_tv');
  const masterBedroomTV = useEntityState('media_player.master_bedroom');

  // Define room-specific settings configuration
  const settingsGroups: SettingsGroup[] = [
    {
      id: 'settings',
      label: 'General Settings',
      items: [
        {
          id: 'speech_notifications',
          label: 'Speech Notifications',
          description: 'Enable voice announcements for family room events',
          entityId: 'input_boolean.family_room_speech_notifications',
          entityType: 'input_boolean'
        },
        {
          id: 'adaptive_lighting',
          label: 'Adaptive Lighting',
          description: 'Automatically adjust light color temperature based on time of day',
          entityId: 'switch.adaptive_lighting_family_room',
          entityType: 'switch'
        },
        {
          id: 'adaptive_lighting_sleep_mode',
          label: 'Adaptive Lighting Sleep Mode',
          description: 'Automatically adjust light color temperature based on time of day for sleep mode',
          entityId: 'switch.adaptive_lighting_sleep_mode_family_room',
          entityType: 'switch'
        }
      ]
    }
  ];

  // Define all lights in this room
  const roomLights = [
    { entityId: 'light.family_room_main_lights', name: 'All', displayName: 'All Lights' },
  ];

  // Define scenes for family room lights
  const familyRoomScenes: LightScene[] = [
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

  // function toggleTV(entityId: string) {
  //   const entity = useEntityState(entityId);
  //   const service = entity?.state === 'off' ? 'media_player/turn_on' : 'media_player/turn_off';
  //   hassApiFetch(`/api/services/${service}`, {
  //     method: 'POST',
  //     body: JSON.stringify({ entity_id: entityId }),
  //   });
  // }

  return (
    <Room bg={familyRoomBg}>
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
            roomName="Family Room"
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
              entityId="light.family_room_main_lights"
              name="Family Room Lights"
              lightType="ceiling"
              roomName="Family Room"
              roomLights={roomLights}
              scenes={familyRoomScenes}
            />
            <ThermostatCard
              entityId="climate.nest_main_floor"
              name="Thermostat"
              type="hvac"
            />
            <TVCard
              entityId="media_player.sony_bravia_tv"
              name="Sony TV"
            />
            <TVCard
              entityId="media_player.master_bedroom"
              name="Master Bedroom TV"
            />
          </DeviceRow>
        </div>
        
        <SettingsButton roomName="Family Room" settingsGroups={settingsGroups} />
      </div>
    </Room>
  );
} 