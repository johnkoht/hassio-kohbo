import React from 'react';
import styled from 'styled-components';
import ellipsisIcon from '../../assets/device_icons/ellipsis.svg';

const IconContainer = styled.div`
  width: 40px;
  height: 35px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  margin-bottom: 21px;
`;

const Card = styled.div<{ $isActive: boolean }>`
  width: 220px;
  height: 150px;
  background: radial-gradient(68.86% 108.57% at 29.04% 31.2%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%), rgba(233, 236, 239, ${props => props.$isActive ? '0.4' : '0.005'});  
  backdrop-filter: blur(5px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 30px 20px;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  outline: none;
  transform: scale(1);
  
  /* Disable mobile tap highlights */
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
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    background: radial-gradient(68.86% 108.57% at 29.04% 31.2%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%), rgba(233, 236, 239, ${props => props.$isActive ? '0.25' : '0.008'});
  }
`;

const Icon = styled.img`
  height: 35px;
  width: auto;
  display: block;
`;

const Name = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 15px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 4px;
`;

const State = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #CED4DA;
`;

const MoreOptions = styled.button`
  position: absolute;
  top: 24px;
  right: 16px;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  opacity: 0.7;
  &:hover {
    opacity: 1;
  }
`;

interface DeviceCardProps {
  icon: React.ReactNode;
  name: string;
  state: string; // Main status text, e.g. 'On – 75%'
  isActive?: boolean; // Whether the device is active/on (affects background opacity)
  onClick?: () => void;
  onMoreOptions?: () => void;
}


export default function DeviceCard({ icon, name, state, isActive = true, onClick, onMoreOptions }: DeviceCardProps) {
  return (
    <Card $isActive={isActive} onClick={onClick}>
      <IconContainer>
        {icon}
      </IconContainer>
      <Name>{name}</Name>
      <State>{state}</State>
      <MoreOptions onClick={e => { e.stopPropagation(); onMoreOptions && onMoreOptions(); }}>
        <img src={ellipsisIcon} alt="More Options" />
      </MoreOptions>
    </Card>
  );
} 