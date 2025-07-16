import React from 'react';
import styled from 'styled-components';
import { useEntityState, useHassConnection } from '../../contexts/HassContext';
import { useModal } from '../../contexts/ModalContext';

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  margin-top: 50px;
  margin-bottom: 25px;
  padding: 0 40px;
`;

const RoomName = styled.h2`
  font-family: 'Poppins', Arial, Helvetica, sans-serif;
  font-size: 100px;
  font-weight: 400;
  color: #fff;
  margin: 0;
  line-height: 100px;
`;

const ClimateInfo = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: #ffffff;
  line-height: 18px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  user-select: none;
  pointer-events: auto;
  position: relative;
  z-index: 10;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &.loading {
    opacity: 0.6;
    cursor: wait;
  }

  &:active {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(1px);
  }
`;

interface RoomInfoProps {
  roomName: string;
  tempSensor?: string;
  aqiSensor?: string;
  humiditySensor?: string;
  co2Sensor?: string;
  tvocSensor?: string;
  pm25Sensor?: string;
}

function getAQIDescription(score: number): string {
  if (score >= 81) return 'Air Quality is Good';
  if (score >= 61) return 'Air Quality is Acceptable';
  if (score >= 41) return 'Air Quality is Moderate';
  if (score >= 21) return 'Air Quality is Poor';
  return 'Air Quality is Hazardous';
}

export default function RoomInfo({ 
  roomName, 
  tempSensor, 
  aqiSensor, 
  humiditySensor, 
  co2Sensor, 
  tvocSensor,
  pm25Sensor 
}: RoomInfoProps) {
  const { openModal } = useModal();
  const { isConnected, isInitialized } = useHassConnection();
  const tempEntity = useEntityState(tempSensor || '');
  const aqiEntity = useEntityState(aqiSensor || '');

  const temperature = tempEntity?.state ? Math.round(parseFloat(tempEntity.state)) : '--';
  const aqiScore = aqiEntity?.state ? Math.round(parseFloat(aqiEntity.state)) : null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Climate info clicked - event fired!', {
      timestamp: new Date().toISOString(),
      isInitialized,
      isConnected
    });

    if (!isInitialized) {
      console.log('Home Assistant not yet initialized, please wait...');
      return;
    }

    console.log('Climate info clicked - processing...', {
      tempEntity: tempEntity?.state,
      aqiEntity: aqiEntity?.state,
      aqiScore,
      isConnected,
      isInitialized,
      allSensors: { tempSensor, aqiSensor, humiditySensor, co2Sensor, tvocSensor, pm25Sensor }
    });
    
    // Create a pipe-separated string with room info for the modal
    const modalEntityId = [
      roomName, 
      tempSensor, 
      humiditySensor || '', 
      aqiSensor || '', 
      co2Sensor || '', 
      tvocSensor || '',
      pm25Sensor || ''
    ].join('|');
    
    console.log('Opening modal with entityId:', modalEntityId);
    openModal('climate', modalEntityId);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Prevent touch delay/ghost clicks
    e.preventDefault();
  };

  const getClimateText = () => {
    if (!isInitialized) {
      return 'Loading...';
    }
    
    // If no temperature sensor is provided, don't show climate info
    if (!tempSensor) {
      return null;
    }
    
    return aqiScore !== null 
      ? `${temperature}° – ${getAQIDescription(aqiScore)}`
      : `${temperature}°`;
  };

  const climateText = getClimateText();

  return (
    <InfoContainer>
      {climateText && (
        <ClimateInfo 
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          className={!isInitialized ? 'loading' : ''}
        >
          {climateText}
        </ClimateInfo>
      )}
      <RoomName>{roomName}</RoomName>
    </InfoContainer>
  );
} 