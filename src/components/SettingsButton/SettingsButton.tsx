import React from 'react';
import styled from 'styled-components';
import { useModal } from '../../contexts/ModalContext';
import { SettingsGroup } from '../Modal/SettingsModal';
import { ReactComponent as SettingsIcon } from '../../assets/utils/settings.svg';

const ButtonContainer = styled.button`
  position: absolute;
  bottom: 100px;
  left: 60px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:active {
    transform: translateY(0);
  }
`;

const ButtonText = styled.span`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 16px;
  line-height: 20px;
  font-weight: 500;
  color: #fff;
`;

const StyledSettingsIcon = styled(SettingsIcon)`
  width: 19px;
  height: 20px;
  fill: #fff;
`;

interface SettingsButtonProps {
  roomName: string;
  settingsGroups: SettingsGroup[];
}

export default function SettingsButton({ roomName, settingsGroups }: SettingsButtonProps) {
  const { openModal } = useModal();

  const handleClick = () => {
    // Encode the settings groups as JSON in the entityId
    const settingsGroupsJSON = encodeURIComponent(JSON.stringify(settingsGroups));
    const modalEntityId = `${roomName}|${settingsGroupsJSON}`;
    
    console.log('Opening settings modal with:', { roomName, settingsGroups, modalEntityId });
    openModal('settings', modalEntityId);
  };

  return (
    <ButtonContainer onClick={handleClick}>
      <StyledSettingsIcon />
      <ButtonText>Settings</ButtonText>
    </ButtonContainer>
  );
} 