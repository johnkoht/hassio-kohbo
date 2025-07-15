import React from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import DateTime from '../DateTime/DateTime';
import RoomOccupants from '../RoomOccupants';
import { getCurrentRoomFromPath } from '../../utils/roomUtils';
import { PersonData } from '../../types/people';

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  position: relative;
  padding-right: 60px;
`;

const LeftContent = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
  margin-top: 10px;
`;

export default function DashboardHeader({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const currentRoom = getCurrentRoomFromPath(location.pathname);

  const handlePersonClick = (person: PersonData) => {
    // TODO: Implement person detail modal/view
    console.log('Clicked on person:', person);
  };

  return (
    <HeaderContainer>
      <LeftContent>
        {children}
        {currentRoom && (
          <RoomOccupants 
            currentRoom={currentRoom} 
            onPersonClick={handlePersonClick}
          />
        )}
      </LeftContent>
      <DateTime />
    </HeaderContainer>
  );
} 