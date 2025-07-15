import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useEntityState } from '../../contexts/HassContext';
import { RoomData, getAQIDescription } from '../../data/roomsData';

const CardContainer = styled.div<{ $backgroundImage?: string }>`
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: ${props => props.$backgroundImage 
    ? `url(${require(`../../assets/room_bgs/${props.$backgroundImage}`)}) center/cover no-repeat`
    : 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)'
  };
  filter: drop-shadow(0px 2px 10px #212529);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:active {
    transform: translateY(0);
  }
`;


const Overlay = styled.div`
  position: absolute;
  inset: 0;
  /* background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%); */
  background: rgba(33, 37, 41, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

type OccupancyDisplayState = 'Occupied' | 'Empty' | 'Do Not Disturb' | 'Bedtime';

const OccupancyStatus = styled.div<{ $state: OccupancyDisplayState }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Poppins', Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: ${props => {
    switch (props.$state) {
      case 'Occupied':
      case 'Do Not Disturb':
      case 'Bedtime':
        return '#FFF';
      case 'Empty':
      default:
        return '#ADB5BD';
    }
  }};
`;

const OccupancyDot = styled.div<{ $state: OccupancyDisplayState }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => {
    switch (props.$state) {
      case 'Occupied':
        return '#22c55e'; // Green
      case 'Empty':
        return '#6C757D'; // Gray
      case 'Do Not Disturb':
        return '#dc2626'; // Red
      case 'Bedtime':
        return '#ea580c'; // Orange
      default:
        return '#6C757D';
    }
  }};
  box-shadow: ${props => {
    switch (props.$state) {
      case 'Occupied':
        return '0 0 8px rgba(34, 197, 94, 0.5)';
      case 'Do Not Disturb':
        return '0 0 8px rgba(220, 38, 38, 0.5)';
      case 'Bedtime':
        return '0 0 8px rgba(234, 88, 12, 0.5)';
      default:
        return 'none';
    }
  }};
`;

const MiddleSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const RoomInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ClimateInfo = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
`;

const RoomName = styled.h3`
  font-family: 'Poppins', Arial, Helvetica, sans-serif;
  font-size: 40px;
  line-height: 40px;
  font-weight: 400;
  color: #fff;
  margin: 0;
`;

const UnavailableOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(2px);
`;

interface RoomCardProps {
  room: RoomData;
  onClick?: () => void;
}

function getOccupancyDisplayState(
  occupancyEntity: any, 
  roomStateEntity: any
): OccupancyDisplayState {
  const roomState = roomStateEntity?.state;
  const isOccupied = occupancyEntity?.state === 'on';

  // If room is in DnD or Bedtime mode, show that instead of occupancy
  if (roomState === 'DnD') {
    return 'Do Not Disturb';
  }
  if (roomState === 'Bedtime') {
    return 'Bedtime';
  }

  // Otherwise, show normal occupancy state
  return isOccupied ? 'Occupied' : 'Empty';
}

export default function RoomCard({ room, onClick }: RoomCardProps) {
  const navigate = useNavigate();
  const tempEntity = useEntityState(room.tempSensor || '');
  const aqiEntity = useEntityState(room.aqiSensor || '');
  const occupancyEntity = useEntityState(room.occupancySensor || '');
  const roomStateEntity = useEntityState(room.roomStateSensor || '');

  const temperature = tempEntity?.state ? Math.round(parseFloat(tempEntity.state)) : '--';
  const aqiScore = aqiEntity?.state ? Math.round(parseFloat(aqiEntity.state)) : null;
  const occupancyState = getOccupancyDisplayState(occupancyEntity, roomStateEntity);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    
    if (room.hasPage) {
      navigate(room.route);
    }
  };

  const getClimateText = () => {
    if (room.aqiSensor && aqiScore !== null) {
      return `${temperature}° – ${getAQIDescription(aqiScore)}`;
    }
    return `${temperature}°`;
  };

  return (
    <CardContainer 
      $backgroundImage={room.backgroundImage}
      onClick={handleClick}
    >
      <Overlay>
        <TopSection>
          {room.occupancySensor && (
            <OccupancyStatus $state={occupancyState}>
              <OccupancyDot $state={occupancyState} />
              {occupancyState}
            </OccupancyStatus>
          )}
        </TopSection>
        
        <MiddleSection>
          <RoomInfo>
            {room.tempSensor && (
              <ClimateInfo>
                {getClimateText()}
              </ClimateInfo>
            )}
            <RoomName>{room.displayName}</RoomName>
          </RoomInfo>
        </MiddleSection>
      </Overlay>
      
      {!room.hasPage && (
        <UnavailableOverlay>
          Coming Soon
        </UnavailableOverlay>
      )}
    </CardContainer>
  );
} 