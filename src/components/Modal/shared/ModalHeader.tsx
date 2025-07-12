import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.div<{ $centered?: boolean; $marginBottom?: string }>`
  display: flex;
  justify-content: ${props => props.$centered ? 'center' : 'space-between'};
  align-items: center;
  text-align: center;
  margin-bottom: ${props => props.$marginBottom || '20px'};
`;

const Title = styled.h2`
  font-family: 'Poppins', Arial, Helvetica, sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #fff;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  opacity: 0.7;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }
`;

interface ModalHeaderProps {
  title: string;
  onClose?: () => void;
  centered?: boolean;
  marginBottom?: string;
}

export default function ModalHeader({ 
  title, 
  onClose, 
  centered = false, 
  marginBottom 
}: ModalHeaderProps) {
  return (
    <HeaderContainer $centered={centered} $marginBottom={marginBottom}>
      <Title>{title}</Title>
    </HeaderContainer>
  );
} 