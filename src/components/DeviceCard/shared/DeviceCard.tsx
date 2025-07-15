import React from 'react';
import styled from 'styled-components';

const Card = styled.div<{ $isActive: boolean }>`
  width: 220px;
  height: 150px;
  background: radial-gradient(68.86% 108.57% at 29.04% 31.2%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%), rgba(233, 236, 239, ${props => props.$isActive ? '0.3' : '0.005'});
  backdrop-filter: blur(5px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  /* padding: 30px 20px 25px 20px; */
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  outline: none;
  transform: scale(1);
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  &:hover {
    box-shadow: 0 8px 32px rgba(0,0,0,0.16);
  }
  &:focus {
    outline: none;
  }
  &:active {
    transform: scale(0.98);
  }
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;
  width: 100%;
`;

const Left = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  height: 100%;
  padding: 26px 0 26px 20px;
`;

const Right = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  height: 100%;
  padding: 0;
`;

interface DeviceCardProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

export default function DeviceCard({ children, actions, isActive = true, onClick }: DeviceCardProps) {
  return (
    <Card $isActive={isActive} onClick={onClick}>
      <CardContent>
        <Left>{children}</Left>
        {actions && <Right>{actions}</Right>}
      </CardContent>
    </Card>
  );
} 