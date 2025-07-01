import { BehaviorSubject } from 'rxjs';
import { userPreferencesService, UserPreferences } from './userPreferences';

export interface RouteSuggestion {
  id: string;
  routeName: string;
  transportType: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  reliabilityScore: number;
  popularity: number;
  isFavorite: boolean;
}

export interface RouteStats {
  routeId: string;
  usageCount: number;
  lastUsed: Date | string; // Can be Date or ISO string
  averageRating?: number;
  timeOfDay: Record<string, number>; // Usage by hour
  dayOfWeek: Record<string, number>; // Usage by day
  // Fields from useUserPreferences.ts
  views?: number;
  lastViewed?: string;
}

class RouteRecommendationService {
  private routeStats = new BehaviorSubject<Record<string, RouteStats>>({});
  private userPreferences: UserPreferences | null = null;
  
  constructor() {
    // Subscribe to user preferences
    userPreferencesService.getPreferences().subscribe(prefs => {
      this.userPreferences = prefs;
    });
  }

  // Track when a route is viewed or used
  trackRouteView(routeId: string, routeName: string, transportType: string) {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    this.routeStats.next({
      ...this.routeStats.value,
      [routeId]: {
        routeId,
        usageCount: ((this.routeStats.value[routeId]?.usageCount) || 0) + 1,
        lastUsed: now,
        timeOfDay: {
          ...this.routeStats.value[routeId]?.timeOfDay,
          [hour]: ((this.routeStats.value[routeId]?.timeOfDay?.[hour]) || 0) + 1
        },
        dayOfWeek: {
          ...this.routeStats.value[routeId]?.dayOfWeek,
          [day]: ((this.routeStats.value[routeId]?.dayOfWeek?.[day]) || 0) + 1
        }
      }
    });
  }

  // Get personalized route recommendations
  async getRecommendations(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    departureTime: Date = new Date()
  ): Promise<RouteSuggestion[]> {
    // In a real app, this would call your backend API
    // For now, we'll return mock data based on user preferences and usage
    
    const hour = departureTime.getHours();
    const isPeakHours = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18);
    
    // Mock route data - in a real app, this would come from your backend
    const mockRoutes: RouteSuggestion[] = [
      {
        id: 'route-1',
        routeName: 'Bole to Mexico',
        transportType: 'bus',
        departureTime: '08:00 AM',
        arrivalTime: '08:45 AM',
        duration: '45 min',
        price: 15,
        reliabilityScore: 0.92,
        popularity: 0.85,
        isFavorite: this.userPreferences?.favoriteRoutes.includes('route-1') || false,
      },
      {
        id: 'route-2',
        routeName: 'Bole to Mexico via Bole Bridge',
        transportType: 'light_rail',
        departureTime: '08:15 AM',
        arrivalTime: '08:50 AM',
        duration: '35 min',
        price: 12,
        reliabilityScore: 0.95,
        popularity: 0.78,
        isFavorite: this.userPreferences?.favoriteRoutes.includes('route-2') || false,
      },
    ];

    // Sort by user preferences and time of day
    return mockRoutes.sort((a, b) => {
      // Prioritize preferred transport types
      const aPref = this.userPreferences?.preferredTransport.includes(a.transportType) ? 1 : 0;
      const bPref = this.userPreferences?.preferredTransport.includes(b.transportType) ? 1 : 0;
      
      if (aPref !== bPref) return bPref - aPref;
      
      // Then by reliability
      if (a.reliabilityScore !== b.reliabilityScore) 
        return b.reliabilityScore - a.reliabilityScore;
      
      // Then by duration
      return a.duration.localeCompare(b.duration);
    });
  }

  // Get popular routes based on time of day
  getPopularRoutes(limit: number = 3) {
    const routes = Object.values(this.routeStats.value);
    const now = new Date();
    const currentHour = now.getHours();
    
    return routes
      .sort((a, b) => {
        // Sort by usage count and time of day relevance
        const aScore = a.usageCount * (a.timeOfDay[currentHour] || 1);
        const bScore = b.usageCount * (b.timeOfDay[currentHour] || 1);
        return bScore - aScore;
      })
      .slice(0, limit);
  }
}

export const routeRecommendationService = new RouteRecommendationService();
