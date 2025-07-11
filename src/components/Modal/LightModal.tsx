import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import useEmblaCarousel from 'embla-carousel-react';
import { useModal } from '../../contexts/ModalContext';
import { useEntityState } from '../../contexts/HassContext';
import { hassApiFetch } from '../../api/hassApiFetch';
import { ReactComponent as LightIcon } from '../../assets/device_icons/light.svg';
import { ReactComponent as LampIcon } from '../../assets/device_icons/lamp.svg';
import { ReactComponent as LightstripIcon } from '../../assets/device_icons/shelf_lights.svg';

// Custom hook to handle multiple entity states
function useMultipleEntityStates(entityIds: string[]) {
  const entities = [];
  for (let i = 0; i < Math.min(entityIds.length, 10); i++) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    entities.push(useEntityState(entityIds[i] || ''));
  }
  return entities;
}

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

const CarouselContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

const EmblaViewport = styled.div`
  overflow: hidden;
  flex: 1;
`;

const EmblaContainer = styled.div`
  display: flex;
  height: 100%;
`;

const EmblaSlide = styled.div`
  flex: 0 0 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ThumbnailContainer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const Thumbnail = styled.button<{ $isActive: boolean; $isOn?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  background: ${props => props.$isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 60px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  svg {
    width: 20px;
    height: 20px;
    fill: ${props => props.$isOn ? '#4CAF50' : '#fff'};
    opacity: ${props => props.$isOn ? 1 : 0.6};
  }
`;

const ThumbnailLabel = styled.span`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 10px;
  font-weight: 500;
  color: #fff;
  text-align: center;
  line-height: 1.2;
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

interface LightEntity {
  entityId: string;
  name: string;
}

interface LightModalProps {
  roomName: string;
  lights: LightEntity[];
}

const scenes = [
  { id: 'bright', name: 'Bright' },
  { id: 'focus', name: 'Focus' },
  { id: 'relax', name: 'Relax' },
  { id: 'dim', name: 'Dim' },
];

// Helper function to get light icon based on name
function getLightIconByName(name: string) {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('ceiling') || nameLower.includes('overhead')) {
    return <LightIcon />;
  }
  if (nameLower.includes('lamp') || nameLower.includes('desk')) {
    return <LampIcon />;
  }
  if (nameLower.includes('strip') || nameLower.includes('shelf') || nameLower.includes('shelves')) {
    return <LightstripIcon />;
  }
  return <LightIcon />;
}

export default function LightModal({ roomName, lights }: LightModalProps) {
  const { closeModal } = useModal();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [activeScene, setActiveScene] = useState<string | null>(null);

  // Get all light entities using our custom hook
  const entityStates = useMultipleEntityStates(lights.map(light => light.entityId));

  // Create entities array with proper hook results
  const lightEntities = lights.map((light, index) => ({
    ...light,
    entity: entityStates[index]
  }));

  // Create slides data (All Lights + individual lights)
  const slides = [
    { type: 'all', name: 'All Lights', lights: lightEntities },
    ...lightEntities.map(light => ({ type: 'single', name: light.name, light }))
  ];

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  // Get current slide data
  const currentSlide = slides[selectedIndex];
  const isAllLights = currentSlide?.type === 'all';
  const currentLight = isAllLights ? null : (currentSlide as any)?.light;

  // For "All Lights" slide, determine if all lights are on
  const getAllLightsStatus = () => {
    if (!isAllLights) return null;
    
    const onLights = lightEntities.filter(light => light.entity?.state === 'on');
    return {
      allOn: onLights.length === lightEntities.length,
      someOn: onLights.length > 0,
      entities: onLights
    };
  };

  const allLightsStatus = getAllLightsStatus();

  // Determine if current light(s) are on
  const isOn = isAllLights 
    ? allLightsStatus?.someOn || false
    : currentLight?.entity?.state === 'on';

  // Update brightness when slide changes
  React.useEffect(() => {
    if (isAllLights) {
      // For all lights, use average brightness or default
      const onLights = lightEntities.filter(light => light.entity?.state === 'on');
      if (onLights.length > 0) {
        const avgBrightness = onLights.reduce((sum, light) => 
          sum + (light.entity?.attributes?.brightness ? Math.round(light.entity.attributes.brightness / 2.55) : 100), 0
        ) / onLights.length;
        setBrightness(Math.round(avgBrightness));
      } else {
        setBrightness(100);
      }
    } else if (currentLight?.entity?.attributes?.brightness) {
      setBrightness(Math.round(currentLight.entity.attributes.brightness / 2.55));
    } else {
      setBrightness(100);
    }
  }, [selectedIndex, currentLight, lightEntities, isAllLights]);

  const handleToggle = async () => {
    try {
      if (isAllLights) {
        // Toggle all lights
        const action = allLightsStatus?.allOn ? 'turn_off' : 'turn_on';
        await Promise.all(
          lightEntities.map(light =>
            hassApiFetch(`/api/services/light/${action}`, {
              method: 'POST',
              body: JSON.stringify({ entity_id: light.entityId }),
            })
          )
        );
      } else {
        // Toggle single light
        const action = currentLight?.entity?.state === 'on' ? 'turn_off' : 'turn_on';
        await hassApiFetch(`/api/services/light/${action}`, {
          method: 'POST',
          body: JSON.stringify({ entity_id: currentLight?.entityId }),
        });
      }
    } catch (error) {
      console.error('Failed to toggle light:', error);
    }
  };

  const handleBrightnessChange = async (value: number) => {
    setBrightness(value);
    try {
      if (isAllLights) {
        // Set brightness for all lights
        await Promise.all(
          lightEntities.map(light =>
            hassApiFetch('/api/services/light/turn_on', {
              method: 'POST',
              body: JSON.stringify({
                entity_id: light.entityId,
                brightness_pct: value,
              }),
            })
          )
        );
      } else {
        // Set brightness for single light
        await hassApiFetch('/api/services/light/turn_on', {
          method: 'POST',
          body: JSON.stringify({
            entity_id: currentLight?.entityId,
            brightness_pct: value,
          }),
        });
      }
    } catch (error) {
      console.error('Failed to set brightness:', error);
    }
  };

  const handleSceneSelect = async (sceneId: string) => {
    setActiveScene(sceneId);
    // TODO: Implement scene activation based on your Home Assistant setup
    console.log('Scene selected:', sceneId);
  };

  const getSlideTitle = () => {
    if (lights.length === 1) {
      return lights[0].name;
    }
    if (isAllLights) {
      return 'All Lights';
    }
    return currentLight?.name || 'Light';
  };

  const renderSlideContent = () => (
    <>
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
    </>
  );

  return (
    <ModalContent>
      <Header>
        <Title>{getSlideTitle()}</Title>
        <CloseButton onClick={closeModal}>×</CloseButton>
      </Header>

      {lights.length > 1 ? (
        <CarouselContainer>
          <EmblaViewport ref={emblaRef}>
            <EmblaContainer>
              {slides.map((slide, index) => (
                <EmblaSlide key={index}>
                  {renderSlideContent()}
                </EmblaSlide>
              ))}
            </EmblaContainer>
          </EmblaViewport>

          <ThumbnailContainer>
            <Thumbnail
              $isActive={selectedIndex === 0}
              $isOn={allLightsStatus?.someOn}
              onClick={() => scrollTo(0)}
            >
              <LightIcon />
              <ThumbnailLabel>All</ThumbnailLabel>
            </Thumbnail>
            {lightEntities.map((light, index) => (
              <Thumbnail
                key={light.entityId}
                $isActive={selectedIndex === index + 1}
                $isOn={light.entity?.state === 'on'}
                onClick={() => scrollTo(index + 1)}
              >
                {getLightIconByName(light.name)}
                <ThumbnailLabel>{light.name}</ThumbnailLabel>
              </Thumbnail>
            ))}
          </ThumbnailContainer>
        </CarouselContainer>
      ) : (
        <CarouselContainer>
          {renderSlideContent()}
        </CarouselContainer>
      )}
    </ModalContent>
  );
} 