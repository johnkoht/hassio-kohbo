import React, { useState } from 'react';
import styled from 'styled-components';
import { useModal } from '../../contexts/ModalContext';
import { useEntityState } from '../../contexts/HassContext';
import { hassApiFetch } from '../../api/hassApiFetch';

const ModalContent = styled.div`
  padding: 40px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
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
  &:hover {
    opacity: 1;
  }
`;

const Section = styled.div`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h3`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 20px 0;
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 20px;
`;

const ToggleLabel = styled.span`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: #fff;
`;

const Toggle = styled.button<{ $isOn: boolean }>`
  width: 60px;
  height: 32px;
  border-radius: 16px;
  border: none;
  background: ${props => props.$isOn ? '#4CAF50' : 'rgba(255, 255, 255, 0.2)'};
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.$isOn ? '30px' : '2px'};
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #fff;
    transition: all 0.3s ease;
  }
`;

const SliderContainer = styled.div`
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const SliderLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const SliderText = styled.span`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
`;

const SliderValue = styled.span`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
    border: none;
  }
`;

const ScenesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
`;

const SceneButton = styled.button<{ $isActive: boolean }>`
  padding: 20px;
  background: ${props => props.$isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #fff;
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

interface LightModalProps {
  entityId: string;
}

const scenes = [
  { id: 'bright', name: 'Bright' },
  { id: 'focus', name: 'Focus' },
  { id: 'relax', name: 'Relax' },
  { id: 'dim', name: 'Dim' },
];

export default function LightModal({ entityId }: LightModalProps) {
  const { closeModal } = useModal();
  const entity = useEntityState(entityId);
  const [brightness, setBrightness] = useState(
    entity?.attributes?.brightness ? Math.round(entity.attributes.brightness / 2.55) : 100
  );
  const [activeScene, setActiveScene] = useState<string | null>(null);

  const isOn = entity?.state === 'on';

  const handleToggle = async () => {
    try {
      await hassApiFetch(`/api/services/light/turn_${isOn ? 'off' : 'on'}`, {
        method: 'POST',
        body: JSON.stringify({ entity_id: entityId }),
      });
    } catch (error) {
      console.error('Failed to toggle light:', error);
    }
  };

  const handleBrightnessChange = async (value: number) => {
    setBrightness(value);
    try {
      await hassApiFetch('/api/services/light/turn_on', {
        method: 'POST',
        body: JSON.stringify({
          entity_id: entityId,
          brightness_pct: value,
        }),
      });
    } catch (error) {
      console.error('Failed to set brightness:', error);
    }
  };

  const handleSceneSelect = async (sceneId: string) => {
    setActiveScene(sceneId);
    // TODO: Implement scene activation based on your Home Assistant setup
    console.log('Scene selected:', sceneId);
  };

  return (
    <ModalContent>
      <Header>
        <Title>{entity?.attributes?.friendly_name || 'Light'}</Title>
        <CloseButton onClick={closeModal}>×</CloseButton>
      </Header>

      <Section>
        <ToggleContainer>
          <ToggleLabel>Power</ToggleLabel>
          <Toggle $isOn={isOn} onClick={handleToggle} />
        </ToggleContainer>
      </Section>

      <Section>
        <SectionTitle>Brightness</SectionTitle>
        <SliderContainer>
          <SliderLabel>
            <SliderText>Brightness</SliderText>
            <SliderValue>{brightness}%</SliderValue>
          </SliderLabel>
          <Slider
            type="range"
            min="1"
            max="100"
            value={brightness}
            onChange={(e) => handleBrightnessChange(parseInt(e.target.value))}
            disabled={!isOn}
          />
        </SliderContainer>
      </Section>

      <Section>
        <SectionTitle>Scenes</SectionTitle>
        <ScenesGrid>
          {scenes.map((scene) => (
            <SceneButton
              key={scene.id}
              $isActive={activeScene === scene.id}
              onClick={() => handleSceneSelect(scene.id)}
            >
              {scene.name}
            </SceneButton>
          ))}
        </ScenesGrid>
      </Section>
    </ModalContent>
  );
} 