import React from 'react';
import styled from 'styled-components';

const IconContainer = styled.div`
  width: 40px;
  height: 35px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  margin-bottom: 21px;
`;

interface DeviceCardIconProps {
  children: React.ReactNode;
}

export default function DeviceCardIcon({ children }: DeviceCardIconProps) {
  return (
    <IconContainer>
      {children}
    </IconContainer>
  );
} 