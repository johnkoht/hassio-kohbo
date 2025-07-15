import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 40px 0px 30px 60px;
`;

export default function RoomContainer({ children }: { children: React.ReactNode }) {
  return (
    <Container>
      {children}
    </Container>
  );
} 