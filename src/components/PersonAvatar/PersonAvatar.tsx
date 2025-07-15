import React from 'react';
import styled from 'styled-components';
import { useEntityState } from '../../contexts/HassContext';
import { PersonData } from '../../types/people';

const AvatarContainer = styled.div`
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;
  width: 34px;
  height: 34px;
`;

const AvatarImage = styled.img`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  background-color: rgba(255, 255, 255, 0.1);
`;

const AvatarInitials = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: white;
  text-transform: uppercase;
`;



interface PersonAvatarProps {
  person: PersonData;
  onClick?: (person: PersonData) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .slice(0, 2);
}

export default function PersonAvatar({ person, onClick }: PersonAvatarProps) {
  const personEntity = useEntityState(person.entityId);
  const entityPicture = personEntity?.attributes?.entity_picture;
  
  const handleClick = () => {
    if (onClick) {
      onClick(person);
    }
  };

  return (
    <AvatarContainer onClick={handleClick}>
      {entityPicture ? (
        <AvatarImage 
          src={entityPicture} 
          alt={person.name}
          onError={(e) => {
            // If image fails to load, hide it so initials show instead
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <AvatarInitials>
          {getInitials(person.name)}
        </AvatarInitials>
      )}
    </AvatarContainer>
  );
} 