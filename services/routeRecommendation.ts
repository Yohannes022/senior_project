import { BehaviorSubject } from 'rxjs';
import { userPreferencesService, UserPreferences } from './userPreferences';
import { RoutePreferences, RouteOption } from "@/types/routing";
import { trafficService, TrafficConditions } from "./trafficService";

type TransportModes = 'bus' | 'train' | 'tram' | 'walking' | 'bike' | 'rideshare';

interface PhysicalAccessibility {
  wheelchairAccessible: boolean;
  stepFreeAccess: boolean;
  tactilePaving: boolean;
  audioAnnouncements: boolean;
  visualAnnouncements: boolean;
  assistanceAvailable: boolean;
}

export interface RouteSuggestion {
  id: string;
  routeName: string;
  transportType: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  reliabilityScore: number;
  segments: RouteSegment[];
  trafficConditions?: TrafficConditions;
}

export interface RouteSegment {
  start: {
    lat: number;
    lng: number;
  };
  end: {
    lat: number;
    lng: number;
  };
  transportType: string;
  duration: number; // in seconds
  distance: number; // in meters
  instructions: string;
  trafficLevel?: 'free_flow' | 'light' | 'moderate' | 'heavy' | 'severe';
  incidents?: TrafficIncident[];
}

export interface TrafficIncident {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  location: {
    lat: number;
    lng: number;
  };
}

export interface RouteStats {
  routeId: string;
  routeName: string;
  averageRating: number;
  totalRides: number;
  popularity: number;
  averageDuration: number;
  reliabilityScore: number;
  peakHours: Record<string, number>;
  lastUsed?: string;
  timeOfDay?: Record<string, number>;
  dayOfWeek?: Record<string, number>;
  views?: number;
  currentDelay?: number; // in seconds
  alternativeRoutes?: RouteOption[];
}

class RouteRecommendationService {
  private static instance: RouteRecommendationService;
  private baseUrl: string = 'https://api.shegertransit.com';
  private trafficUpdateUnsubscribe: (() => void) | null = null;
  private currentTraffic: TrafficConditions | null = null;
  private routeStats = new BehaviorSubject<Record<string, RouteStats>>({});
  private userPreferences: UserPreferences | null = null;
  
  // Track active routes for dynamic updates
  private activeRoutes: Map<string, RouteSuggestion> = new Map();
  
  // Track route view statistics
  private routeViewStats: Record<string, {
    views: number;
    lastViewed: Date;
    timeOfDay: Record<string, number>;
    dayOfWeek: Record<string, number>;
  }> = {};

  private constructor() {
    // Initialize traffic updates
    this.initializeTrafficUpdates();

    // Subscribe to user preferences
    userPreferencesService.getPreferences().subscribe(prefs => {
      this.userPreferences = prefs;
    });
    
    // Initialize with empty route stats
    this.routeStats.next({});
  }

  static getInstance(): RouteRecommendationService {
    if (!RouteRecommendationService.instance) {
      RouteRecommendationService.instance = new RouteRecommendationService();
    }
    return RouteRecommendationService.instance;
  }

  private initializeTrafficUpdates(): void {
    // Subscribe to traffic updates
    this.trafficUpdateUnsubscribe = trafficService.subscribe((trafficData) => {
      this.currentTraffic = trafficData;
      // Recalculate any active routes with new traffic data
      this.recalculateActiveRoutes();
    });
  }

  private recalculateActiveRoutes(): void {
    // This would be called when traffic updates are received
    // to update any currently displayed routes
    // Implementation would track active routes and update them
  }

  async getRecommendations(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    departureTime: Date = new Date(),
    preferences?: RoutePreferences,
    includeAlternatives: boolean = true
  ): Promise<{
    primary: RouteSuggestion[];
    alternatives?: RouteSuggestion[];
    trafficConditions?: TrafficConditions;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/routes/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin,
          destination,
          departureTime: departureTime.toISOString(),
          preferences,
          includeTraffic: true,
          currentTraffic: this.currentTraffic,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch route recommendations');
      }

      const data = await response.json();
      
      // Apply traffic-aware adjustments
      const processedRoutes = this.processRoutesWithTraffic(data.routes);
      
      return {
        primary: processedRoutes.slice(0, 3), // Top 3 routes
        alternatives: includeAlternatives ? processedRoutes.slice(3) : undefined,
        trafficConditions: this.currentTraffic || undefined
      };
    } catch (error) {
      console.error('Error fetching route recommendations:', error);
      throw error;
    }
  }

  private processRoutesWithTraffic(routes: RouteSuggestion[]): RouteSuggestion[] {
    if (!this.currentTraffic) return routes;

    return routes.map(route => {
      // Calculate traffic impact on this route
      const trafficImpact = this.calculateTrafficImpact(route);
      
      // Adjust duration based on traffic
      const adjustedDuration = this.adjustDurationForTraffic(route, trafficImpact);
      
      // Update reliability score based on traffic conditions
      const reliabilityScore = this.calculateAdjustedReliability(route, trafficImpact);

      return {
        ...route,
        duration: adjustedDuration,
        reliabilityScore,
        trafficConditions: this.currentTraffic || undefined,
        segments: route.segments.map(segment => ({
          ...segment,
          trafficLevel: this.getTrafficLevelForSegment(segment),
          incidents: this.getIncidentsForSegment(segment)
        }))
      };
    }).sort((a, b) => a.reliabilityScore - b.reliabilityScore);
  }

  private calculateTrafficImpact(route: RouteSuggestion): number {
    // Calculate traffic impact score (0-1)
    // Higher means more traffic impact
    if (!this.currentTraffic) return 0;
    
    // This is a simplified example - real implementation would analyze
    // each segment of the route against current traffic data
    return 0.3; // Placeholder
  }

  private adjustDurationForTraffic(route: RouteSuggestion, trafficImpact: number): string {
    // Adjust the route duration based on traffic impact
    const baseDuration = parseInt(route.duration, 10);
    const adjustedDuration = baseDuration * (1 + trafficImpact);
    return adjustedDuration.toFixed(0);
  }

  private calculateAdjustedReliability(route: RouteSuggestion, trafficImpact: number): number {
    // Lower reliability score is better
    const baseReliability = route.reliabilityScore || 1.0;
    return baseReliability * (1 + trafficImpact * 0.5); // 50% impact from traffic
  }

  private getTrafficLevelForSegment(segment: RouteSegment): 'free_flow' | 'light' | 'moderate' | 'heavy' | 'severe' {
    // Determine traffic level for a segment based on current traffic data
    if (!this.currentTraffic) return 'moderate';
    
    // In a real implementation, this would analyze the segment against current traffic data
    // For now, return a default value
    return 'moderate';
  }

  private getIncidentsForSegment(segment: RouteSegment): TrafficIncident[] {
    // Get any traffic incidents affecting this segment
    // This would use the trafficService to get real incident data
    return []; // Placeholder
  }

  async getDynamicAlternativeRoutes(
    currentRouteId: string,
    currentLocation: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    preferences?: RoutePreferences
  ): Promise<RouteSuggestion[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/routes/alternatives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentRouteId,
          currentLocation,
          destination,
          preferences,
          currentTraffic: this.currentTraffic,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch alternative routes');
      }

      const data = await response.json();
      return this.processRoutesWithTraffic(data.routes);
    } catch (error) {
      console.error('Error fetching alternative routes:', error);
      return [];
    }
  }

  async getPopularRoutes(limit: number = 5): Promise<RouteStats[]> {
    try {
      // First try to get from local stats
      const localRoutes = await this.getLocalPopularRoutes(limit);
      if (localRoutes.length > 0) {
        return localRoutes;
      }
      
      // Fallback to API if no local data
      const response = await fetch(`${this.baseUrl}/api/routes/popular?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch popular routes');
      }

      const routes: RouteStats[] = await response.json();
      
      // Enhance with traffic data
      return routes.map(route => ({
        ...route,
        currentDelay: this.calculateCurrentDelay(route.routeId),
        alternativeRoutes: [] // Will be populated on demand
      }));
    } catch (error) {
      console.error('Error fetching popular routes:', error);
      // Return local routes even if API fails
      return this.getLocalPopularRoutes(limit);
    }
  }
  
  private async getLocalPopularRoutes(limit: number): Promise<RouteStats[]> {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // Get routes sorted by popularity for current time of day
    const routes = Object.entries(this.routeViewStats)
      .map(([routeId, stats]) => {
        const routeStats = this.routeStats.value[routeId];
        return {
          routeId,
          routeName: routeStats?.routeName || 'Unknown Route',
          averageRating: routeStats?.averageRating || 0,
          totalRides: stats.views,
          popularity: stats.timeOfDay[hour] || 0,
          averageDuration: routeStats?.averageDuration || 0,
          reliabilityScore: routeStats?.reliabilityScore || 1,
          peakHours: Object.entries(stats.timeOfDay).reduce((acc, [h, count]) => {
            if (count > (acc[h] || 0)) {
              acc[h] = count;
            }
            return acc;
          }, {} as Record<string, number>),
          lastUsed: stats.lastViewed.toISOString(),
          timeOfDay: stats.timeOfDay,
          dayOfWeek: stats.dayOfWeek,
          currentDelay: this.calculateCurrentDelay(routeId),
          alternativeRoutes: []
        } as RouteStats;
      })
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);

    return routes;
  }

  private calculateCurrentDelay(routeId: string): number {
    // Calculate current delay based on traffic conditions
    // This would use the trafficService to get real-time delays
    return 0; // Placeholder
  }

  cleanup(): void {
    if (this.trafficUpdateUnsubscribe) {
      this.trafficUpdateUnsubscribe();
    }
  }

  // Track when a route is viewed or used
  public trackRouteView = async (routeId: string, routeName: string, transportType: string): Promise<void> => {
    // Log the view to the server
    try {
      await fetch(`${this.baseUrl}/api/routes/${routeId}/view`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error tracking route view on server:', error);
      // Continue with local tracking even if server tracking fails
    }
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // Update route view statistics
    if (!this.routeViewStats[routeId]) {
      this.routeViewStats[routeId] = {
        views: 0,
        lastViewed: now,
        timeOfDay: {},
        dayOfWeek: {}
      };
    }

    const routeStats = this.routeViewStats[routeId];
    routeStats.views++;
    routeStats.lastViewed = now;
    routeStats.timeOfDay[hour] = (routeStats.timeOfDay[hour] || 0) + 1;
    routeStats.dayOfWeek[day] = (routeStats.dayOfWeek[day] || 0) + 1;

    // Update the BehaviorSubject with the new stats
    this.routeStats.next({
      ...this.routeStats.value,
      [routeId]: {
        routeId,
        routeName,
        totalRides: routeStats.views,
        lastUsed: now.toISOString(),
        timeOfDay: routeStats.timeOfDay,
        dayOfWeek: routeStats.dayOfWeek,
        // Add other required RouteStats properties with default values
        averageRating: 0,
        popularity: 0,
        averageDuration: 0,
        reliabilityScore: 1,
        peakHours: {},
      },
    });
  }

  // Get personalized route recommendations (legacy method)
  async getRecommendationsLocal(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    departureTime: Date = new Date()
  ): Promise<RouteSuggestion[]> {
    const result = await this.getRecommendations(origin, destination, departureTime);
    return [...result.primary, ...(result.alternatives || [])];
  }


}

// Export a single instance of the service
export const routeRecommendationService = RouteRecommendationService.getInstance();
