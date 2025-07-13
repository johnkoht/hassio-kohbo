import React from 'react';
import styled from 'styled-components';
import ellipsisIcon from '../../../assets/device_icons/ellipsis.svg';

const MoreOptions = styled.button`
  position: absolute;
  top: 24px;
  right: 16px;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  opacity: 0.7;
  &:hover {
    opacity: 1;
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