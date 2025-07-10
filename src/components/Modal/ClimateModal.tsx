import React from 'react';
import styled from 'styled-components';
import { useModal } from '../../contexts/ModalContext';
import { useEntityState } from '../../contexts/HassContext';
import { useEntityHistory } from '../../hooks/useEntityHistory';
import TemperatureChart from '../Charts/TemperatureChart';
import HumidityChart from '../Charts/HumidityChart';
import DotIndicator from '../DotIndicator/DotIndicator';

const ModalContent = styled.div`
  padding: 30px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h2`
  font-family: 'Poppins', Arial, Helvetica, sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #fff;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  opacity: 0.7;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const TopSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
`;

const SensorBox = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  text-align: center;
`;

const SensorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
`;

const SensorTitle = styled.h3`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 15px 0;
`;

const SensorValue = styled.div`
  font-family: 'Poppins', Arial, Helvetica, sans-serif;
  font-size: 32px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 20px;
`;

const AQISection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
`;

const AQIHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const AQITitle = styled.h3`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0;
`;

const AQIScore = styled.div<{ $score: number }>`
  font-family: 'Poppins', Arial, Helvetica, sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: ${props => {
    if (props.$score >= 80) return '#4CAF50'; // Good
    if (props.$score >= 60) return '#FFC107'; // Fair
    if (props.$score >= 40) return '#FF9800'; // Poor
    return '#F44336'; // Bad
  }};
`;

const DotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
`;

interface ClimateModalProps {
  roomName: string;
  tempSensor: string;
  humiditySensor?: string;
  aqiSensor?: string;
  co2Sensor?: string;
  tvocSensor?: string;
}

export default function ClimateModal({ 
  roomName, 
  tempSensor, 
  humiditySensor, 
  aqiSensor, 
  co2Sensor, 
  tvocSensor 
}: ClimateModalProps) {
  const { closeModal } = useModal();
  const tempEntity = useEntityState(tempSensor);
  const humidityEntity = useEntityState(humiditySensor || '');
  const aqiEntity = useEntityState(aqiSensor || '');
  const co2Entity = useEntityState(co2Sensor || '');
  const tvocEntity = useEntityState(tvocSensor || '');
  
  const { data: tempHistory, loading: tempLoading, error: tempError } = useEntityHistory(tempSensor, 24);
  const { data: humidityHistory, loading: humidityLoading, error: humidityError } = useEntityHistory(humiditySensor || '', 24);

  const temperature = tempEntity?.state ? Math.round(parseFloat(tempEntity.state)) : '--';
  const humidity = humidityEntity?.state ? Math.round(parseFloat(humidityEntity.state)) : '--';
  const aqiScore = aqiEntity?.state ? Math.round(parseFloat(aqiEntity.state)) : null;
  const co2Value = co2Entity?.state ? Math.round(parseFloat(co2Entity.state)) : null;
  const tvocValue = tvocEntity?.state ? Math.round(parseFloat(tvocEntity.state)) : null;

  return (
    <ModalContent>
      <Header>
        <Title>{roomName} Climate</Title>
        <CloseButton onClick={closeModal}>×</CloseButton>
      </Header>

      <TopSection>
        <SensorBox>
          <SensorHeader>
            <SensorTitle>Temperature</SensorTitle>
            <SensorValue>{temperature}°</SensorValue>
          </SensorHeader>
          <TemperatureChart 
            data={tempHistory} 
            loading={tempLoading} 
            error={tempError}
            unit={tempEntity?.attributes?.unit_of_measurement || '°F'}
          />
        </SensorBox>

        <SensorBox>
          <SensorTitle>Humidity</SensorTitle>
          <SensorValue>{humidity}%</SensorValue>
          <HumidityChart 
            data={humidityHistory} 
            loading={humidityLoading} 
            error={humidityError}
          />
        </SensorBox>
      </TopSection>

      {aqiSensor && aqiScore !== null && (
        <AQISection>
          <AQIHeader>
            <AQITitle>Air Quality Index</AQITitle>
            <AQIScore $score={aqiScore}>{aqiScore}</AQIScore>
          </AQIHeader>
          
          <DotGrid>
            <DotIndicator
              label="Temp"
              value={temperature}
              unit="°"
              sensorType="temperature"
              rawValue={tempEntity?.state ? parseFloat(tempEntity.state) : null}
            />
            <DotIndicator
              label="Humidity"
              value={humidity}
              unit="%"
              sensorType="humidity"
              rawValue={humidityEntity?.state ? parseFloat(humidityEntity.state) : null}
            />
            {co2Sensor && (
              <DotIndicator
                label="CO2"
                value={co2Value}
                unit="ppm"
                sensorType="co2"
                rawValue={co2Value}
              />
            )}
            {tvocSensor && (
              <DotIndicator
                label="TVOCs"
                value={tvocValue}
                unit="ppb"
                sensorType="tvoc"
                rawValue={tvocValue}
              />
            )}
          </DotGrid>
        </AQISection>
      )}
    </ModalContent>
  );
} 