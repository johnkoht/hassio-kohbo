import React from 'react';
import styled from 'styled-components';
import { useEntityState } from '../../contexts/HassContext';
import { useModal } from '../../contexts/ModalContext';

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  margin-top: 80px;
  margin-bottom: 30px;
  cursor: pointer;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
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
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  margin-bottom: 5px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

interface RoomInfoProps {
  roomName: string;
  tempSensor: string;
  aqiSensor?: string;
  humiditySensor?: string;
  co2Sensor?: string;
  tvocSensor?: string;
}

function getAQIDescription(score: number): string {
  if (score >= 80) return 'air quality is excellent';
  if (score >= 60) return 'air quality is good';
  if (score >= 40) return 'air quality is fair';
  return 'air quality is poor';
}

export default function RoomInfo({ 
  roomName, 
  tempSensor, 
  aqiSensor, 
  humiditySensor, 
  co2Sensor, 
  tvocSensor 
}: RoomInfoProps) {
  const { openModal } = useModal();
  const tempEntity = useEntityState(tempSensor);
  const aqiEntity = useEntityState(aqiSensor || '');

  const temperature = tempEntity?.state ? Math.round(parseFloat(tempEntity.state)) : '--';
  const aqiScore = aqiEntity?.state ? Math.round(parseFloat(aqiEntity.state)) : null;

  const handleClick = () => {
    // Create a pipe-separated string with room info for the modal
    const modalEntityId = [
      roomName, 
      tempSensor, 
      humiditySensor || '', 
      aqiSensor || '', 
      co2Sensor || '', 
      tvocSensor || ''
    ].join('|');
    openModal('climate', modalEntityId);
  };

  const climateText = aqiScore !== null 
    ? `${temperature}° – ${getAQIDescription(aqiScore)}`
    : `${temperature}°`;

  return (
    <InfoContainer>
      <ClimateInfo onClick={handleClick}>{climateText}</ClimateInfo>
      <RoomName>{roomName}</RoomName>
    </InfoContainer>
  );
} 