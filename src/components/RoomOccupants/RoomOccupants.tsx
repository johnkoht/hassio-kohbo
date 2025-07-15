import React from 'react';
import styled from 'styled-components';
import { useEntityState } from '../../contexts/HassContext';
import { PersonData, PEOPLE_CONFIG } from '../../types/people';
import PersonAvatar from '../PersonAvatar';

const OccupantsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const OccupantsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

interface RoomOccupantsProps {
  currentRoom: string;
  onPersonClick?: (person: PersonData) => void;
}

export default function RoomOccupants({ currentRoom, onPersonClick }: RoomOccupantsProps) {
  // Call all hooks at the top level (React requirement)
  const johnPresence = useEntityState('sensor.john_room_presence');
  const cristinaPresence = useEntityState('sensor.cristina_room_presence');
  const maryPresence = useEntityState('sensor.mary_room_presence');
  const antounPresence = useEntityState('sensor.antoun_room_presence');
  const katiaPresence = useEntityState('sensor.katia_room_presence');
  const soniaPresence = useEntityState('sensor.sonia_room_presence');
  const joePresence = useEntityState('sensor.joe_room_presence');

  // Map people to their presence states
  const presenceStates = [
    { person: PEOPLE_CONFIG[0], presenceState: johnPresence },
    { person: PEOPLE_CONFIG[1], presenceState: cristinaPresence },
    { person: PEOPLE_CONFIG[2], presenceState: maryPresence },
    { person: PEOPLE_CONFIG[3], presenceState: antounPresence },
    { person: PEOPLE_CONFIG[4], presenceState: katiaPresence },
    { person: PEOPLE_CONFIG[5], presenceState: soniaPresence },
    { person: PEOPLE_CONFIG[6], presenceState: joePresence },
  ];

  // Filter people currently in this room
  const peopleInRoom = presenceStates
    .filter(({ presenceState }) => presenceState?.state === currentRoom)
    .map(({ person }) => person);

  // Don't render anything if no one is in the room
  if (peopleInRoom.length === 0) {
    return null;
  }

  return (
    <OccupantsContainer>
      <OccupantsWrapper>
        {peopleInRoom.map(person => (
          <PersonAvatar
            key={person.id}
            person={person}
            onClick={onPersonClick}
          />
        ))}
      </OccupantsWrapper>
    </OccupantsContainer>
  );
} 