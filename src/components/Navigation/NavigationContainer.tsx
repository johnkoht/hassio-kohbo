import React, { useEffect, useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import useEmblaCarousel from 'embla-carousel-react';
import { useNavigation } from '../../contexts/NavigationContext';
import { getRoomsByFloor, floorLabels } from '../../data/roomsData';
import RoomCard from './RoomCard';
import FloorNavigation from './FloorNavigation';

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

const NavigationBox = styled.div<{ $isOpen: boolean; $translateY: number }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100vh;
  background: rgba(33, 37, 41, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  transform: translateY(${props => {
    if (!props.$isOpen) return '100%';
    return `${props.$translateY}px`;
  }});
  transition: ${props => props.$translateY !== 0 ? 'none' : 'transform 0.3s ease-in-out'};
  z-index: 1001;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const NavigationHeader = styled.div`
  padding: 20px 20px 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const DragHandle = styled.div`
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  cursor: pointer;
`;

const NavigationTitle = styled.h2`
  font-family: 'Poppins', Arial, Helvetica, sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #fff;
  margin: 0;
  text-align: center;
`;

const CarouselContainer = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const EmblaViewport = styled.div`
  flex: 1;
  overflow: hidden;
`;

const EmblaContainer = styled.div`
  display: flex;
  height: 100%;
`;

const EmblaSlide = styled.div`
  flex: 0 0 100%;
  min-width: 0;
  height: 100%;
  overflow-y: auto;
  padding: 20px;
`;

const RoomGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 16px;
  text-align: center;
`;

const floors = ['main', 'upper', 'lower', 'exterior', 'laundry'] as const;

export default function NavigationContainer() {
  const { navigationState, closeNavigation, setCurrentFloor } = useNavigation();
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigationRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ y: number; time: number; x?: number } | null>(null);

  // Update current floor when slide changes
  useEffect(() => {
    if (emblaApi) {
      const currentFloor = floors[selectedIndex];
      setCurrentFloor(currentFloor);
    }
  }, [selectedIndex, emblaApi, setCurrentFloor]);

  // Handle carousel selection
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Handle floor navigation clicks
  const handleFloorChange = useCallback((floor: typeof floors[number]) => {
    const floorIndex = floors.indexOf(floor);
    if (emblaApi && floorIndex !== -1) {
      emblaApi.scrollTo(floorIndex);
    }
  }, [emblaApi]);

  // Close navigation on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && navigationState.isOpen) {
        closeNavigation();
      }
    };

    if (navigationState.isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [navigationState.isOpen, closeNavigation]);

  // Reset translateY when navigation closes
  useEffect(() => {
    if (!navigationState.isOpen) {
      setTranslateY(0);
      setIsDragging(false);
    }
  }, [navigationState.isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeNavigation();
    }
  };

  // Touch event handlers for swipe-to-dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      y: touch.clientY,
      time: Date.now()
    };
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaX = Math.abs(touch.clientX - (touchStartRef.current.x || touch.clientX));

    // Store initial X position if not already stored
    if (!touchStartRef.current.x) {
      touchStartRef.current.x = touch.clientX;
    }

    // Calculate the direction of the swipe
    const isHorizontalSwipe = deltaX > Math.abs(deltaY);
    const isVerticalSwipe = Math.abs(deltaY) > deltaX;

    // Only handle downward swipes if:
    // 1. Movement is primarily vertical (not horizontal)
    // 2. Downward movement is greater than 20px (threshold)
    // 3. Horizontal movement is less than 30px (not a floor swipe)
    if (deltaY > 20 && isVerticalSwipe && deltaX < 30) {
      setIsDragging(true);
      // Clamp to maximum height
      const clampedDeltaY = Math.max(0, Math.min(deltaY, window.innerHeight));
      setTranslateY(clampedDeltaY);
      
      // Prevent default to stop scrolling
      e.preventDefault();
    } else if (isHorizontalSwipe) {
      // Don't interfere with horizontal swipes for floor navigation
      setIsDragging(false);
      setTranslateY(0);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !isDragging) {
      setTranslateY(0);
      setIsDragging(false);
      touchStartRef.current = null;
      return;
    }

    const touch = e.changedTouches[0];
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaX = Math.abs(touch.clientX - (touchStartRef.current.x || touch.clientX));
    const deltaTime = Date.now() - touchStartRef.current.time;
    const velocity = Math.abs(deltaY) / deltaTime; // pixels per ms

    // Only close if this was primarily a vertical swipe
    const isVerticalSwipe = Math.abs(deltaY) > deltaX;
    
    // Close navigation if:
    // 1. This was a vertical swipe AND
    // 2. (Swiped more than 1/3 of the screen height OR fast swipe with significant movement)
    const shouldClose = isVerticalSwipe && 
      (deltaY > window.innerHeight / 3 || (velocity > 0.5 && deltaY > 100));

    if (shouldClose) {
      closeNavigation();
    } else {
      // Snap back to original position
      setTranslateY(0);
    }

    setIsDragging(false);
    touchStartRef.current = null;
  };

  const handleRoomCardClick = () => {
    closeNavigation();
  };

  const renderFloorContent = (floorType: typeof floors[number]) => {
    const rooms = getRoomsByFloor(floorType);
    
    if (rooms.length === 0) {
      return (
        <EmptyState>
          <div>No rooms available</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>
            Coming soon...
          </div>
        </EmptyState>
      );
    }

    return (
      <RoomGrid>
        {rooms.map(room => (
          <RoomCard
            key={room.id}
            room={room}
            onClick={handleRoomCardClick}
          />
        ))}
      </RoomGrid>
    );
  };

  return (
    <>
      <Backdrop $isOpen={navigationState.isOpen} onClick={handleBackdropClick} />
      <NavigationBox 
        ref={navigationRef}
        $isOpen={navigationState.isOpen}
        $translateY={translateY}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {navigationState.isOpen && (
          <>
            <NavigationHeader>
              <DragHandle />
              <NavigationTitle>
                {floorLabels[floors[selectedIndex]]}
              </NavigationTitle>
            </NavigationHeader>
            
            <CarouselContainer>
              <EmblaViewport ref={emblaRef}>
                <EmblaContainer>
                  {floors.map((floor, index) => (
                    <EmblaSlide key={floor}>
                      {renderFloorContent(floor)}
                    </EmblaSlide>
                  ))}
                </EmblaContainer>
              </EmblaViewport>
            </CarouselContainer>
            
            <FloorNavigation 
              currentFloor={floors[selectedIndex]}
              onFloorChange={handleFloorChange}
            />
          </>
        )}
      </NavigationBox>
    </>
  );
} 