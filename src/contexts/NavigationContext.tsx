import React, { createContext, useContext, useState, ReactNode } from 'react';

export type FloorType = 'main' | 'upper' | 'lower' | 'exterior' | 'laundry';

interface NavigationState {
  isOpen: boolean;
  currentFloor: FloorType;
}

interface NavigationContextType {
  navigationState: NavigationState;
  openNavigation: () => void;
  closeNavigation: () => void;
  setCurrentFloor: (floor: FloorType) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    isOpen: false,
    currentFloor: 'main',
  });

  const openNavigation = () => {
    setNavigationState(prev => ({
      ...prev,
      isOpen: true,
    }));
  };

  const closeNavigation = () => {
    setNavigationState(prev => ({
      ...prev,
      isOpen: false,
    }));
  };

  const setCurrentFloor = (floor: FloorType) => {
    setNavigationState(prev => ({
      ...prev,
      currentFloor: floor,
    }));
  };

  return (
    <NavigationContext.Provider value={{ 
      navigationState, 
      openNavigation, 
      closeNavigation, 
      setCurrentFloor 
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
} 