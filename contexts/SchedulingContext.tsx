import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { schedulingService } from '@/services/schedulingService';
import { 
  ScheduleConfig, 
  VehicleAllocation, 
  RouteRealTimeData,
  SchedulingServiceConfig,
  TimeBasedRule
} from '@/types/scheduling';

interface SchedulingContextType {
  currentAllocations: VehicleAllocation[];
  updateSchedule: (config: ScheduleConfig) => void;
  updateRealTimeData: (data: RouteRealTimeData[]) => void;
  getRouteAllocation: (routeId: string) => VehicleAllocation | undefined;
  isLoading: boolean;
  error: Error | null;
  timeOfDay: string;
  lastUpdated: string;
}

const SchedulingContext = createContext<SchedulingContextType | undefined>(undefined);

interface SchedulingProviderProps {
  children: React.ReactNode;
  initialConfig: ScheduleConfig;
  schedulingConfig?: SchedulingServiceConfig;
}

export const SchedulingProvider: React.FC<SchedulingProviderProps> = ({
  children,
  initialConfig,
  schedulingConfig = {
    timeBasedRules: [
      { timeOfDay: 'morning', minVehicles: 5, maxVehicles: 20, demandMultiplier: 1.5, priorityRoutes: [] },
      { timeOfDay: 'afternoon', minVehicles: 3, maxVehicles: 15, demandMultiplier: 1.0, priorityRoutes: [] },
      { timeOfDay: 'evening', minVehicles: 4, maxVehicles: 18, demandMultiplier: 1.3, priorityRoutes: [] },
      { timeOfDay: 'night', minVehicles: 2, maxVehicles: 10, demandMultiplier: 0.5, priorityRoutes: [] },
    ],
    defaultMinVehicles: 1,
    defaultMaxVehicles: 30,
    updateInterval: 15, // minutes
  },
}) => {
  const [currentAllocations, setCurrentAllocations] = useState<VehicleAllocation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());
  const [realTimeData, setRealTimeData] = useState<RouteRealTimeData[]>([]);

  // Update schedule based on configuration
  const updateSchedule = useCallback(async (config: ScheduleConfig) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Generate new schedule based on current time and config
      const newAllocations = schedulingService.generateSchedule(config);
      
      // Apply real-time adjustments if we have data
      const adjustedAllocations = realTimeData.length > 0
        ? schedulingService.adjustForRealTimeDemand(newAllocations, realTimeData)
        : newAllocations;
      
      setCurrentAllocations(adjustedAllocations);
      setTimeOfDay(schedulingService.getCurrentTimeOfDay());
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update schedule'));
      console.error('Error updating schedule:', err);
    } finally {
      setIsLoading(false);
    }
  }, [realTimeData]);

  // Update real-time data and adjust schedule
  const updateRealTimeData = useCallback((newData: RouteRealTimeData[]) => {
    setRealTimeData(newData);
    
    // If we already have allocations, adjust them based on new real-time data
    if (currentAllocations.length > 0) {
      const adjustedAllocations = schedulingService.adjustForRealTimeDemand(
        [...currentAllocations],
        newData
      );
      setCurrentAllocations(adjustedAllocations);
      setLastUpdated(new Date().toISOString());
    }
  }, [currentAllocations]);

  // Get allocation for a specific route
  const getRouteAllocation = useCallback((routeId: string) => {
    return currentAllocations.find(allocation => allocation.routeId === routeId);
  }, [currentAllocations]);

  // Initialize with default schedule
  useEffect(() => {
    updateSchedule(initialConfig);
    
    // Set up periodic updates
    const interval = setInterval(() => {
      updateSchedule(initialConfig);
    }, (schedulingConfig.updateInterval || 15) * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [initialConfig, schedulingConfig.updateInterval]);

  return (
    <SchedulingContext.Provider
      value={{
        currentAllocations,
        updateSchedule,
        updateRealTimeData,
        getRouteAllocation,
        isLoading,
        error,
        timeOfDay,
        lastUpdated,
      }}
    >
      {children}
    </SchedulingContext.Provider>
  );
};

export const useScheduling = (): SchedulingContextType => {
  const context = useContext(SchedulingContext);
  if (context === undefined) {
    throw new Error('useScheduling must be used within a SchedulingProvider');
  }
  return context;
};
