import React, { useEffect, useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

const slideUp = keyframes`
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
`;

const slideDown = keyframes`
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100%);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const Overlay = styled.div<{ $isClosing: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  animation: ${props => props.$isClosing ? fadeOut : fadeIn} 0.3s ease;
`;

const ModalContainer = styled.div<{ $isClosing: boolean; $height?: string }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${props => props.$height || '70vh'};
  max-height: 90vh;
  background: rgba(33, 37, 41, 0.9);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 20px 20px 0 0;
  z-index: 10000;
  animation: ${props => props.$isClosing ? slideDown : slideUp} 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const DragHandle = styled.div`
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  margin: 12px auto;
  cursor: grab;
  transition: all 0.2s ease;
  
  &:active {
    cursor: grabbing;
    background: rgba(255, 255, 255, 0.5);
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px 20px;
  color: white;
  
  /* Custom scrollbar */
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

interface SlidingModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: string;
}

export default function SlidingModal({ isOpen, onClose, children, height }: SlidingModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle modal visibility
  useEffect(() => {
    if (isOpen) {
      setHasBeenOpened(true);
      setIsVisible(true);
      // Small delay to ensure smooth opening animation
      setTimeout(() => {
        setIsClosing(false);
      }, 10);
    } else if (isVisible && hasBeenOpened) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
      }, 420); // Slightly longer than animation
      return () => clearTimeout(timer);
    }
  }, [isOpen, isVisible, hasBeenOpened]);

  // Close modal with animation
  const handleClose = () => {
    onClose();
  };

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible && !isClosing) {
        handleClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isVisible, isClosing]);

  // Touch/mouse drag handlers
  const handleDragStart = (clientY: number) => {
    setStartY(clientY);
    setCurrentY(clientY);
    setIsDragging(true);
  };

  const handleDragMove = (clientY: number) => {
    if (!isDragging) return;
    
    const deltaY = clientY - startY;
    if (deltaY > 0) { // Only allow dragging down
      setCurrentY(clientY);
      if (modalRef.current) {
        modalRef.current.style.transform = `translateY(${deltaY}px)`;
      }
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    const deltaY = currentY - startY;
    setIsDragging(false);
    
    if (modalRef.current) {
      modalRef.current.style.transform = '';
    }
    
    // Close if dragged down more than 100px
    if (deltaY > 100) {
      handleClose();
    }
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleDragMove(e.clientY);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Add global mouse listeners when dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!isVisible || !hasBeenOpened) {
    return null;
  }

  return (
    <Overlay $isClosing={isClosing} onClick={handleOverlayClick}>
      <ModalContainer 
        ref={modalRef}
        $isClosing={isClosing} 
        $height={height}
        onClick={(e) => e.stopPropagation()}
      >
        <DragHandle
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        <Content>
          {children}
        </Content>
      </ModalContainer>
    </Overlay>
  );
} 