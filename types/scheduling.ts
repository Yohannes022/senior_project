/**
 * Represents different times of the day for scheduling
 */
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

/**
 * Configuration for a specific route's scheduling
 */
export interface RouteScheduleConfig {
  id: string;
  name: string;
  demandFactor: number; // 0-1 representing the relative demand of this route
  baseVehicles: number;  // Minimum number of vehicles for this route
}

/**
 * Configuration for the scheduling service
 */
export interface ScheduleConfig {
  routes: RouteScheduleConfig[];
  averageRiders: number;
  averageVehicleCapacity: number;
  historicalDemandFactor: number; // Multiplier based on historical data
}

/**
 * Represents the allocation of vehicles to a specific route
 */
export interface VehicleAllocation {
  routeId: string;
  allocatedVehicles: number;
  timeOfDay: TimeOfDay;
  lastUpdated: string; // ISO date string
}

/**
 * Real-time data for a specific route
 */
export interface RouteRealTimeData {
  routeId: string;
  currentLoad: number; // 0-1 representing current capacity utilization
  waitingPassengers: number;
  averageWaitTime: number; // in minutes
  lastUpdated: string;    // ISO date string
}

/**
 * Historical data for scheduling optimization
 */
export interface HistoricalScheduleData {
  routeId: string;
  date: string; // ISO date string
  timeOfDay: TimeOfDay;
  averageLoad: number;
  peakLoad: number;
  averageWaitTime: number;
  totalPassengers: number;
}

/**
 * Configuration for time-based scheduling rules
 */
export interface TimeBasedRule {
  timeOfDay: TimeOfDay;
  minVehicles: number;
  maxVehicles: number;
  demandMultiplier: number;
  priorityRoutes: string[]; // Route IDs that should be prioritized
}

/**
 * Configuration for the scheduling service
 */
export interface SchedulingServiceConfig {
  timeBasedRules: TimeBasedRule[];
  defaultMinVehicles: number;
  defaultMaxVehicles: number;
  updateInterval: number; // in minutes
}
