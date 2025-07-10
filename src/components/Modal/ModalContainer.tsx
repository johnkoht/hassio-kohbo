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
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
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
    switch (modalState.type) {
      case 'light':
        return <LightModal entityId={modalState.entityId!} />;
      case 'fan':
        // TODO: Implement FanModal
        return <div>Fan Modal Coming Soon</div>;
      case 'climate':
        // Parse the entityId to get room info - format: "roomName|tempSensor|humiditySensor|aqiSensor|co2Sensor|tvocSensor"
        const [roomName, tempSensor, humiditySensor, aqiSensor, co2Sensor, tvocSensor] = modalState.entityId!.split('|');
        return (
          <ClimateModal 
            roomName={roomName}
            tempSensor={tempSensor}
            humiditySensor={humiditySensor || undefined}
            aqiSensor={aqiSensor || undefined}
            co2Sensor={co2Sensor || undefined}
            tvocSensor={tvocSensor || undefined}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Backdrop $isOpen={modalState.isOpen} onClick={handleBackdropClick} />
      <ModalBox $isOpen={modalState.isOpen}>
        {modalState.isOpen && renderModalContent()}
      </ModalBox>
    </>
  );
} 