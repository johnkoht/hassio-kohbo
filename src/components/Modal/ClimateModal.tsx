import React from 'react';
import styled from 'styled-components';
import { useModal } from '../../contexts/ModalContext';
import { useEntityState } from '../../contexts/HassContext';
import { useEntityHistory } from '../../hooks/useEntityHistory';
import TemperatureChart from '../Charts/TemperatureChart';
import HumidityChart from '../Charts/HumidityChart';
import AQIChart from '../Charts/AQIChart';
import DotIndicator from '../DotIndicator/DotIndicator';
import { SensorBox, SensorContent, SensorTitle, SensorValue } from '../../styles/utils/sensors';

const ModalContent = styled.div`
  padding: 70px 45px;
  height: 100%;
  display: flex;
  flex-direction: column;
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

const AQISection = styled(SensorBox)`
  padding: 20px;
  border-radius: 12px;
`;

const AQIHeader = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 40px;
`;

const AQITitle = styled.h3`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #F8F9FA;
  margin: 0;
`;

const AQIScore = styled.div<{ $score: number }>`
  font-family: 'Poppins', Arial, Helvetica, sans-serif;
  font-size: 30px;
  line-height: 30px;
  font-weight: 400;
  color: #F8F9FA;
  margin-bottom: 5px;
`;

const DotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0px;
`;

function getAQIDescription(score: number): string {
  if (score >= 81) return 'Good';
  if (score >= 61) return 'Acceptable';
  if (score >= 41) return 'Moderate';
  if (score >= 21) return 'Poor';
  return 'Hazardous';
}

interface ClimateModalProps {
  roomName: string;
  tempSensor: string;
  humiditySensor?: string;
  aqiSensor?: string;
  co2Sensor?: string;
  tvocSensor?: string;
  pm25Sensor?: string;
}

export default function ClimateModal({ 
  roomName, 
  tempSensor, 
  humiditySensor, 
  aqiSensor, 
  co2Sensor, 
  tvocSensor,
  pm25Sensor 
}: ClimateModalProps) {
  const { closeModal } = useModal();
  const tempEntity = useEntityState(tempSensor);
  const humidityEntity = useEntityState(humiditySensor || '');
  const aqiEntity = useEntityState(aqiSensor || '');
  const co2Entity = useEntityState(co2Sensor || '');
  const tvocEntity = useEntityState(tvocSensor || '');
  const pm25Entity = useEntityState(pm25Sensor || '');
  
  const { data: tempHistory, loading: tempLoading, error: tempError } = useEntityHistory(tempSensor, 24);
  const { data: humidityHistory, loading: humidityLoading, error: humidityError } = useEntityHistory(humiditySensor || '', 24);
  const { data: aqiHistory, loading: aqiLoading, error: aqiError } = useEntityHistory(aqiSensor || '', 24);

  const temperature = tempEntity?.state ? Math.round(parseFloat(tempEntity.state)) : '--';
  const humidity = humidityEntity?.state ? Math.round(parseFloat(humidityEntity.state)) : '--';
  const aqiScore = aqiEntity?.state ? Math.round(parseFloat(aqiEntity.state)) : null;
  const co2Value = co2Entity?.state ? Math.round(parseFloat(co2Entity.state)) : null;
  const tvocValue = tvocEntity?.state ? Math.round(parseFloat(tvocEntity.state)) : null;
  const pm25Value = pm25Entity?.state ? Math.round(parseFloat(pm25Entity.state)) : null;

  return (
    <ModalContent>
      <Header>
        <Title>{roomName} Climate</Title>
        <CloseButton onClick={closeModal}>×</CloseButton>
      </Header>

      <TopSection>
        <SensorBox>
          <SensorContent>
            <SensorValue>{temperature}°</SensorValue>
            <SensorTitle>Temperature</SensorTitle>
          </SensorContent>
          <TemperatureChart 
            data={tempHistory} 
            loading={tempLoading} 
            error={tempError}
            unit={tempEntity?.attributes?.unit_of_measurement || '°F'}
          />
        </SensorBox>

        <SensorBox>
          <SensorContent>
            <SensorValue>{humidity}%</SensorValue>
            <SensorTitle>Humidity</SensorTitle>            
          </SensorContent>
          <HumidityChart 
            data={humidityHistory} 
            loading={humidityLoading} 
            error={humidityError}
          />
        </SensorBox>
      </TopSection>

      {aqiSensor && aqiScore !== null && (
        <SensorBox>
          <SensorContent>
            <AQIHeader>
              <AQIScore $score={aqiScore}>{aqiScore} – {getAQIDescription(aqiScore)}</AQIScore>
              <AQITitle>Air Quality Index</AQITitle>
            </AQIHeader>
            
            <DotGrid>
              <DotIndicator
                label="Temp"
                value={temperature}
                unit="°F"
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
                  label="CO₂"
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
              {pm25Sensor && (
                <DotIndicator
                  label="PM2.5"
                  value={pm25Value}
                  unit="μg/m³"
                  sensorType="pm25"
                  rawValue={pm25Value}
                />
              )}
            </DotGrid>
          </SensorContent>
          <AQIChart 
            data={aqiHistory} 
            loading={aqiLoading} 
            error={aqiError}
          />
        </SensorBox>
      )}
    </ModalContent>
  );
} 