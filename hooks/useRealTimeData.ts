import { useEffect, useState, useCallback } from 'react';
import { RouteRealTimeData } from '@/types/scheduling';

interface RealTimeDataOptions {
  pollingInterval?: number; // in milliseconds
  mockData?: boolean; // For testing/demo purposes
}

/**
 * Hook to manage real-time data collection for scheduling
 */
export const useRealTimeData = (options: RealTimeDataOptions = {}) => {
  const { pollingInterval = 30000, mockData = true } = options;
  const [realTimeData, setRealTimeData] = useState<RouteRealTimeData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Generate mock data for demonstration purposes
  const generateMockData = useCallback((routeCount: number = 5): RouteRealTimeData[] => {
    const routes: RouteRealTimeData[] = [];
    const timeOfDay = new Date().getHours();
    
    // Adjust demand based on time of day
    let demandMultiplier = 1.0;
    if (timeOfDay >= 7 && timeOfDay < 10) demandMultiplier = 1.8;   // Morning rush
    else if (timeOfDay >= 16 && timeOfDay < 19) demandMultiplier = 1.5; // Evening rush
    else if (timeOfDay >= 22 || timeOfDay < 5) demandMultiplier = 0.4; // Late night

    for (let i = 1; i <= routeCount; i++) {
      // Add some randomness to the data
      const baseLoad = 0.3 + Math.random() * 0.5; // 30-80% base load
      const randomFactor = 0.7 + Math.random() * 0.6; // 0.7-1.3
      
      routes.push({
        routeId: `route-${i}`,
        currentLoad: Math.min(1, baseLoad * randomFactor * demandMultiplier), // Cap at 1 (100%)
        waitingPassengers: Math.floor(Math.random() * 20 * demandMultiplier),
        averageWaitTime: 2 + Math.random() * 10, // 2-12 minutes
        lastUpdated: new Date().toISOString(),
      });
    }
    
    return routes;
  }, []);

  // Fetch real-time data from the API
  const fetchRealTimeData = useCallback(async () => {
    if (!mockData) {
      // TODO: Implement actual API call
      // const response = await fetch('/api/real-time-data');
      // const data = await response.json();
      // return data;
      return [];
    }
    
    // Return mock data for development
    return generateMockData(5);
  }, [mockData, generateMockData]);

  // Update real-time data
  const updateRealTimeData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchRealTimeData();
      setRealTimeData(data);
      return data;
    } catch (err) {
      console.error('Error fetching real-time data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch real-time data'));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [fetchRealTimeData]);

  // Set up polling for real-time updates
  useEffect(() => {
    // Initial fetch
    updateRealTimeData();
    
    // Set up interval for polling
    const intervalId = setInterval(updateRealTimeData, pollingInterval);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [pollingInterval, updateRealTimeData]);

  return {
    realTimeData,
    isLoading,
    error,
    refresh: updateRealTimeData,
  };
};

/**
 * Hook to get real-time data for a specific route
 */
export const useRouteRealTimeData = (routeId: string, options?: RealTimeDataOptions) => {
  const { realTimeData, ...rest } = useRealTimeData(options);
  
  const routeData = realTimeData.find(data => data.routeId === routeId);
  
  return {
    routeData,
    ...rest,
  };
};
