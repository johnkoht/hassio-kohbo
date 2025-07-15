export interface PersonData {
  id: string;
  name: string;
  entityId: string;
  presenceSensor: string;
}

export const PEOPLE_CONFIG: PersonData[] = [
  {
    id: 'john',
    name: 'John Koht',
    entityId: 'person.john_koht',
    presenceSensor: 'sensor.john_room_presence'
  },
  {
    id: 'cristina',
    name: 'Cristina Falbo',
    entityId: 'person.cristina_falbo',
    presenceSensor: 'sensor.cristina_room_presence'
  },
  {
    id: 'mary',
    name: 'Mary Falbo',
    entityId: 'person.mary_falbo',
    presenceSensor: 'sensor.mary_room_presence'
  },
  {
    id: 'antoun',
    name: 'Antoun Koht',
    entityId: 'person.antoun_koht',
    presenceSensor: 'sensor.antoun_room_presence'
  },
  {
    id: 'katia',
    name: 'Katia',
    entityId: 'person.katia',
    presenceSensor: 'sensor.katia_room_presence'
  },
  {
    id: 'sonia',
    name: 'Sonia Koht',
    entityId: 'person.sonia_koht',
    presenceSensor: 'sensor.sonia_room_presence'
  },
  {
    id: 'joe',
    name: 'Joe Falbo',
    entityId: 'person.joe_falbo',
    presenceSensor: 'sensor.joe_room_presence'
  }
]; 