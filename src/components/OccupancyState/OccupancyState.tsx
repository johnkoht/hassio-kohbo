import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px;
  gap: 7px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(15px);
  border-radius: 17px;
  height: 34px;
`;

const Indicator = styled.div<{ occupied: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #F8F9FA;
  opacity: ${p => (p.occupied ? 0.9 : 0.4)};
`;

const Label = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #fff;
`;

export default function OccupancyState({ state }: { state: 'Occupied' | 'Empty' }) {
  const occupied = state === 'Occupied';
  return (
    <Container>
      <Indicator occupied={occupied} />
      <Label>{state}</Label>
    </Container>
  );
} 