import React from 'react';
import styled from 'styled-components';

const Name = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 15px;
  line-height: 15px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
`;

const State = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 13px;
  line-height: 13px;
  font-weight: 500;
  color: #CED4DA;
`;

interface DeviceCardInfoProps {
  name: string;
  state: string;
}

export default function DeviceCardInfo({ name, state }: DeviceCardInfoProps) {
  return (
    <>
      <Name>{name}</Name>
      <State>{state}</State>
    </>
  );
} 