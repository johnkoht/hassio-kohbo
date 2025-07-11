import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useModal } from '../../contexts/ModalContext';
import LightModal from './LightModal';
import ClimateModal from './ClimateModal';

const Backdrop = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  z-index: 1000;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const ModalBox = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 460px;
  background: rgba(33, 37, 41, 0.7);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  transform: translateX(${props => props.$isOpen ? '0' : '100%'});
  transition: transform 0.3s ease-in-out;
  z-index: 1000;
  overflow-y: auto;
`;

export default function ModalContainer() {
  const { modalState, closeModal } = useModal();

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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const renderModalContent = () => {
    console.log('Rendering modal content:', modalState);
    
    switch (modalState.type) {
      case 'light':
        // Parse the entityId to get light info - format: "roomName|light1EntityId:light1Name|light2EntityId:light2Name|..."
        const lightParts = modalState.entityId!.split('|');
        const lightRoomName = lightParts[0];
        const lights = lightParts.slice(1).map(lightPart => {
          const [entityId, name] = lightPart.split(':');
          return { entityId, name };
        });
        
        return <LightModal roomName={lightRoomName} lights={lights} />;
      case 'fan':
        // TODO: Implement FanModal
        return <div>Fan Modal Coming Soon</div>;
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
      default:
        return null;
    }
  };

  return (
    <>
      {/* <Backdrop $isOpen={modalState.isOpen} onClick={handleBackdropClick} /> */}
      <ModalBox $isOpen={modalState.isOpen}>
        {modalState.isOpen && renderModalContent()}
      </ModalBox>
    </>
  );
} 