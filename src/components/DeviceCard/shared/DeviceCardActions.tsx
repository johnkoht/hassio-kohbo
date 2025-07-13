import React from 'react';
import styled from 'styled-components';

const ActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  height: 100%;
  justify-content: center;
`;

const ActionButton = styled.button<{ $isPrimary?: boolean }>`
  background: rgba(233, 236, 239, .15);
  border: none;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  padding: 4px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:first-child {
    border-top-right-radius: 12px;
    margin-bottom: 1px;
  }

  &:last-child {
    border-bottom-right-radius: 12px;
    margin-top: 1px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

interface Action {
  label: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  isPrimary?: boolean;
}

interface DeviceCardActionsProps {
  actions: Action[];
}

export default function DeviceCardActions({ actions }: DeviceCardActionsProps) {
  if (!actions || actions.length === 0) return null;

  return (
    <ActionsContainer>
      {actions.map((action, index) => (
        <ActionButton
          key={index}
          $isPrimary={action.isPrimary}
          onClick={action.onClick}
        >
          {action.label}
        </ActionButton>
      ))}
    </ActionsContainer>
  );
} 