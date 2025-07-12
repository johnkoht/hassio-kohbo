import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useEntityState } from '../../contexts/HassContext';
import { RoomData, getAQIDescription } from '../../data/roomsData';

const CardContainer = styled.div<{ $backgroundImage?: string }>`
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 20px;
  overflow: hidden;
  background: ${props => props.$backgroundImage 
    ? `url(${require(`../../assets/room_bgs/${props.$backgroundImage}`)}) center/cover no-repeat`
    : 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)'
  };
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const OccupancyStatus = styled.div<{ $isOccupied: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const OccupancyDot = styled.div<{ $isOccupied: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$isOccupied ? '#22c55e' : '#64748b'};
  box-shadow: ${props => props.$isOccupied ? '0 0 8px rgba(34, 197, 94, 0.5)' : 'none'};
`;

const ClimateInfo = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
`;

const RoomName = styled.h3`
  font-family: 'Poppins', Arial, Helvetica, sans-serif;
  font-size: 32px;
  font-weight: 600;
  color: #fff;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  line-height: 1.1;
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

export default function RoomCard({ room, onClick }: RoomCardProps) {
  const navigate = useNavigate();
  const tempEntity = useEntityState(room.tempSensor);
  const aqiEntity = useEntityState(room.aqiSensor || '');
  const occupancyEntity = useEntityState(room.occupancySensor || '');

  const temperature = tempEntity?.state ? Math.round(parseFloat(tempEntity.state)) : '--';
  const aqiScore = aqiEntity?.state ? Math.round(parseFloat(aqiEntity.state)) : null;
  const isOccupied = occupancyEntity?.state === 'on';

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
            <OccupancyStatus $isOccupied={isOccupied}>
              <OccupancyDot $isOccupied={isOccupied} />
              {isOccupied ? 'Occupied' : 'Empty'}
            </OccupancyStatus>
          )}
          <ClimateInfo>
            {getClimateText()}
          </ClimateInfo>
        </TopSection>
        
        <RoomName>{room.displayName}</RoomName>
      </Overlay>
      
      {!room.hasPage && (
        <UnavailableOverlay>
          Coming Soon
        </UnavailableOverlay>
      )}
    </CardContainer>
  );
} 