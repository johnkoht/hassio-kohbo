import React from 'react';
import styled from 'styled-components';

const iconSizes = {
  Auto: { width: 14, height: 22 },
  Bedtime: { width: 18, height: 18 },
  DnD: { width: 18, height: 18 },
};

const backgrounds = {
  Auto: 'rgba(255, 255, 255, 0.4)',
  Bedtime: 'rgba(255, 140, 0, 0.75)',
  DnD: 'rgba(237, 71, 71, 0.75)',
};

const Container = styled.div<{ mode: 'Auto' | 'Bedtime' | 'DnD' }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 6px 10px;
  gap: 7px;
  height: 34px;
  border-radius: 17px;
  backdrop-filter: blur(10px);
  background: ${({ mode }) => backgrounds[mode]};
`;

const Label = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  line-height: 14px;
`;

type Mode = 'Auto' | 'Bedtime' | 'DnD';

export default function RoomState({ mode, icon }: { mode: Mode; icon: string }) {
  const size = iconSizes[mode];
  return (
    <Container mode={mode}>
      <img src={icon} alt={mode} width={size.width} height={size.height} />
      <Label>{mode}</Label>
    </Container>
  );
} 