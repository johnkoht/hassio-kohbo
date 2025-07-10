import React from 'react';
import styled from 'styled-components';
import { useEntityState } from '../../contexts/HassContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  margin-top: 95px;
  margin-bottom: 30px;
`;

const RoomName = styled.div`
  font-size: 100px;
  font-style: normal;
  font-weight: 400;
  font-family: 'Poppins', Arial, Helvetica, sans-serif;
  color: #fff;
  line-height: 100px;
`;

const TempQualityRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 5px;
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 14px;
  color: #FFFFFF;
  margin-bottom: 10px;
`;

const Temp = styled.div`
  font-weight: 500;
  color: #fff;
`;

const AirQuality = styled.div`
  font-weight: 500;
  color: #fff;
`;

function getAirQualityText(score: number | null): string {
  if (score === null) return '';
  if (score > 90) return 'Air Quality is Good';
  if (score > 70) return 'Air Quality is Moderate';
  if (score > 50) return 'Air Quality is Unhealthy';
  return 'Air Quality is Poor';
}

interface RoomInfoProps {
  roomName: string;
  tempSensor: string;
  aqiSensor: string;
}

export default function RoomInfo({ roomName, tempSensor, aqiSensor }: RoomInfoProps) {
  const temp = useEntityState(tempSensor);
  const aqi = useEntityState(aqiSensor);

  const tempValue = temp?.state ? `${Math.round(Number(temp.state))}°` : '--';
  const aqiScore = aqi?.state ? Number(aqi.state) : null;
  const airQualityText = getAirQualityText(aqiScore);

  return (
    <Container>
      <TempQualityRow>
        <Temp>{tempValue}</Temp>–<AirQuality>{airQualityText}</AirQuality>
      </TempQualityRow>
      <RoomName>{roomName}</RoomName>
    </Container>
  );
} 