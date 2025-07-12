import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';

const SliderContainer = styled.div`
  position: relative;
  width: 120px;
  height: 300px;
  background: rgba(173, 181, 189, 0.3);
  border-radius: 17px;
  cursor: pointer;
  user-select: none;
  touch-action: none;
`;

const SliderTrack = styled.div<{ $fillHeight: number; $inverted: boolean }>`
  position: absolute;
  ${props => props.$inverted ? 'top' : 'bottom'}: 0;
  left: 0;
  right: 0;
  height: ${props => props.$fillHeight}%;
  background: #F8F9FA;
  border-radius: ${props => {
    if (props.$inverted) {
      // For inverted sliders, round the bottom when fill is high
      return props.$fillHeight > 90 ? '17px 17px 0px 0px' : '0px 0px 17px 17px';
    } else {
      // For normal sliders, round the top when fill is high
      return props.$fillHeight > 90 ? '17px 17px 17px 17px' : '0px 0px 17px 17px';
    }
  }};
  transition: height 0.1s ease-out, border-radius 0.1s ease-out;
`;


const SliderHandle = styled.div<{ $position: number; $inverted: boolean }>`
  position: absolute;
  ${props => props.$inverted ? 'top' : 'bottom'}: calc(${props => props.$position}% - 8px);
  left: 50%;
  transform: translateX(-50%) ${props => props.$inverted ? 'translateY(-50%)' : 'translateY(50%)'};
  width: 40px;
  height: 4px;
  background: #ADB5BD;
  border-radius: 2px;
  transition: transform 0.1s ease-out;
  
  &:hover {
    transform: translateX(-50%) ${props => props.$inverted ? 'translateY(-50%)' : 'translateY(50%)'} scale(1.1);
  }
`;

const ValueDisplay = styled.div`
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

interface VerticalSliderProps {
  value: number; // 0-100
  onChange: (value: number) => void;
  onRelease?: (value: number) => void;
  inverted?: boolean; // If true, 100% is at bottom, 0% is at top
  unit?: string; // e.g., '%', 'ft', etc.
  disabled?: boolean;
  hideHandle?: boolean; // If true, hide the handle
}

export default function VerticalSlider({ 
  value, 
  onChange, 
  onRelease, 
  inverted = false, 
  unit = '%', 
  disabled = false,
  hideHandle = false 
}: VerticalSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(value);
  const [optimisticValue, setOptimisticValue] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const lastUpdateRef = useRef<number>(0);

  // Use optimistic value during updates, drag value during dragging, or actual value
  const displayValue = optimisticValue !== null ? optimisticValue : (isDragging ? dragValue : value);

  // Clear optimistic state when actual value catches up or after timeout
  useEffect(() => {
    if (optimisticValue !== null && !isDragging) {
      const tolerance = 2; // Allow 2% tolerance
      if (Math.abs(value - optimisticValue) <= tolerance) {
        setOptimisticValue(null);
        setIsUpdating(false);
      } else {
        // Clear optimistic state after 2 seconds regardless
        const timeout = setTimeout(() => {
          setOptimisticValue(null);
          setIsUpdating(false);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    }
  }, [value, optimisticValue, isDragging]);

  const getValueFromPosition = useCallback((clientY: number): number => {
    if (!sliderRef.current) return displayValue;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    
    // Clamp the relative position to slider bounds
    const clampedRelativeY = Math.max(0, Math.min(rect.height, relativeY));
    const percentage = (clampedRelativeY / rect.height) * 100;
    
    // Invert the percentage based on orientation and round to nearest integer
    const finalValue = inverted ? percentage : 100 - percentage;
    return Math.round(Math.max(0, Math.min(100, finalValue)));
  }, [inverted, displayValue]);

  const handleStart = useCallback((clientY: number) => {
    if (disabled) return;
    
    setIsDragging(true);
    const newValue = getValueFromPosition(clientY);
    setDragValue(newValue);
    onChange(newValue);
  }, [disabled, getValueFromPosition, onChange]);

  const handleMove = useCallback((clientY: number) => {
    if (!isDragging || disabled) return;
    
    const newValue = getValueFromPosition(clientY);
    
    // Only update if the value actually changed to prevent unnecessary renders
    if (newValue !== dragValue) {
      setDragValue(newValue);
      
      // Throttle onChange calls to prevent excessive updates during fast dragging
      const now = Date.now();
      if (now - lastUpdateRef.current > 16) { // ~60fps throttling
        onChange(newValue);
        lastUpdateRef.current = now;
      }
    }
  }, [isDragging, disabled, getValueFromPosition, onChange, dragValue]);

  const handleEnd = useCallback(() => {
    if (!isDragging || disabled) return;
    
    setIsDragging(false);
    setOptimisticValue(dragValue);
    setIsUpdating(true);
    
    // Ensure final value is sent even if it was throttled
    onChange(dragValue);
    
    if (onRelease) {
      onRelease(dragValue);
    }
  }, [isDragging, disabled, dragValue, onRelease, onChange]);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientY);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientY);
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleStart(e.touches[0].clientY);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    handleMove(e.touches[0].clientY);
  }, [handleMove]);

  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Calculate positions for display
  const fillHeight = displayValue;
  const handlePosition = displayValue;

  return (
    <SliderContainer
      ref={sliderRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      <SliderTrack $fillHeight={fillHeight} $inverted={inverted} />
      {!hideHandle && <SliderHandle $position={handlePosition} $inverted={inverted} />}
    </SliderContainer>
  );
} 