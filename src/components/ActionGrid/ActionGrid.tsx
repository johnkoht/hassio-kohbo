import React from 'react';
import styled from 'styled-components';

const GridContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  width: 100%;
  justify-content: center;
`;

const ActionButton = styled.button<{ $isActive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px 10px;
  background: ${props => props.$isActive ? 'rgba(173, 181, 189, 0.6)' : 'rgba(173, 181, 189, 0.1)'};
  border: none;
  border-radius: 17px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 90px;
  height: 100px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const IconContainer = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.25);
  border-radius: 20px;

  svg {
    width: 40px;
    height: 40px;
    fill: #fff;
  }
`;

const ActionLabel = styled.span`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  text-align: center;
  line-height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
`;

export interface ActionItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface ActionGridProps {
  actions: ActionItem[];
  activeAction?: string | null;
  onActionSelect: (actionId: string) => void;
  columns?: number; // Not used with flexbox, but kept for API compatibility
}

export default function ActionGrid({ 
  actions, 
  activeAction, 
  onActionSelect
}: ActionGridProps) {
  return (
    <GridContainer>
      {actions.map((action) => (
        <ActionButton
          key={action.id}
          $isActive={activeAction === action.id}
          onClick={() => onActionSelect(action.id)}
        >
          <IconContainer>
            {action.icon}
          </IconContainer>
          <ActionLabel>{action.label}</ActionLabel>
        </ActionButton>
      ))}
    </GridContainer>
  );
} 