import React from 'react';
import Room from '../components/Room/Room';
import RoomContainer from '../components/Room/RoomContainer';
import RoomState from '../components/RoomState/RoomState';
import DashboardHeader from '../components/DashboardHeader/DashboardHeader';
import RoomInfo from '../components/RoomInfo/RoomInfo';
import DeviceRow from '../components/DeviceRow/DeviceRow';
import LightCard, { LightScene } from '../components/DeviceCard/LightCard';
import DoorCard from '../components/DeviceCard/DoorCard';
import OutletCard from '../components/DeviceCard/OutletCard';
import FanCard from '../components/DeviceCard/FanCard';
import ThermostatCard from '../components/DeviceCard/ThermostatCard';
import SettingsButton from '../components/SettingsButton/SettingsButton';
import { SettingsGroup } from '../components/Modal/SettingsModal';
import { useEntityState } from '../contexts/HassContext';
import { ReactComponent as BrightIcon } from '../assets/utils/lights_bright.svg';
import { ReactComponent as DimmedIcon } from '../assets/utils/lights_dimmed.svg';
import { ReactComponent as NightlightIcon } from '../assets/utils/lights_nightlight.svg';

import jrSuiteBg from '../assets/room_bgs/jr_suite.jpg';
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

export default function JrSuiteDashboard() {
  const roomState = useEntityState('input_select.jr_suite');

  // Define room-specific settings configuration
  const settingsGroups: SettingsGroup[] = [
    {
      id: 'settings',
      label: 'General Settings',
      items: [
        // {
        //   id: 'speech_notifications',
        //   label: 'Speech Notifications',
        //   description: 'Enable voice announcements for Jr. Suite events',
        //   entityId: 'input_boolean.jr_suite_speech_notifications',
        //   entityType: 'input_boolean'
        // },
        // {
        //   id: 'light_automations',
        //   label: 'Lighting Automations',
        //   description: 'Enable lighting automations within the Jr. Suite',
        //   entityId: 'input_boolean.jr_suite_lighting_automations',
        //   entityType: 'input_boolean'
        // },
        // {
        //   id: 'adaptive_lighting',
        //   label: 'Adaptive Lighting',
        //   description: 'Automatically adjust light color temperature based on time of day',
        //   entityId: 'switch.adaptive_lighting_jr_suite',
        //   entityType: 'switch'
        // },
        // {
        //   id: 'adaptive_lighting_sleep_mode',
        //   label: 'Adaptive Lighting Sleep Mode',
        //   description: 'Automatically adjust light color temperature based on time of day for sleep mode',
        //   entityId: 'switch.adaptive_lighting_sleep_mode_jr_suite',
        //   entityType: 'switch'
        // }
      ]
    },
    {
      id: 'automations',
      label: 'Automations',
      items: [
        {
          id: 'jr_suite_air_quality_detections',
          label: 'Air Quality Automations',
          description: 'Enable air quality automations within the Jr. Suite',
          entityId: 'automation.jr_suite_air_quality_detections',
          entityType: 'automation'
        },
        // {
        //   id: 'jr_suite_sleep_mode',
        //   label: 'Sleep Mode Automation',
        //   description: 'Enable sleep mode automations in the Jr. Suite',
        //   entityId: 'automation.jr_suite_sleep_mode',
        //   entityType: 'automation'
        // }
      ]
    }
  ];

  // Define all lights in this room
  const roomLights = [
    { entityId: 'light.jr_suite_bedroom_main_lights', name: 'All', displayName: 'All Lights' },
  ];

  // Define scenes for Jr. Suite lights
  const jrSuiteScenes: LightScene[] = [
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
    <Room bg={jrSuiteBg}>
      <RoomContainer>
        <DashboardHeader>
          <RoomState
            mode={getMode(roomState?.state)}
            icon={stateIcons[getMode(roomState?.state)] || autoIcon}
          />
        </DashboardHeader>
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <RoomInfo
            roomName="Jr. Suite"
            tempSensor="sensor.jr_suite_awair_temperature"
            aqiSensor="sensor.jr_suite_awair_score"
            humiditySensor="sensor.jr_suite_awair_humidity"
            co2Sensor="sensor.jr_suite_awair_carbon_dioxide"
            tvocSensor="sensor.jr_suite_awair_vocs"
            pm25Sensor="sensor.jr_suite_awair_pm2_5"
          />
        </div>

        <DeviceRow>
          <LightCard
            entityId="light.jr_suite_bedroom_main_lights"
            name="Ceiling Lights"
            lightType="ceiling"
            roomName="Jr. Suite"
            roomLights={roomLights}
            scenes={jrSuiteScenes}
          />
          <FanCard 
            entityId="fan.jr_suite_air_purifier" 
            name="Air Purifier"
          />
          <OutletCard 
            entityId="switch.smart_plug_22_switch" 
            name="Cristina's Desk"
          />
          <DoorCard 
            entityId="binary_sensor.jr_suite_door_status" 
            name="Door"
          />
          <ThermostatCard
            entityId="climate.jr_suite"
            name="Radiant Heat"
            type="radiant"
          />
        </DeviceRow>
        
        <SettingsButton roomName="Jr. Suite" settingsGroups={settingsGroups} />
      </RoomContainer>
    </Room>
  );
} 