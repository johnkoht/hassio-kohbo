import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 0px;
`;

export default function RoomContainer({ children }: { children: React.ReactNode }) {
  return (
    <Container>
      {children}
    </Container>
  );
} 