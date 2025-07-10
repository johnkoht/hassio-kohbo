import React from 'react';
import styled from 'styled-components';

const Bg = styled.div<{ bg: string }>`
  position: relative;
  width: 100vw;
  height: 100vh;
  background: url(${p => p.bg}) center/cover no-repeat;
  overflow: hidden;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(33, 37, 41, 0.8);
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
`;

export default function Room({ bg, children }: { bg: string; children: React.ReactNode }) {
  return (
    <Bg bg={bg}>
      <Overlay />
      <Content>{children}</Content>
    </Bg>
  );
} 