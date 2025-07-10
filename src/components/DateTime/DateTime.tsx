import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const DateTimeContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
`;

const Time = styled.div`
  font-family: 'Poppins', Arial, Helvetica, sans-serif;
  font-size: 50px;
  font-weight: 400;
  color: #fff;
  line-height: 1;
  margin-bottom: 4px;
`;

const Date = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #CED4DA;
  line-height: 1;
`;

export default function DateTime() {
  const [currentTime, setCurrentTime] = useState<Date>(() => {
    return new globalThis.Date();
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new globalThis.Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const timeString = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    // Remove AM/PM from the string
    return timeString.replace(/\s?(AM|PM)/i, '');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <DateTimeContainer>
      <Time>{formatTime(currentTime)}</Time>
      <Date>{formatDate(currentTime)}</Date>
    </DateTimeContainer>
  );
} 