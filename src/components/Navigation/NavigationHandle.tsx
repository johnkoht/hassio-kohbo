import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { useNavigation } from '../../contexts/NavigationContext';

const HandleContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  touch-action: pan-y;
  
  &:hover {
    background: rgba(0, 0, 0, 0.4);
  }
`;

const Handle = styled.div`
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 2px;
  transition: all 0.2s ease;
  
  ${HandleContainer}:hover & {
    background: rgba(255, 255, 255, 0.6);
    width: 60px;
  }
`;

const SwipeIndicator = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  opacity: ${props => props.$isVisible ? 1 : 0};
  visibility: ${props => props.$isVisible ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  pointer-events: none;
  white-space: nowrap;
`;

export default function NavigationHandle() {
  const { navigationState, openNavigation } = useNavigation();
  const [showIndicator, setShowIndicator] = useState(false);
  const touchStartRef = useRef<{ y: number; time: number } | null>(null);

  // Don't show handle if navigation is open
  if (navigationState.isOpen) {
    return null;
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      y: touch.clientY,
      time: Date.now()
    };
    setShowIndicator(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    const deltaY = touchStartRef.current.y - touch.clientY; // Upward swipe is positive

    // Show indicator when swiping up
    if (deltaY > 10) {
      setShowIndicator(true);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) {
      setShowIndicator(false);
      return;
    }

    const touch = e.changedTouches[0];
    const deltaY = touchStartRef.current.y - touch.clientY; // Upward swipe is positive
    const deltaTime = Date.now() - touchStartRef.current.time;
    const velocity = Math.abs(deltaY) / deltaTime; // pixels per ms

    // Open navigation if:
    // 1. Swiped up more than 50px, OR
    // 2. Fast upward swipe (velocity > 0.3 px/ms) and moved more than 20px
    const shouldOpen = deltaY > 50 || (velocity > 0.3 && deltaY > 20);

    if (shouldOpen) {
      openNavigation();
    }

    setShowIndicator(false);
    touchStartRef.current = null;
  };

  const handleClick = () => {
    openNavigation();
  };

  return (
    <>
      <HandleContainer
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Handle />
      </HandleContainer>
      <SwipeIndicator $isVisible={showIndicator}>
        Swipe up to navigate
      </SwipeIndicator>
    </>
  );
} 