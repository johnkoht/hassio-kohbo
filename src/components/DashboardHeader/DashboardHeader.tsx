import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
  position: relative;
`;

export default function DashboardHeader({ children }: { children: React.ReactNode }) {
  return <HeaderContainer>{children}</HeaderContainer>;
} 