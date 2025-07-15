import React from 'react';
import styled from 'styled-components';
import ellipsisIcon from '../../../assets/device_icons/ellipsis.svg';

const MoreOptions = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  height: 50px;
  width: 50px;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  opacity: 0.7;
  
  svg {
    margin-right: 10px;
    margin-top: 9px;
  }
`;

interface DeviceCardMoreOptionsProps {
  onClick?: () => void;
}

export default function DeviceCardMoreOptions({ onClick }: DeviceCardMoreOptionsProps) {
  if (!onClick) return null;

  return (
    <MoreOptions onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <img src={ellipsisIcon} alt="More Options" />
    </MoreOptions>
  );
} 