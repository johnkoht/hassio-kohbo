import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const Label = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 10px;
  line-height: 10px;
  font-weight: 500;
  color: #ADB5BD;
`;

const Value = styled.div`
  font-family: 'Poppins', Arial, Helvetica, sans-serif;
  font-size: 14px;
  line-height: 14px;
  font-weight: 400;
  color: #fff;
`;

const Unit = styled.div`
  font-family: 'Poppins', Arial, Helvetica, sans-serif;
  font-size: 10px;
  line-height: 10px;
  font-weight: 500;
  color: #ADB5BD;
`;

const DotContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
`;

const Dot = styled.div<{ $color: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${props => props.$color};
  transition: background-color 0.3s ease;
`;

interface DotIndicatorProps {
  label: string;
  value: number | string | null;
  unit: string;
  sensorType: 'temperature' | 'humidity' | 'co2' | 'tvoc' | 'pm25';
  rawValue: number | null;
}

function getSeverityLevel(sensorType: string, value: number | null): number {
  if (value === null) return 0;

  switch (sensorType) {
    case 'temperature':
      // Awair temperature ranges with dual thresholds
      if (value >= 68 && value <= 77) return 0; // Good - optimal range
      if ((value >= 64.4 && value < 68) || (value > 77 && value <= 80.6)) return 1; // Acceptable
      if ((value >= 60.8 && value < 64.4) || (value > 80.6 && value <= 84.2)) return 2; // Moderate
      if ((value >= 46.4 && value < 60.8) || (value > 84.2 && value <= 93.2)) return 3; // Poor
      return 4; // Hazardous - < 46.4 OR > 93.2
    
    case 'humidity':
      // Awair humidity ranges with dual thresholds
      if (value >= 40 && value <= 50) return 0; // Good - optimal range
      if ((value >= 30 && value < 40) || (value > 50 && value <= 60)) return 1; // Acceptable
      if ((value >= 23 && value < 30) || (value > 60 && value <= 65)) return 2; // Moderate
      if ((value >= 14 && value < 23) || (value > 65 && value <= 80)) return 3; // Poor
      return 4; // Hazardous - < 14 OR > 80
    
    case 'co2':
      // Awair CO2 ranges from official chart
      if (value < 600) return 0; // Good - <500-600 range
      if (value < 1000) return 1; // Acceptable - 600-1000
      if (value < 2000) return 2; // Moderate - 1000-2000
      if (value < 4500) return 3; // Poor - 2000-4500
      return 4; // Hazardous - >4500
    
    case 'tvoc':
      // Awair TVOC ranges from official chart
      if (value < 300) return 0; // Good - 0-300
      if (value < 500) return 1; // Acceptable - 300-500
      if (value < 3000) return 2; // Moderate - 500-3000
      if (value < 25000) return 3; // Poor - 3000-25000
      return 4; // Hazardous - >25000
    
    case 'pm25':
      // Awair PM2.5 ranges from official chart
      if (value <= 12) return 0; // Good - 0-12
      if (value <= 35) return 1; // Acceptable - 12-35
      if (value <= 55) return 2; // Moderate - 35-55
      if (value <= 150) return 3; // Poor - 55-150
      return 4; // Hazardous - >150
    
    default:
      return 0;
  }
}

function getDotColors(severityLevel: number): string[] {
  const colors = ['#6C757D', '#6C757D', '#6C757D', '#6C757D', '#6C757D']; // All gray by default
  
  // Fill from bottom up based on severity level (0-4)
  if (severityLevel >= 0) colors[4] = '#4CAF50'; // Bottom dot - green (good)
  if (severityLevel >= 1) colors[3] = '#FFC107'; // Second from bottom - yellow (acceptable)
  if (severityLevel >= 2) colors[2] = '#FF9500'; // Middle - orange (moderate)
  if (severityLevel >= 3) colors[1] = '#FF2D55'; // Second from top - red (poor)
  if (severityLevel >= 4) colors[0] = '#AF52DE'; // Top dot - purple (hazardous)
  
  return colors;
}

export default function DotIndicator({ label, value, unit, sensorType, rawValue }: DotIndicatorProps) {
  const severityLevel = getSeverityLevel(sensorType, rawValue);
  const dotColors = getDotColors(severityLevel);
  
  const displayValue = value !== null ? `${value}${unit}` : '--';

  return (
    <Container>
      <DotContainer>
        {dotColors.map((color, index) => (
          <Dot key={index} $color={color} />
        ))}
      </DotContainer>
      <Label>{label}</Label>
      <Value>{value}</Value>
      <Unit>{unit}</Unit>
    </Container>
  );
} 