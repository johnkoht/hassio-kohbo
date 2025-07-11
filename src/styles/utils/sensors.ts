import styled from 'styled-components';

export const SensorBox = styled.div`
  background: rgba(248, 249, 250, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 17px;
`;

export const SensorContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
`;

export const SensorTitle = styled.h3`
  font-family: 'Poppins', Arial, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: 12px;
  color: #F8F9FA;
  margin: 0px;
`;

export const SensorValue = styled.div`
  font-family: 'Poppins', Arial, Helvetica, sans-serif;
  font-size: 30px;
  line-height: 30px;
  font-weight: 400;
  color: #F8F9FA;
  margin-bottom: 5px;
`; 