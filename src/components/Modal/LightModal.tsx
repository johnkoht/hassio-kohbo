import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import useEmblaCarousel from 'embla-carousel-react';
import { useModal } from '../../contexts/ModalContext';
import { useEntityState } from '../../contexts/HassContext';
import { hassApiFetch } from '../../api/hassApiFetch';
import VerticalSlider from '../VerticalSlider/VerticalSlider';
import ActionGrid, { ActionItem } from '../ActionGrid/ActionGrid';
import ModalHeader from './shared/ModalHeader';
import { ReactComponent as LightIcon } from '../../assets/device_icons/light.svg';
import { ReactComponent as LampIcon } from '../../assets/device_icons/lamp.svg';
import { ReactComponent as LightstripIcon } from '../../assets/device_icons/shelf_lights.svg';
import { ReactComponent as PowerIcon } from '../../assets/utils/power.svg';
import { ReactComponent as BrightIcon } from '../../assets/utils/lights_bright.svg';
import { ReactComponent as DimmedIcon } from '../../assets/utils/lights_dimmed.svg';
import { ReactComponent as NightlightIcon } from '../../assets/utils/lights_nightlight.svg';
import { LightScene } from '../DeviceCard/LightCard';

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
  padding: 35px;
  height: 100%;
  display: flex;
  flex-direction: column;
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
`;

const Thumbnail = styled.button<{ $isActive: boolean; $isOn?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  background: ${props => props.$isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 60px;
`;

const ThumbnailLabel = styled.span`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  text-align: center;
  line-height: 12px;
`;

const Section = styled.div`
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
`;

const PowerButton = styled.button<{ $isOn: boolean }>`
  width: 34px;
  height: 34px;
  border-radius: 17px;
  border: none;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 16px;
    height: 16px;
    fill: ${props => props.$isOn ? '#4CAF50' : '#fff'};
    transition: fill 0.3s ease;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;



const BrightnessContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BrightnessValue = styled.div`
  font-family: 'Poppins', Arial, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  text-align: center;
  color: #fff;
  background: #6C757D;
  border-radius: 11px;
  height: 22px;
  width: 44px;
`;

interface LightEntity {
  entityId: string;
  name: string;
  displayName?: string; // Optional display name for UI - falls back to name if not provided
}

interface LightModalProps {
  roomName: string;
  lights: LightEntity[];
  scenes?: LightScene[];
}

// Default scenes for backwards compatibility
const defaultLightScenes: ActionItem[] = [
  { id: 'bright', label: 'Bright White', icon: <BrightIcon /> },
  { id: 'dimmed', label: 'Dimmed', icon: <DimmedIcon /> },
  { id: 'nightlight', label: 'Nightlight', icon: <NightlightIcon /> },
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

// Helper function to get appropriate icon for scene
function getSceneIcon(sceneId: string) {
  switch (sceneId) {
    case 'bright':
      return <BrightIcon />;
    case 'dimmed':
      return <DimmedIcon />;
    case 'nightlight':
      return <NightlightIcon />;
    default:
      return <div>🔆</div>; // Fallback icon
  }
}

export default function LightModal({ roomName, lights, scenes }: LightModalProps) {
  const { closeModal } = useModal();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [isUpdatingBrightness, setIsUpdatingBrightness] = useState(false);
  const [activeScene, setActiveScene] = useState<string | null>(null);

  // Debug logging
  React.useEffect(() => {
    console.log('LightModal mounted with:');
    console.log('- roomName:', roomName);
    console.log('- lights:', lights);
    console.log('- scenes:', scenes);
  }, [roomName, lights, scenes]);

  // Get all light entities using our custom hook
  const entityStates = useMultipleEntityStates(lights.map(light => light.entityId));

  // Create entities array with proper hook results
  const lightEntities = lights.map((light, index) => ({
    ...light,
    entity: entityStates[index]
  }));

  // Create slides data - each light entity becomes a slide
  const slides = lightEntities;

  // Convert scenes to ActionItems, fallback to default if no scenes provided
  const sceneActions: ActionItem[] = scenes && scenes.length > 0 
    ? scenes.map(scene => ({
        id: scene.id,
        label: scene.label,
        icon: getSceneIcon(scene.id)
      }))
    : defaultLightScenes;

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
  const currentLight = slides[selectedIndex];

  // Determine if current light is on
  const isOn = currentLight?.entity?.state === 'on';

  // Update brightness when slide changes or entity state changes
  React.useEffect(() => {
    // Don't update brightness if we're in the middle of an optimistic update
    if (isUpdatingBrightness) return;

    if (currentLight?.entity?.state === 'on' && currentLight?.entity?.attributes?.brightness) {
      const newBrightness = Math.round(currentLight.entity.attributes.brightness / 2.55);
      setBrightness(newBrightness);
    } else if (currentLight?.entity?.state === 'off') {
      setBrightness(0);
    } else {
      setBrightness(100);
    }
  }, [selectedIndex, currentLight, isUpdatingBrightness]);

  const handleToggle = async () => {
    try {
      // Toggle current light (including group entities)
      const action = currentLight?.entity?.state === 'on' ? 'turn_off' : 'turn_on';
      await hassApiFetch(`/api/services/light/${action}`, {
        method: 'POST',
        body: JSON.stringify({ entity_id: currentLight?.entityId }),
      });
    } catch (error) {
      console.error('Failed to toggle light:', error);
    }
  };

  const handleBrightnessChange = useCallback((value: number) => {
    // Don't update parent state during dragging - let VerticalSlider handle display
    // This prevents lag during fast dragging
  }, []);

  const handleBrightnessRelease = useCallback(async (value: number) => {
    // Update parent state with final value
    setBrightness(value);
    
    // Set updating flag to prevent state conflicts
    setIsUpdatingBrightness(true);
    
    try {
      // Set brightness for current light (including group entities)
      await hassApiFetch('/api/services/light/turn_on', {
        method: 'POST',
        body: JSON.stringify({
          entity_id: currentLight?.entityId,
          brightness_pct: value,
        }),
      });
      
      // Clear the updating flag after a delay to allow Home Assistant to update
      setTimeout(() => {
        setIsUpdatingBrightness(false);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to set brightness:', error);
      // Clear updating flag on error
      setIsUpdatingBrightness(false);
    }
  }, [currentLight]);

  const handleSceneSelect = async (sceneId: string) => {
    console.log('Scene selected:', sceneId);
    console.log('Available scenes:', scenes);
    console.log('Current light:', currentLight);
    
    setActiveScene(sceneId);
    
    // Find the scene configuration
    const selectedScene = scenes?.find(scene => scene.id === sceneId);
    console.log('Selected scene:', selectedScene);
    
    if (selectedScene && selectedScene.service) {
      try {
        const serviceCall = {
          entity_id: currentLight?.entityId,
          ...selectedScene.serviceData
        };
        console.log('Making service call to:', `/api/services/${selectedScene.service}`, serviceCall);
        
        // Use the scene's service and service data
        await hassApiFetch(`/api/services/${selectedScene.service}`, {
          method: 'POST',
          body: JSON.stringify(serviceCall),
        });
        
        console.log('Scene activated successfully');
      } catch (error) {
        console.error('Failed to activate scene:', error);
      }
    } else {
      // Fallback to default scene behavior for backwards compatibility
      console.log('Scene selected (default behavior):', sceneId);
      console.log('No scene configuration found or no service defined');
      // TODO: Implement default scene behavior based on sceneId
    }
  };

  const getSlideTitle = () => {
    // Use displayName if provided, otherwise fall back to name
    const displayName = currentLight?.displayName || currentLight?.name || 'Light';
    return displayName;
  };

  // Use current brightness value for slider
  const sliderValue = brightness;

  const renderSlideContent = () => (
    <>

      <Section>
        <BrightnessValue>{isOn ? `${brightness}%` : 'Off'}</BrightnessValue>
        <BrightnessContainer>
          <VerticalSlider
            value={sliderValue}
            onChange={handleBrightnessChange}
            onRelease={handleBrightnessRelease}
            hideHandle={!isOn}
          />
        </BrightnessContainer>
        <PowerButton $isOn={isOn} onClick={handleToggle}>
          <PowerIcon />
        </PowerButton>
      </Section>

      <Section>
        <ActionGrid
          actions={sceneActions}
          activeAction={activeScene}
          onActionSelect={handleSceneSelect}
        />
      </Section>
    </>
  );

  return (
    <ModalContent>
      <ModalHeader 
        title={getSlideTitle()}
        centered={true}
        marginBottom="20px"
      />

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
            {lightEntities.map((light, index) => (
              <Thumbnail
                key={light.entityId}
                $isActive={selectedIndex === index}
                $isOn={light.entity?.state === 'on'}
                onClick={() => scrollTo(index)}
              >
                <ThumbnailLabel>{light.displayName || light.name}</ThumbnailLabel>
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