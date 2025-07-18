import { FloorType } from '../contexts/NavigationContext';

export interface RoomData {
  id: string;
  name: string;
  displayName: string;
  route: string;
  floor: FloorType;
  tempSensor?: string;
  aqiSensor?: string;
  occupancySensor?: string;
  roomStateSensor?: string;
  backgroundImage?: string;
  hasPage?: boolean; // Whether this room has a dedicated page
}

export const roomsData: RoomData[] = [
  // Main Floor
  {
    id: 'kitchen',
    name: 'Kitchen',
    displayName: 'Kitchen',
    route: '/kitchen',
    floor: 'main',
    tempSensor: 'sensor.kitchen_awair_temperature',
    aqiSensor: 'sensor.kitchen_awair_score',
    occupancySensor: 'input_boolean.kitchen_occupied',
    roomStateSensor: 'input_select.kitchen',
    backgroundImage: 'kitchen-bg.jpg',
    hasPage: true,
  },
  {
    id: 'office',
    name: 'Office',
    displayName: 'Office',
    route: '/office',
    floor: 'main',
    tempSensor: 'sensor.office_awair_temperature',
    aqiSensor: 'sensor.office_awair_score',
    occupancySensor: 'input_boolean.office_occupied',
    roomStateSensor: 'input_select.office',
    backgroundImage: 'office-bg.jpg',
    hasPage: true,
  },
  {
    id: 'family_room',
    name: 'Family Room',
    displayName: 'Family Room',
    route: '/family-room',
    floor: 'main',
    tempSensor: 'sensor.kitchen_awair_temperature',
    aqiSensor: 'sensor.kitchen_awair_score',
    occupancySensor: 'input_boolean.family_room_occupied',
    roomStateSensor: 'input_select.family_room',
    backgroundImage: 'family_room.jpg',
    hasPage: true,
  },
  {
    id: 'playroom',
    name: 'Playroom',
    displayName: 'Playroom',
    route: '/playroom',
    floor: 'main',
    tempSensor: 'sensor.playroom_temperature',
    // aqiSensor: 'sensor.playroom_aqi',
    occupancySensor: 'input_boolean.playroom_occupied',
    roomStateSensor: 'input_select.playroom',
    backgroundImage: 'playroom.jpg',
    hasPage: true,
  },
  {
    id: 'jr_suite',
    name: 'Jr. Suite',
    displayName: 'Jr. Suite',
    route: '/jr-suite',
    floor: 'main',
    tempSensor: 'sensor.jr_suite_awair_temperature',
    aqiSensor: 'sensor.jr_suite_awair_score',
    // occupancySensor: 'input_boolean.jr_suite_occupied',
    roomStateSensor: 'input_select.jr_suite',
    backgroundImage: 'jr_suite.jpg',
    hasPage: true,
  },
  {
    id: 'dining_room',
    name: 'Dining Room',
    displayName: 'Dining Room',
    route: '/dining-room',
    floor: 'main',
    // tempSensor: 'sensor.dining_room_temperature',
    // aqiSensor: 'sensor.dining_room_aqi',
    occupancySensor: 'input_boolean.dining_room_occupied',
    roomStateSensor: 'input_select.dining_room',
    backgroundImage: 'dining_room.jpg',
    hasPage: false,
  },
  {
    id: 'foyer',
    name: 'Foyer',
    displayName: 'Foyer',
    route: '/foyer',
    floor: 'main',
    // tempSensor: 'sensor.foyer_temperature',
    // aqiSensor: 'sensor.foyer_aqi',
    // occupancySensor: 'input_boolean.foyer_occupied',
    roomStateSensor: 'input_select.foyer',
    backgroundImage: 'foyer.jpg',
    hasPage: true,
  },
  {
    id: 'mudroom',
    name: 'Mudroom',
    displayName: 'Mudroom',
    route: '/mudroom',
    floor: 'main',
    tempSensor: 'sensor.mudroom_temperature',
    aqiSensor: 'sensor.mudroom_aqi',
    occupancySensor: 'input_boolean.mudroom_occupied',
    roomStateSensor: 'input_select.mudroom',
    backgroundImage: 'mudroom.jpg',
    hasPage: false,
  },
  {
    id: 'powder_room',
    name: 'Powder Room',
    displayName: 'Powder Room',
    route: '/powder-room',
    floor: 'main',
    tempSensor: 'sensor.mudroom_motion_sensor_air_temperature',
    // occupancySensor: 'input_boolean.powder_room_occupied',
    roomStateSensor: 'input_select.powder_room',
    backgroundImage: 'powder_room.jpg',
    hasPage: false,
  },
  // Upper Floor
  {
    id: 'main_bedroom',
    name: 'Main Bedroom',
    displayName: 'Main Bedroom',
    route: '/main-bedroom',
    floor: 'upper',
    tempSensor: 'sensor.main_bedroom_awair_temperature',
    aqiSensor: 'sensor.main_bedroom_awair_score',
    occupancySensor: 'input_boolean.main_bedroom_occupied',
    roomStateSensor: 'input_select.main_bedroom',
    backgroundImage: 'main_bedroom.jpg',
    hasPage: true,
  },
  {
    id: 'ninos_bedroom',
    name: 'Nino\'s Bedroom',
    displayName: 'Nino\'s Bedroom',
    route: '/ninos-bedroom',
    floor: 'upper',
    tempSensor: 'sensor.nino_bedroom_awair_temperature',
    aqiSensor: 'sensor.nino_bedroom_awair_score',
    occupancySensor: 'input_boolean.ninos_bedroom_occupied',
    roomStateSensor: 'input_select.ninos_bedroom',
    backgroundImage: 'ninos_bedroom.jpg',
    hasPage: true,
  },
  {
    id: 'gianlucas_bedroom',
    name: 'Gianluca\'s Bedroom',
    displayName: 'Gianluca\'s Bedroom',
    route: '/gianlucas-bedroom',
    floor: 'upper',
    tempSensor: 'sensor.gianluca_bedroom_awair_temperature',
    aqiSensor: 'sensor.gianluca_bedroom_awair_score',
    occupancySensor: 'input_boolean.gianlucas_room_occupied',
    roomStateSensor: 'input_select.gianlucas_bedroom',
    backgroundImage: 'gianlucas_bedroom.jpg',
    hasPage: true,
  },
  // Lower Floor
  {
    id: 'basement',
    name: 'Basement',
    displayName: 'Basement',
    route: '/basement',
    floor: 'lower',
    tempSensor: 'sensor.basement_temperature',
    aqiSensor: 'sensor.basement_aqi',
    occupancySensor: 'input_boolean.basement_occupied',
    roomStateSensor: 'input_select.basement',
    hasPage: false,
  },
  {
    id: 'basement_bathroom',
    name: 'Basement Bathroom',
    displayName: 'Basement Bathroom',
    route: '/basement-bathroom',
    floor: 'lower',
    tempSensor: 'sensor.basement_bathroom_temperature',
    occupancySensor: 'input_boolean.basement_bathroom_occupied',
    roomStateSensor: 'input_select.basement_bathroom',
    hasPage: false,
  },
  // Laundry
  {
    id: 'laundry',
    name: 'Laundry',
    displayName: 'Laundry',
    route: '/laundry',
    floor: 'laundry',
    tempSensor: 'sensor.laundry_temperature',
    occupancySensor: 'input_boolean.laundry_occupied',
    roomStateSensor: 'input_select.laundry',
    hasPage: false,
  },
  // Exterior
  {
    id: 'front_yard',
    name: 'Front Yard',
    displayName: 'Front Yard',
    route: '/front-yard',
    floor: 'exterior',
    tempSensor: 'sensor.front_yard_temperature',
    hasPage: false,
  },
  {
    id: 'back_yard',
    name: 'Back Yard',
    displayName: 'Back Yard',
    route: '/back-yard',
    floor: 'exterior',
    tempSensor: 'sensor.back_yard_temperature',
    hasPage: false,
  },
  {
    id: 'garage',
    name: 'Garage',
    displayName: 'Garage',
    route: '/garage',
    floor: 'exterior',
    tempSensor: 'sensor.garage_temperature',
    occupancySensor: 'input_boolean.garage_occupied',
    roomStateSensor: 'input_select.garage',
    hasPage: false,
  },
];

export const getAQIDescription = (score: number): string => {
  if (score >= 80) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Very Poor';
};

export const floorLabels: Record<FloorType, string> = {
  main: 'Main Floor',
  upper: 'Upper Floor',
  lower: 'Lower Floor',
  exterior: 'Exterior',
  laundry: 'Laundry',
};

export const getRoomsByFloor = (floor: FloorType): RoomData[] => {
  return roomsData.filter(room => room.floor === floor);
}; 