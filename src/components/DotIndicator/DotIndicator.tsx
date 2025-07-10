import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const Label = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #CED4DA;
`;

const Value = styled.div`
  font-family: 'Poppins', Arial, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
`;

const DotContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Dot = styled.div<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.$color};
  transition: background-color 0.3s ease;
`;

interface DotIndicatorProps {
  label: string;
  value: number | string | null;
  unit: string;
  sensorType: 'temperature' | 'humidity' | 'co2' | 'tvoc';
  rawValue: number | null;
}

function getSeverityLevel(sensorType: string, value: number | null): number {
  if (value === null) return 0;

  switch (sensorType) {
    case 'temperature':
      // Comfort zone 70-75°F (ideal = 0, getting worse = higher level)
      if (value >= 70 && value <= 75) return 0; // Perfect
      if (value >= 68 && value <= 77) return 1; // Good
      if (value >= 65 && value <= 80) return 2; // Fair
      if (value >= 60 && value <= 85) return 3; // Poor
      return 4; // Terrible
    
    case 'humidity':
      // Ideal 40-60%
      if (value >= 45 && value <= 55) return 0; // Perfect
      if (value >= 40 && value <= 60) return 1; // Good
      if (value >= 35 && value <= 65) return 2; // Fair
      if (value >= 30 && value <= 70) return 3; // Poor
      return 4; // Terrible
    
    case 'co2':
      // CO2 levels in ppm
      if (value < 400) return 0; // Perfect
      if (value < 600) return 1; // Good
      if (value < 1000) return 2; // Fair
      if (value < 2000) return 3; // Poor
      return 4; // Terrible
    
    case 'tvoc':
      // TVOC levels in ppb
      if (value < 50) return 0; // Perfect
      if (value < 100) return 1; // Good
      if (value < 300) return 2; // Fair
      if (value < 1000) return 3; // Poor
      return 4; // Terrible
    
    default:
      return 0;
  }
}

function getDotColors(severityLevel: number): string[] {
  const colors = ['#6C757D', '#6C757D', '#6C757D', '#6C757D', '#6C757D']; // All gray by default
  
  // Fill from bottom up based on severity level
  if (severityLevel >= 1) colors[4] = '#4CAF50'; // Bottom dot - green (good)
  if (severityLevel >= 2) colors[3] = '#FFC107'; // Second from bottom - yellow (fair)
  if (severityLevel >= 3) colors[2] = '#FF9800'; // Middle - orange (poor)
  if (severityLevel >= 4) colors[1] = '#F44336'; // Second from top - red (bad)
  if (severityLevel >= 5) colors[0] = '#9C27B0'; // Top dot - purple (terrible)
  
  return colors;
}

export default function DotIndicator({ label, value, unit, sensorType, rawValue }: DotIndicatorProps) {
  const severityLevel = getSeverityLevel(sensorType, rawValue);
  const dotColors = getDotColors(severityLevel);
  
  const displayValue = value !== null ? `${value}${unit}` : '--';

  return (
    <Container>
      <Label>{label}</Label>
      <Value>{displayValue}</Value>
      <DotContainer>
        {dotColors.map((color, index) => (
          <Dot key={index} $color={color} />
        ))}
      </DotContainer>
    </Container>
  );
} 