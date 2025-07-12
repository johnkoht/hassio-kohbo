import React from 'react';
import styled from 'styled-components';
import { FloorType } from '../../contexts/NavigationContext';
import { floorLabels } from '../../data/roomsData';

const NavigationContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const FloorPill = styled.button<{ $isActive: boolean }>`
  background: ${props => props.$isActive 
    ? 'rgba(255, 255, 255, 0.2)' 
    : 'rgba(255, 255, 255, 0.1)'
  };
  border: 1px solid ${props => props.$isActive 
    ? 'rgba(255, 255, 255, 0.3)' 
    : 'rgba(255, 255, 255, 0.15)'
  };
  color: ${props => props.$isActive ? '#fff' : 'rgba(255, 255, 255, 0.8)'};
  padding: 8px 16px;
  border-radius: 20px;
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: ${props => props.$isActive 
      ? 'rgba(255, 255, 255, 0.25)' 
      : 'rgba(255, 255, 255, 0.15)'
    };
    border-color: ${props => props.$isActive 
      ? 'rgba(255, 255, 255, 0.4)' 
      : 'rgba(255, 255, 255, 0.2)'
    };
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

interface FloorNavigationProps {
  currentFloor: FloorType;
  onFloorChange: (floor: FloorType) => void;
}

const floors: FloorType[] = ['main', 'upper', 'lower', 'exterior', 'laundry'];

export default function FloorNavigation({ currentFloor, onFloorChange }: FloorNavigationProps) {
  return (
    <NavigationContainer>
      {floors.map(floor => (
        <FloorPill
          key={floor}
          $isActive={currentFloor === floor}
          onClick={() => onFloorChange(floor)}
        >
          {floorLabels[floor]}
        </FloorPill>
      ))}
    </NavigationContainer>
  );
} 