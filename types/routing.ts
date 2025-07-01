import { LocationObject } from 'expo-location';

/**
 * Represents a transit route with multiple steps
 */
export interface RouteOption {
  id: string;
  name: string;
  duration: number; // in minutes
  originalDuration?: number; // in minutes (before traffic adjustments)
  distance: number; // in meters
  transportType: TransportModes;
  steps: RouteStep[];
  segments: RouteSegment[];
  price: number;
  accessibility: PhysicalAccessibility;
  carbonFootprint: number; // in kg CO2
  reliability: number; // 0-1 scale (lower is better)
  lastUpdated: string;
  provider: string;
  
  // Real-time data
  realTimeData?: {
    isRealTime: boolean;
    lastUpdated: string;
    delay: number; // in seconds
    delayProbability: number; // 0-1
    occupancy?: 'low' | 'medium' | 'high';
    vehicleId?: string;
    nextStop?: {
      id: string;
      name: string;
      arrivalTime: string;
      departureTime: string;
      platform?: string;
    };
  };
  
  // Traffic conditions and real-time information
  trafficConditions?: TrafficConditions;
  realTimeUpdates: boolean;
  delay?: number; // in minutes
  delayProbability?: number; // 0-1 scale
  typicalDelays?: {
    timeOfDay: Record<string, number>; // hour -> delay in minutes
    dayOfWeek: Record<string, number>; // day -> delay in minutes
  };
  
  // Alternative routes
  alternatives?: RouteOption[];
  
  // Dynamic routing info
  dynamicRouting?: {
    isDynamic: boolean;
    lastRerouted?: string;
    rerouteCount: number;
    originalRouteId?: string;
    reason?: string;
  };
  
  // Alerts and incidents
  alerts?: Array<{
    id: string;
    type: 'delay' | 'disruption' | 'alert' | 'info';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    startTime: string;
    endTime?: string;
    affectedStops?: string[];
    url?: string;
  }>;
  
  // User interaction
  isFavorite?: boolean;
  viewCount?: number;
  averageRating?: number;
  userRatings?: number;
  lastUsed?: string;
  
  // Analytics
  timeOfDay?: Record<string, number>;
  dayOfWeek?: Record<string, number>;
  views?: number;
  
  // ETA prediction
  predictedArrival?: {
    bestCase: string; // ISO timestamp
    expected: string; // ISO timestamp
    worstCase: string; // ISO timestamp
    confidence: number; // 0-1 scale
  };
  
  // Accessibility features
  accessibilityFeatures?: {
    wheelchairAccessible: boolean;
    stepFreeAccess: boolean;
    tactilePaving: boolean;
    audioAnnouncements: boolean;
    visualAnnouncements: boolean;
    assistanceAvailable: boolean;
  };
  
  // Environmental impact
  environmentalImpact?: {
    co2Savings?: number; // in kg compared to driving
    treesSaved?: number;
    caloriesBurned?: number;
  };
  
  // Metadata
  metadata?: {
    isCached?: boolean;
    lastFetched?: string;
    source?: string;
    confidence?: number; // 0-1 scale
  };
}

export interface RouteSegment {
  id: string;
  type: TransportModes;
  from: {
    id: string;
    name: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    platform?: string;
    departureTime?: string; // ISO timestamp
  };
  to: {
    id: string;
    name: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    platform?: string;
    arrivalTime?: string; // ISO timestamp
  };
  distance: number; // in meters
  duration: number; // in seconds
  polyline: string; // Encoded polyline
  steps: RouteStep[];
  alerts?: RouteAlert[];
  realTimeData?: {
    delay?: number; // in seconds
    arrivalTime?: string; // ISO timestamp
    departureTime?: string; // ISO timestamp
    occupancy?: 'low' | 'medium' | 'high';
    loadFactor?: number; // 0-1 scale
  };
  accessibility?: {
    wheelchairAccessible: boolean;
    stepFreeAccess: boolean;
    tactilePaving: boolean;
    audioAnnouncements: boolean;
    visualAnnouncements: boolean;
  };
  agency?: {
    id: string;
    name: string;
    url?: string;
    phone?: string;
    email?: string;
  };
  route?: {
    id: string;
    shortName?: string;
    longName?: string;
    color?: string;
    textColor?: string;
  };
}

export interface RouteAlert {
  id: string;
  type: 'delay' | 'cancellation' | 'detour' | 'alert' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  url?: string;
  startTime?: string; // ISO timestamp
  endTime?: string; // ISO timestamp
  affectedStops?: string[];
  affectedRoutes?: string[];
  lastUpdated: string; // ISO timestamp
}

export interface TrafficConditions {
  timestamp: string; // ISO timestamp
  segments: TrafficSegment[];
  incidents: TrafficIncident[];
  weather?: {
    condition: string;
    temperature: number; // in Celsius
    precipitation: number; // in mm/h
    windSpeed: number; // in m/s
    visibility: number; // in meters
  };
  source: string;
  ttl: number; // Time to live in seconds
  
  // Extended traffic data
  trafficLevels: {
    [segmentId: string]: TrafficData;
  };
  
  // Predictive data
  predictions?: {
    [segmentId: string]: {
      condition: TrafficCondition;
      confidence: number;
      expectedSpeed: number;
      timestamp: string;
    };
  };
  
  // Historical data summary
  historical?: {
    averageSpeed: number;
    typicalDelay: number;
    reliability: number; // 0-1 scale
  };
}

export interface TrafficSegment {
  id: string;
  from: {
    latitude: number;
    longitude: number;
  };
  to: {
    latitude: number;
    longitude: number;
  };
  speed: number; // in km/h
  freeFlowSpeed: number; // in km/h
  travelTime: number; // in seconds
  freeFlowTravelTime: number; // in seconds
  confidence: number; // 0-1 scale
  congestionLevel: 'free_flow' | 'light' | 'moderate' | 'heavy' | 'severe';
  incidents?: string[]; // References to incident IDs
  roadType?: string;
  lastUpdated: string; // ISO timestamp
}

export interface TrafficIncident {
  id: string;
  type: 'accident' | 'congestion' | 'construction' | 'hazard' | 'road_closed' | 'event' | 'weather' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: {
    latitude: number;
    longitude: number;
    bearing?: number; // 0-359 degrees, 0 = North, 90 = East
  };
  startTime: string; // ISO timestamp
  endTime?: string; // ISO timestamp
  affectedRoads?: Array<{
    name: string;
    type: string;
    direction: 'north' | 'south' | 'east' | 'west' | 'both';
  }>;
  affectedRoutes?: string[]; // Route IDs
  url?: string;
  lastUpdated: string; // ISO timestamp
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
 * User preferences for route planning and app settings
 */
export interface RoutePreferences {
  // Route planning preferences
  maxWalkingDistance: number; // in meters
  maxTransfers: number;
  maxTravelTime: number; // in minutes
  avoidStairs: boolean;
  avoidEscalators: boolean;
  avoidElevators: boolean;
  preferredTransportModes: TransportModes[];
  preferredAgencies: string[];
  avoidAreas: {
    north: number;
    south: number;
    east: number;
    west: number;
  }[];
  walkingSpeed: 'slow' | 'normal' | 'fast';
  priceLimit?: number;
  carbonFootprintLimit?: number;
  reliabilityThreshold?: number; // 0-1 scale
  lastUpdated?: string;
  
  // Traffic-related preferences
  trafficAwareRouting: boolean;
  trafficUpdateFrequency: number; // in minutes
  rerouteThreshold: number; // 0-1 scale (0 = never reroute, 1 = always reroute)
  minTimeSavingsForReroute: number; // in minutes
  avoidTolls: boolean;
  avoidHighways: boolean;
  avoidFerries: boolean;
  
  // Real-time preferences
  realTimeUpdates: boolean;
  pushNotifications: boolean;
  emailAlerts: boolean;
  smsAlerts: boolean;
  
  // Dynamic routing preferences
  dynamicRerouting: boolean;
  maxRerouteAttempts: number;
  maxDetourTime: number; // in minutes
  preferredRerouteTypes: Array<'less_crowded' | 'faster' | 'fewer_transfers' | 'more_accessible'>;
  
  // Accessibility preferences
  requireElevator: boolean;
  requireStepFree: boolean;
  requireAssistance: boolean;
  
  // Schedule preferences
  preferredDepartureTimes: {
    [day: string]: Array<{
      start: string; // 'HH:MM' format
      end: string;   // 'HH:MM' format
    }>;
  };
  
  // Advanced preferences
  walkingCaloriesBurned: boolean;
  carbonFootprint: boolean;
  calorieGoal?: number; // in kcal
  
  // Data usage preferences
  offlineMode: boolean;
  dataSaverMode: boolean;
  cacheDuration: number; // in hours
  
  // Experimental features
  experimentalFeatures: {
    aiRouteOptimization: boolean;
    predictiveArrival: boolean;
    crowdPrediction: boolean;
  };
}

// Base accessibility settings for physical mobility
export interface PhysicalAccessibility {
  wheelchair?: boolean;
  stepFreeAccess?: boolean;
  elevatorFreeAccess?: boolean;
}

// Visual and auditory accessibility settings
export interface VisualAccessibility {
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  screenReader: boolean;
}

// Notification preferences
export interface NotificationPreferences {
  email?: boolean;
  push?: boolean;
  sms?: boolean;
}

// Real-time traffic update frequency options
export type TrafficUpdateFrequency = 'realtime' | 'frequent' | 'normal' | 'reduced' | 'minimal';

// Traffic condition levels
export type TrafficCondition = 'free_flow' | 'light' | 'moderate' | 'heavy' | 'severe';

// Traffic incident types
export type TrafficIncidentType = 'accident' | 'congestion' | 'construction' | 'hazard' | 'road_closed' | 'event' | 'weather';

// Transport modes
export interface TransportModes {
  transit?: boolean;
  walking?: boolean;
  bike?: boolean;
  rideshare?: boolean;
}

// Real-time traffic data for a route segment
export interface TrafficData {
  /** Current traffic condition on this segment */
  condition: TrafficCondition;
  /** Current speed in km/h */
  currentSpeed: number;
  /** Free flow speed in km/h */
  freeFlowSpeed: number;
  /** Delay in seconds compared to free flow */
  delay: number;
  /** Confidence level of the traffic data (0-1) */
  confidence: number;
  /** Timestamp of the last update */
  lastUpdated: string;
  /** Active incidents on this segment */
  incidents: TrafficIncident[];
}

// Traffic-aware route options
export interface TrafficAwareRouteOptions {
  /** Whether to consider real-time traffic in routing */
  useRealTimeTraffic: boolean;
  /** How frequently to update traffic data */
  updateFrequency: TrafficUpdateFrequency;
  /** Minimum time savings (in minutes) to trigger a route change */
  minTimeSavingsForReroute: number;
  /** Whether to avoid traffic incidents */
  avoidIncidents: boolean;
  /** Maximum allowed delay before suggesting alternative routes (in minutes) */
  maxAllowedDelay: number;
  /** Whether to show traffic conditions on the map */
  showTrafficLayer: boolean;
}

// Dynamic routing preferences
export interface DynamicRoutingPreferences {
  /** Enable dynamic rerouting based on traffic */
  enabled: boolean;
  /** Maximum number of reroute attempts */
  maxRerouteAttempts: number;
  /** Minimum time savings (in minutes) to consider a better route */
  minTimeSavings: number;
  /** Maximum detour time (in minutes) when rerouting */
  maxDetourTime: number;
  /** Types of routes to consider when rerouting */
  preferredRerouteTypes: Array<'less_crowded' | 'faster' | 'fewer_transfers' | 'more_accessible'>;
  /** Whether to notify user about better routes */
  notifyAboutBetterRoutes: boolean;
  /** Whether to automatically switch to better routes */
  autoSwitchToBetterRoutes: boolean;
}

// User preferences interface
export interface UserPreferences {
  // UI preferences
  theme: 'light' | 'dark' | 'system';
  language: string;
  favoriteRoutes: string[];
  preferredTransport: string[];
  notificationPreferences: NotificationPreferences;
  
  // Route preferences
  routePreferences: RoutePreferences;
  
  // Traffic and routing preferences
  trafficAwareRouting: TrafficAwareRouteOptions;
  dynamicRouting: DynamicRoutingPreferences;
  
  // Accessibility preferences
  accessibility: {
    physical: PhysicalAccessibility;
    visual: VisualAccessibility;
  };
  
  // Notification preferences
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    trafficAlerts: boolean;
    routeChanges: boolean;
    delayNotifications: boolean;
  };
  
  // Schedule preferences
  schedule: {
    preferredDepartureTimes: {
      weekdays: string;
      weekends: string;
    };
    bufferTime: number; // in minutes
    notifyEarly: boolean;
  };
  
  // Last updated timestamp
  lastUpdated: string;
  
  // Real-time data settings
  realTimeData: {
    enabled: boolean;
    refreshInterval: number; // in seconds
    dataSaverMode: boolean;
  };
}
