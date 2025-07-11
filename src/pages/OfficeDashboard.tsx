import React from 'react';
import Room from '../components/Room/Room';
import RoomState from '../components/RoomState/RoomState';
import OccupancyState from '../components/OccupancyState/OccupancyState';
import DashboardHeader from '../components/DashboardHeader/DashboardHeader';
import RoomInfo from '../components/RoomInfo/RoomInfo';
import DeviceRow from '../components/DeviceRow/DeviceRow';
import LightCard from '../components/DeviceCard/LightCard';
import FanCard from '../components/DeviceCard/FanCard';
import OutletCard from '../components/DeviceCard/OutletCard';
import DoorCard from '../components/DeviceCard/DoorCard';
import WindowCard from '../components/DeviceCard/WindowCard';
import { useEntityState } from '../contexts/HassContext';

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

  // Define all lights in this room (using multiple instances of office_lights for testing)
  const roomLights = [
    { entityId: 'light.office_lights', name: 'Ceiling Lights' },
    { entityId: 'light.office_el_gato_light', name: 'Desk Lamp' },
    { entityId: 'light.office_shelves', name: 'Office Shelves' },
  ];

  return (
    <Room bg={officeBg}>
      <div style={{ padding: '50px 60px' }}>
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
            <LightCard
              entityId="light.office_lights"
              name="Ceiling Lights"
              lightType="ceiling"
              roomName="Office"
              roomLights={roomLights}
            />
            <LightCard
              entityId="light.office_el_gato_light"
              name="Desk Lamp"
              lightType="lamp"
            />
            <LightCard
              entityId="light.office_shelves"
              name="Shelf Lights"
              lightType="lightstrip"
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
        
      </div>
    </Room>
  );
} 