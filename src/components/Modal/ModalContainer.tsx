import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useModal } from '../../contexts/ModalContext';
import LightModal from './LightModal';

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

const ModalWrapper = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
  background: radial-gradient(68.86% 108.57% at 29.04% 31.2%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%), rgba(233, 236, 239, 0.4);
  backdrop-filter: blur(10px);
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  transform: translateX(${props => props.$isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
  z-index: 1001;
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
      default:
        return null;
    }
  };

  return (
    <>
      <Backdrop $isOpen={modalState.isOpen} onClick={handleBackdropClick} />
      <ModalWrapper $isOpen={modalState.isOpen}>
        {modalState.isOpen && renderModalContent()}
      </ModalWrapper>
    </>
  );
} 