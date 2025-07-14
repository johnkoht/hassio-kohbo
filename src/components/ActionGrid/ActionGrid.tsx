import React from 'react';
import styled from 'styled-components';

const GridContainer = styled.div<{ $variant: 'default' | 'simple' }>`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.$variant === 'simple' ? '10px' : '15px'};
  width: 100%;
  justify-content: center;
`;

const ActionButton = styled.button<{ $isActive: boolean; $variant: 'default' | 'simple' }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: ${props => props.$variant === 'simple' ? '15px 10px' : '15px 10px'};
  background: ${props => {
    if (props.$variant === 'simple') {
      return props.$isActive ? 'rgba(173, 181, 189, 0.6)' : 'rgba(173, 181, 189, 0.1)';
    }
    return props.$isActive ? 'rgba(173, 181, 189, 0.6)' : 'rgba(173, 181, 189, 0.1)';
  }};
  border: none;
  border-radius: ${props => props.$variant === 'simple' ? '17px' : '17px'};
  cursor: pointer;
  transition: all 0.3s ease;
  width: ${props => props.$variant === 'simple' ? '90px' : '90px'};
  height: ${props => props.$variant === 'simple' ? '100px' : '100px'};
  
  &:hover {
    background: ${props => props.$variant === 'simple' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.2)'};
  }
`;

const IconContainer = styled.div<{ $variant: 'default' | 'simple' }>`
  width: ${props => props.$variant === 'simple' ? '40px' : '40px'};
  height: ${props => props.$variant === 'simple' ? '40px' : '40px'};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => props.$variant === 'simple' ? 'none' : '0px 2px 4px rgba(0, 0, 0, 0.25)'};
  border-radius: ${props => props.$variant === 'simple' ? '20px' : '20px'};

  svg {
    width: ${props => props.$variant === 'simple' ? '40px' : '40px'};
    height: ${props => props.$variant === 'simple' ? '40px' : '40px'};
    fill: #fff;
  }
`;

const ActionLabel = styled.span<{ $variant: 'default' | 'simple' }>`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  text-align: center;
  line-height: 14px;
  display: ${props => props.$variant === 'simple' ? 'flex' : 'flex'};
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
  variant?: 'default' | 'simple';
}

export default function ActionGrid({ 
  actions, 
  activeAction, 
  onActionSelect,
  variant = 'default'
}: ActionGridProps) {
  return (
    <GridContainer $variant={variant}>
      {actions.map((action) => (
        <ActionButton
          key={action.id}
          $isActive={activeAction === action.id}
          $variant={variant}
          onClick={() => onActionSelect(action.id)}
        >
          <IconContainer $variant={variant}>
            {action.icon}
          </IconContainer>
          <ActionLabel $variant={variant}>{action.label}</ActionLabel>
        </ActionButton>
      ))}
    </GridContainer>
  );
} 