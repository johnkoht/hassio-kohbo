import React from 'react';
import styled from 'styled-components';
import DateTime from '../DateTime/DateTime';

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  position: relative;
  padding-right: 60px;
`;

const LeftContent = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
  margin-top: 10px;
`;

export default function DashboardHeader({ children }: { children: React.ReactNode }) {
  return (
    <HeaderContainer>
      <LeftContent>{children}</LeftContent>
      <DateTime />
    </HeaderContainer>
  );
} 