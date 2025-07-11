import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import styled from 'styled-components';

const ChartContainer = styled.div`
  width: 100%;
  height: 80px;
  position: relative;
  overflow: hidden;
`;

const LoadingText = styled.div`
  font-family: 'Inter', Arial, Helvetica, sans-serif;
  font-size: 12px;
  color: #6C757D;
  text-align: center;
  padding: 20px;
`;

interface AQIChartProps {
  data: Array<{ time: string; value: number }>;
  loading: boolean;
  error: string | null;
}

export default function AQIChart({ data, loading, error }: AQIChartProps) {
  if (loading) {
    return <LoadingText>Loading chart...</LoadingText>;
  }

  if (error) {
    return <LoadingText>Error loading chart</LoadingText>;
  }

  if (!data || data.length === 0) {
    return <LoadingText>No data available</LoadingText>;
  }

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={data}
          margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF9800" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#FF9800" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Area 
            type="monotoneX" 
            dataKey="value" 
            stroke="#FF9800" 
            strokeWidth={2}
            fill="url(#aqiGradient)"
            dot={false}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
} 