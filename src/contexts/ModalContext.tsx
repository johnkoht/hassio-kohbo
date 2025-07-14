import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ModalType = 'light' | 'fan' | 'climate' | 'settings' | 'tv' | 'thermostat' | null;

interface ModalState {
  type: ModalType;
  entityId?: string;
  isOpen: boolean;
}

interface ModalContextType {
  modalState: ModalState;
  openModal: (type: ModalType, entityId?: string) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [modalState, setModalState] = useState<ModalState>({
    type: null,
    entityId: undefined,
    isOpen: false,
  });

  const openModal = (type: ModalType, entityId?: string) => {
    setModalState({
      type,
      entityId,
      isOpen: true,
    });
  };

  const closeModal = () => {
    setModalState({
      type: null,
      entityId: undefined,
      isOpen: false,
    });
  };

  return (
    <ModalContext.Provider value={{ modalState, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
} 