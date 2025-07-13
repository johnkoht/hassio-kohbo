import React from 'react';
import styled from 'styled-components';
import { useModal } from '../../contexts/ModalContext';
import { useEntityState } from '../../contexts/HassContext';
import { hassApiFetch } from '../../api/hassApiFetch';
import ModalHeader from './shared/ModalHeader';
import { SensorBox, SensorContent } from '../../styles/utils/sensors';

const ModalContent = styled.div`
  padding: 35px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ScrollContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;

const SettingsGroup = styled.div`
  margin-bottom: 50px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const GroupTitle = styled.h3`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 15px 0;
  text-transform: capitalize;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingLabel = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  margin-bottom: 4px;
`;

const SettingDescription = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.3;
  max-width: 280px;
`;

const SettingState = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
`;

const Toggle = styled.button<{ $isOn: boolean }>`
  width: 50px;
  height: 28px;
  border-radius: 14px;
  border: none;
  background: ${props => props.$isOn ? '#4CAF50' : 'rgba(255, 255, 255, 0.3)'};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.$isOn ? '24px' : '2px'};
    width: 24px;
    height: 24px;
    border-radius: 12px;
    background: white;
    transition: all 0.3s ease;
  }
  
  &:hover {
    background: ${props => props.$isOn ? '#45a049' : 'rgba(255, 255, 255, 0.4)'};
  }
`;

export interface SettingItem {
  id: string;
  label: string;
  description?: string;
  entityId: string;
  entityType: 'input_boolean' | 'automation' | 'switch' | 'binary_sensor';
}

export interface SettingsGroup {
  id: string;
  label: string;
  items: SettingItem[];
}

interface SettingsModalProps {
  roomName: string;
  settingsGroups: SettingsGroup[];
}

export default function SettingsModal({ roomName, settingsGroups }: SettingsModalProps) {
  const { closeModal } = useModal();

  const handleToggle = async (item: SettingItem) => {
    try {
      // Get current entity state
      const currentState = await fetch(`/api/states/${item.entityId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_HASS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }).then(res => res.json());

      const isCurrentlyOn = currentState.state === 'on';
      const newState = isCurrentlyOn ? 'off' : 'on';

      // Determine the service to call based on entity type
      let service = '';
      switch (item.entityType) {
        case 'input_boolean':
          service = `input_boolean/turn_${newState}`;
          break;
        case 'automation':
          service = `automation/turn_${newState}`;
          break;
        case 'switch':
          service = `switch/turn_${newState}`;
          break;
        default:
          console.warn(`Unsupported entity type: ${item.entityType}`);
          return;
      }

      await hassApiFetch(`/api/services/${service}`, {
        method: 'POST',
        body: JSON.stringify({ entity_id: item.entityId }),
      });

      console.log(`Toggled ${item.label} (${item.entityId}) to ${newState}`);
    } catch (error) {
      console.error(`Failed to toggle ${item.label}:`, error);
    }
  };

  return (
    <ModalContent>
      <ModalHeader 
        title={`${roomName} Settings`}
        onClose={closeModal}
        centered={true}
        marginBottom="40px"
      />

      <ScrollContainer>
        {settingsGroups.map(group => (
          <SettingsGroup key={group.id}>
            <GroupTitle>{group.label}</GroupTitle>
            <SensorBox>
              <SensorContent>
                {group.items.map(item => (
                  <SettingItemComponent
                    key={item.id}
                    item={item}
                    onToggle={() => handleToggle(item)}
                  />
                ))}
              </SensorContent>
          </SensorBox>
          </SettingsGroup>
        ))}
      </ScrollContainer>
    </ModalContent>
  );
}

// Separate component for each setting item to manage individual state
function SettingItemComponent({ item, onToggle }: { item: SettingItem; onToggle: () => void }) {
  const entity = useEntityState(item.entityId);
  const isOn = entity?.state === 'on';

  return (
    <SettingItem>
      <SettingInfo>
        <SettingLabel>{item.label}</SettingLabel>
        {item.description && (
          <SettingDescription>{item.description}</SettingDescription>
        )}
      </SettingInfo>
      <Toggle $isOn={isOn} onClick={onToggle} />
    </SettingItem>
  );
} 