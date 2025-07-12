import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useModal } from '../../contexts/ModalContext';
import LightModal from './LightModal';
import ClimateModal from './ClimateModal';
import FanModal from './FanModal';
import SettingsModal, { SettingsGroup } from './SettingsModal';
import { LightScene } from '../DeviceCard/LightCard';

const Backdrop = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(8px);
  z-index: 1000;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const ModalBox = styled.div<{ $isOpen: boolean; $translateX: number }>`
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 460px;
  background: rgba(33, 37, 41, 0.7);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  transform: translateX(${props => {
    if (!props.$isOpen) return '100%';
    return `${props.$translateX}px`;
  }});
  transition: ${props => props.$translateX !== 0 ? 'none' : 'transform 0.3s ease-in-out'};
  z-index: 1000;
  overflow-y: auto;
  touch-action: pan-y; /* Allow vertical scrolling but handle horizontal swipes */
`;

const SwipeHandle = styled.div`
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  width: 4px;
  height: 40px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  z-index: 1001;
  pointer-events: none; /* Don't interfere with clicks */

`;

export default function ModalContainer() {
  const { modalState, closeModal } = useModal();
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalState.isOpen) {
        closeModal();
      }
    };

    if (modalState.isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [modalState.isOpen, closeModal]);

  // Reset translateX when modal closes
  useEffect(() => {
    if (!modalState.isOpen) {
      setTranslateX(0);
      setIsDragging(false);
    }
  }, [modalState.isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Check if touch started in a swipeable area
  const isSwipeableArea = (x: number, y: number): boolean => {
    if (!modalRef.current) return false;
    
    const rect = modalRef.current.getBoundingClientRect();
    const relativeX = x - rect.left;
    
    // Only allow swipes in the left 35px padding area
    return relativeX <= 35;
  };

  // Touch event handlers for swipe-to-dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const isInSwipeArea = isSwipeableArea(touch.clientX, touch.clientY);
    
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    
    // Only start tracking if in swipeable area
    if (!isInSwipeArea) {
      touchStartRef.current = null;
    }
    
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // Only handle horizontal swipes to the right
    // Check if this is more horizontal than vertical movement
    if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0) {
      setIsDragging(true);
      // Only allow positive (rightward) movement
      const clampedDeltaX = Math.max(0, Math.min(deltaX, 460)); // Clamp to modal width
      setTranslateX(clampedDeltaX);
      
      // Prevent default to stop scrolling
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !isDragging) {
      setTranslateX(0);
      setIsDragging(false);
      touchStartRef.current = null;
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaTime = Date.now() - touchStartRef.current.time;
    const velocity = Math.abs(deltaX) / deltaTime; // pixels per ms

    // Close modal if:
    // 1. Swiped more than 1/3 of the modal width, OR
    // 2. Fast swipe (velocity > 0.5 px/ms) and moved more than 50px
    const shouldClose = deltaX > 460 / 3 || (velocity > 0.5 && deltaX > 50);

    if (shouldClose) {
      closeModal();
    } else {
      // Snap back to original position
      setTranslateX(0);
    }

    setIsDragging(false);
    touchStartRef.current = null;
  };

  const renderModalContent = () => {
    console.log('Rendering modal content:', modalState);
    
    switch (modalState.type) {
      case 'light':
        // Parse the entityId to get light info - format: "roomName|light1EntityId:light1Name|light2EntityId:light2Name|...|SCENES|scene1Id:scene1Label:scene1Service:scene1ServiceData|..."
        const allParts = modalState.entityId!.split('|');
        console.log('Parsing light modal data:', allParts);
        const lightRoomName = allParts[0];
        
        // Find the SCENES separator
        const scenesIndex = allParts.indexOf('SCENES');
        console.log('SCENES index:', scenesIndex);
        
        // Parse lights (everything before SCENES or all parts if no SCENES)
        const lightEndIndex = scenesIndex !== -1 ? scenesIndex : allParts.length;
        const lights = allParts.slice(1, lightEndIndex).map(lightPart => {
          const [entityId, name, displayName] = lightPart.split(':');
          return { 
            entityId, 
            name,
            ...(displayName && displayName.trim() !== '' ? { displayName } : {})
          };
        });
        console.log('Parsed lights:', lights);
        
        // Parse scenes (everything after SCENES)
        let scenes: LightScene[] = [];
        if (scenesIndex !== -1) {
          const sceneParts = allParts.slice(scenesIndex + 1);
          console.log('Scene parts:', sceneParts);
          
          scenes = sceneParts.map(scenePart => {
            const [id, label, service, serviceDataStr] = scenePart.split(':');
            let serviceData = {};
            try {
              serviceData = serviceDataStr ? JSON.parse(serviceDataStr) : {};
            } catch (e) {
              console.warn('Failed to parse scene service data:', serviceDataStr);
            }
            
            const scene = {
              id,
              label,
              service,
              serviceData,
              icon: <div>🔆</div> // Placeholder icon - will be replaced by LightModal
            };
            console.log('Parsed scene:', scene);
            return scene;
          });
        }
        console.log('Final scenes array:', scenes);
        
        return <LightModal roomName={lightRoomName} lights={lights} scenes={scenes} />;
      case 'fan':
        // Parse the entityId to get fan info - format: "entityId|name"
        const [fanEntityId, fanName] = modalState.entityId!.split('|');
        console.log('Parsing fan modal data:', { fanEntityId, fanName });
        
        return <FanModal entityId={fanEntityId} name={fanName} />;
      case 'climate':
        // Parse the entityId to get room info - format: "roomName|tempSensor|humiditySensor|aqiSensor|co2Sensor|tvocSensor|pm25Sensor"
        const [climateRoomName, tempSensor, humiditySensor, aqiSensor, co2Sensor, tvocSensor, pm25Sensor] = modalState.entityId!.split('|');
        console.log('Parsed climate modal data:', { climateRoomName, tempSensor, humiditySensor, aqiSensor, co2Sensor, tvocSensor, pm25Sensor });
        
        return (
          <ClimateModal 
            roomName={climateRoomName}
            tempSensor={tempSensor}
            humiditySensor={humiditySensor || undefined}
            aqiSensor={aqiSensor || undefined}
            co2Sensor={co2Sensor || undefined}
            tvocSensor={tvocSensor || undefined}
            pm25Sensor={pm25Sensor || undefined}
          />
        );
      case 'settings':
        // Parse the entityId to get settings info - format: "roomName|settingsGroupsJSON"
        const [settingsRoomName, settingsGroupsJSON] = modalState.entityId!.split('|');
        console.log('Parsing settings modal data:', { settingsRoomName, settingsGroupsJSON });
        
        let settingsGroups: SettingsGroup[] = [];
        try {
          settingsGroups = JSON.parse(decodeURIComponent(settingsGroupsJSON));
        } catch (e) {
          console.error('Failed to parse settings groups:', e);
        }
        
        return <SettingsModal roomName={settingsRoomName} settingsGroups={settingsGroups} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Backdrop $isOpen={modalState.isOpen} onClick={handleBackdropClick} />
      <ModalBox 
        ref={modalRef}
        $isOpen={modalState.isOpen}
        $translateX={translateX}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {modalState.isOpen && (
          <>
            <SwipeHandle />
            {renderModalContent()}
          </>
        )}
      </ModalBox>
    </>
  );
} 