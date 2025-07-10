import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import styled from 'styled-components';

const EmblaContainer = styled.div`
  overflow: hidden;
  width: 100%;
`;

const EmblaViewport = styled.div`
  width: 100%;
  overflow: hidden;
`;

const DeviceGrid = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  height: 320px; /* 2 rows of 150px + gap */
  gap: 20px;
  align-content: flex-start;
`;

const DeviceCardWrapper = styled.div`
  flex: 0 0 150px;
  height: 150px;
  scroll-snap-align: start;
`;

interface DeviceRowProps {
  children: React.ReactNode | React.ReactNode[];
}

function interleaveRows(childrenArray: React.ReactNode[], rows: number) {
  const columns = Math.ceil(childrenArray.length / rows);
  const result: React.ReactNode[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const idx = col * rows + row;
      if (childrenArray[idx]) {
        result.push(childrenArray[idx]);
      }
    }
  }
  return result;
}

export default function DeviceRow({ children }: DeviceRowProps) {
  const [emblaRef] = useEmblaCarousel({ axis: 'x', dragFree: false, align: 'start', slidesToScroll: 'auto', containScroll: 'trimSnaps' });
  const childrenArray = React.Children.toArray(children);
  const rows = 2;
  const interleaved = interleaveRows(childrenArray, rows);

  return (
    <EmblaContainer>
      <EmblaViewport ref={emblaRef}>
        <DeviceGrid>
          {interleaved.map((child, idx) => (
            <DeviceCardWrapper key={idx}>{child}</DeviceCardWrapper>
          ))}
        </DeviceGrid>
      </EmblaViewport>
    </EmblaContainer>
  );
} 