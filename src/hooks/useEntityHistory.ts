import { useState, useEffect } from 'react';
import { hassApiFetch } from '../api/hassApiFetch';

interface HistoryDataPoint {
  time: string;
  value: number;
  timestamp: string;
}

interface UseEntityHistoryResult {
  data: HistoryDataPoint[];
  loading: boolean;
  error: string | null;
}

interface HassHistoryPoint {
  entity_id: string;
  state: string;
  last_changed: string;
  attributes: any;
}

export function useEntityHistory(entityId: string, hours: number = 24): UseEntityHistoryResult {
  const [data, setData] = useState<HistoryDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entityId) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);

        const response = await hassApiFetch(
          `/api/history/period/${startTime.toISOString()}?filter_entity_id=${entityId}&end_time=${endTime.toISOString()}`
        );

        const historyData = await response.json() as HassHistoryPoint[][];
        
        if (historyData && historyData[0]) {
          const processedData = historyData[0]
            .filter((point: HassHistoryPoint) => point.state !== 'unavailable' && point.state !== 'unknown' && !isNaN(parseFloat(point.state)))
            .map((point: HassHistoryPoint) => ({
              time: new Date(point.last_changed).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: false 
              }),
              value: parseFloat(point.state),
              timestamp: point.last_changed,
            }));

          setData(processedData);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error('Failed to fetch entity history:', err);
        setError('Failed to load historical data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [entityId, hours]);

  return { data, loading, error };
} 