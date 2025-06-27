import { LocationObject } from 'expo-location';

/**
 * Represents a transit route with multiple steps
 */
export interface Route {
  id: string;
  name: string;
  mode: 'bus' | 'train' | 'tram' | 'walking' | 'bike' | 'rideshare';
  departureTime: Date;
  arrivalTime: Date;
  duration: number; // in seconds
  distance: number; // in meters
  steps: RouteStep[];
  polyline: string; // Encoded polyline for the route
  alerts: Alert[];
  price?: {
    amount: number;
    currency: string;
  };
}

/**
 * A single step in a route (e.g., walk to station, take bus, transfer)
 */
export interface RouteStep {
  type: 'walk' | 'transit' | 'bike' | 'rideshare';
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
  distance: number; // in meters
  instruction: string;
  details?: TransitDetails | WalkingDetails | BikeDetails | RideshareDetails;
}

/**
 * Details specific to transit steps
 */
export interface TransitDetails {
  routeId: string;
  routeName: string;
  routeShortName?: string;
  routeType: number;
  departureStop: Stop;
  arrivalStop: Stop;
  headsign: string;
  tripId: string;
  vehicleId?: string;
  numStops: number;
  realTimeUpdate?: {
    delay: number; // in seconds
    arrivalTime?: Date;
    departureTime?: Date;
    isCanceled: boolean;
  };
}

/**
 * Details specific to walking steps
 */
export interface WalkingDetails {
  startLocation: LocationObject;
  endLocation: LocationObject;
  instructions: string;
  path: LocationObject[];
}

/**
 * Details specific to bike steps
 */
export interface BikeDetails extends WalkingDetails {
  bikeType?: 'shared' | 'personal';
  bikeStationStart?: BikeStation;
  bikeStationEnd?: BikeStation;
}

/**
 * Details specific to rideshare steps
 */
export interface RideshareDetails {
  provider: string;
  vehicleType: string;
  priceEstimate: {
    low: number;
    high: number;
    currency: string;
    surgeMultiplier: number;
  };
  estimatedPickupTime: number; // in seconds
  estimatedDropoffTime: number; // in seconds
}

/**
 * Represents a transit stop
 */
export interface Stop {
  id: string;
  name: string;
  code?: string;
  location: LocationObject;
  platformCode?: string;
}

/**
 * Represents a bike share station
 */
export interface BikeStation {
  id: string;
  name: string;
  location: LocationObject;
  availableBikes: number;
  availableDocks: number;
  isRenting: boolean;
  isReturning: boolean;
  lastUpdated: Date;
}

/**
 * Represents a transit alert
 */
export interface Alert {
  id: string;
  cause: 'UNKNOWN_CAUSE' | 'OTHER_CAUSE' | 'TECHNICAL_PROBLEM' | 'STRIKE' | 'DEMONSTRATION' | 'ACCIDENT' | 'HOLIDAY' | 'WEATHER' | 'MAINTENANCE' | 'CONSTRUCTION' | 'POLICE_ACTIVITY' | 'MEDICAL_EMERGENCY';
  effect: 'NO_SERVICE' | 'REDUCED_SERVICE' | 'SIGNIFICANT_DELAYS' | 'DETOUR' | 'ADDITIONAL_SERVICE' | 'MODIFIED_SERVICE' | 'OTHER_EFFECT' | 'STOP_MOVED';
  headerText: string;
  descriptionText: string;
  url?: string;
  startTime?: Date;
  endTime?: Date;
  routeIds: string[];
  stopIds: string[];
}

/**
 * Represents a route option with additional AI insights
 */
export interface RouteOption extends Route {
  predictedDuration: number; // in seconds
  predictedCrowding: number; // 0-1 representing % of capacity
  comfortScore: number; // Lower is better
  aiInsights: {
    trafficConditions: 'light' | 'moderate' | 'heavy';
    expectedDelay: number; // in seconds
    confidence: number; // 0-1 confidence score
  };
}

/**
 * User preferences for route planning
 */
export interface RoutePreferences {
  /**
   * Maximum walking distance in meters
   */
  maxWalkDistance?: number;
  
  /**
   * Maximum number of transfers
   */
  maxTransfers?: number;
  
  /**
   * Modes of transportation to include
   */
  modes?: {
    transit?: boolean;
    walking?: boolean;
    bike?: boolean;
    rideshare?: boolean;
  };
  
  /**
   * Accessibility requirements
   */
  accessibility?: {
    wheelchair?: boolean;
    stepFreeAccess?: boolean;
    elevatorFreeAccess?: boolean;
  };
  
  /**
   * Avoid crowded vehicles if possible
   */
  avoidCrowds?: boolean;
  
  /**
   * Prioritize speed over comfort
   */
  prioritizeSpeed?: boolean;
  
  /**
   * Maximum price in the smallest currency unit (e.g., cents)
   */
  maxPrice?: number;
}
