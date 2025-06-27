import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Route, 
  RoutePreferences, 
  RouteStep,
  TransitDetails,
  WalkingDetails,
  BikeDetails,
  RideshareDetails
} from '@/types/routing';

const USER_PREFS_KEY = '@user_preferences';
const USER_HISTORY_KEY = '@user_route_history';
const USER_FEEDBACK_KEY = '@user_feedback';

interface UserPreferences extends RoutePreferences {
  userId: string;
  preferredRoutes: string[];
  preferredTimes: {
    [dayOfWeek: number]: {
      start: string;
      end: string;
    }[];
  };
  comfortThreshold: number; // 0-1 scale for how much to prioritize comfort
  walkingDistancePreference: 'short' | 'moderate' | 'long';
  savedLocations: Array<{
    id: string;
    name: string;
    address: string;
    location: {
      latitude: number;
      longitude: number;
    };
  }>;
  accessibilityNeeds: {
    wheelchair: boolean;
    visualImpairment: boolean;
    hearingImpairment: boolean;
  };
  lastUpdated: string;
}

interface RouteHistory {
  routeId: string;
  timestamp: string;
  origin: string;
  destination: string;
  selected: boolean;
  feedback?: {
    rating: number;
    comments?: string;
    wasCrowded?: boolean;
    wasLate?: boolean;
  };
}

class UserPreferenceService {
  private preferences: UserPreferences | null = null;
  private routeHistory: RouteHistory[] = [];
  private feedback: Array<{ routeId: string; rating: number; comment?: string }> = [];

  /**
   * Initialize the service by loading user data
   */
  async initialize(userId: string): Promise<void> {
    try {
      await Promise.all([
        this.loadPreferences(userId),
        this.loadRouteHistory(),
        this.loadFeedback(),
      ]);
    } catch (error) {
      console.error('Failed to initialize user preference service:', error);
      // Initialize with default values if loading fails
      this.preferences = this.getDefaultPreferences(userId);
    }
  }

  /**
   * Get the current user preferences
   */
  getPreferences(): UserPreferences {
    if (!this.preferences) {
      throw new Error('User preferences not initialized');
    }
    return this.preferences;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(updates: Partial<UserPreferences>): Promise<void> {
    if (!this.preferences) {
      throw new Error('User preferences not initialized');
    }

    this.preferences = {
      ...this.preferences,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };

    await this.savePreferences();
  }

  /**
   * Get the first location name from a route step
   */
  private getStepStartLocation(step: RouteStep): string {
    if (!step.details) return 'Unknown';
    
    // Handle different step types
    if ('departureStop' in step.details) {
      // Transit step
      return step.details.departureStop?.name || 'Unknown Stop';
    } else if ('startLocation' in step.details) {
      // For walking, biking, or rideshare steps
      const loc = step.details.startLocation;
      // Format coordinates as fallback
      const coords = `(${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)})`;
      return coords;
    }
    
    return 'Unknown';
  }

  /**
   * Get the last location name from a route step
   */
  private getStepEndLocation(step: RouteStep): string {
    if (!step.details) return 'Unknown';
    
    // Handle different step types
    if ('arrivalStop' in step.details) {
      // Transit step
      return step.details.arrivalStop?.name || 'Unknown Stop';
    } else if ('endLocation' in step.details) {
      // For walking, biking, or rideshare steps
      const loc = step.details.endLocation;
      // Format coordinates as fallback
      const coords = `(${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)})`;
      return coords;
    } else if ('location' in step.details) {
      // For bike stations, use the location coordinates
      const loc = step.details as { location: { coords: { latitude: number; longitude: number } } };
      const coords = `(${loc.location.coords.latitude.toFixed(4)}, ${loc.location.coords.longitude.toFixed(4)})`;
      return coords;
    }
    
    return 'Unknown';
  }

  /**
   * Add a route to the user's history
   */
  async addToHistory(route: Route, selected: boolean): Promise<void> {
    // Get origin from first step
    const firstStep = route.steps[0];
    const lastStep = route.steps[route.steps.length - 1];
    
    const historyItem: RouteHistory = {
      routeId: route.id,
      timestamp: new Date().toISOString(),
      origin: firstStep ? this.getStepStartLocation(firstStep) : 'Unknown',
      destination: lastStep ? this.getStepEndLocation(lastStep) : 'Unknown',
      selected,
    };

    this.routeHistory.unshift(historyItem);
    
    // Keep only the last 100 history items
    if (this.routeHistory.length > 100) {
      this.routeHistory = this.routeHistory.slice(0, 100);
    }

    await this.saveRouteHistory();
  }

  /**
   * Add user feedback for a route
   */
  async addFeedback(routeId: string, rating: number, comment?: string): Promise<void> {
    this.feedback.push({ routeId, rating, comment });
    await this.saveFeedback();
    
    // Update preferences based on feedback
    await this.analyzeFeedback();
  }

  /**
   * Get personalized route preferences based on user behavior
   */
  getPersonalizedPreferences(): RoutePreferences {
    if (!this.preferences) {
      return {};
    }

    const { accessibilityNeeds, comfortThreshold, walkingDistancePreference } = this.preferences;
    
    // Calculate max walk distance based on preference
    const maxWalkDistance = {
      short: 500,    // 500m
      moderate: 1000, // 1km
      long: 2000,    // 2km
    }[walkingDistancePreference || 'moderate'];

    return {
      maxWalkDistance,
      accessibility: {
        ...accessibilityNeeds,
      },
      avoidCrowds: comfortThreshold > 0.7,
      prioritizeSpeed: comfortThreshold < 0.3,
    };
  }

  /**
   * Get user's most frequent routes
   */
  getFrequentRoutes(limit = 3): Array<{ routeId: string; count: number }> {
    const routeCounts = this.routeHistory.reduce((acc, { routeId }) => {
      acc[routeId] = (acc[routeId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(routeCounts)
      .map(([routeId, count]) => ({ routeId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get user's preferred travel times
   */
  getPreferredTravelTimes() {
    // Analyze history to find preferred travel times
    const timeSlots: Record<string, number> = {};
    
    this.routeHistory.forEach(({ timestamp }) => {
      const hour = new Date(timestamp).getHours();
      const timeSlot = `${Math.floor(hour / 2) * 2}:00-${Math.floor(hour / 2) * 2 + 2}:00`;
      timeSlots[timeSlot] = (timeSlots[timeSlot] || 0) + 1;
    });

    return Object.entries(timeSlots)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([timeSlot]) => timeSlot);
  }

  private async loadPreferences(userId: string): Promise<void> {
    try {
      const jsonValue = await AsyncStorage.getItem(`${USER_PREFS_KEY}:${userId}`);
      this.preferences = jsonValue != null 
        ? JSON.parse(jsonValue) 
        : this.getDefaultPreferences(userId);
    } catch (e) {
      console.error('Failed to load preferences', e);
      this.preferences = this.getDefaultPreferences(userId);
    }
  }

  private async loadRouteHistory(): Promise<void> {
    try {
      const jsonValue = await AsyncStorage.getItem(USER_HISTORY_KEY);
      this.routeHistory = jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Failed to load route history', e);
      this.routeHistory = [];
    }
  }

  private async loadFeedback(): Promise<void> {
    try {
      const jsonValue = await AsyncStorage.getItem(USER_FEEDBACK_KEY);
      this.feedback = jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error('Failed to load feedback', e);
      this.feedback = [];
    }
  }

  private async savePreferences(): Promise<void> {
    if (!this.preferences) return;
    
    try {
      await AsyncStorage.setItem(
        `${USER_PREFS_KEY}:${this.preferences.userId}`,
        JSON.stringify(this.preferences)
      );
    } catch (e) {
      console.error('Failed to save preferences', e);
    }
  }

  private async saveRouteHistory(): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_HISTORY_KEY, JSON.stringify(this.routeHistory));
    } catch (e) {
      console.error('Failed to save route history', e);
    }
  }

  private async saveFeedback(): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_FEEDBACK_KEY, JSON.stringify(this.feedback));
    } catch (e) {
      console.error('Failed to save feedback', e);
    }
  }

  private async analyzeFeedback(): Promise<void> {
    if (!this.preferences || this.feedback.length === 0) return;

    // Analyze feedback to update preferences
    const negativeFeedback = this.feedback.filter(f => f.rating < 3);
    const positiveFeedback = this.feedback.filter(f => f.rating >= 4);

    // Update comfort threshold based on feedback
    const comfortScores = this.feedback
      .filter(f => f.comment?.toLowerCase().includes('crowd') || f.comment?.toLowerCase().includes('busy'))
      .map(f => f.rating);
    
    if (comfortScores.length > 0) {
      const avgComfortScore = comfortScores.reduce((a, b) => a + b, 0) / comfortScores.length;
      // Lower score means more negative feedback about crowding
      const newComfortThreshold = Math.min(1, Math.max(0, this.preferences.comfortThreshold + (avgComfortScore - 2.5) * 0.1));
      
      await this.updatePreferences({
        comfortThreshold: parseFloat(newComfortThreshold.toFixed(2))
      });
    }
  }

  private getDefaultPreferences(userId: string): UserPreferences {
    return {
      userId,
      preferredRoutes: [],
      preferredTimes: {},
      comfortThreshold: 0.5,
      walkingDistancePreference: 'moderate',
      savedLocations: [],
      accessibilityNeeds: {
        wheelchair: false,
        visualImpairment: false,
        hearingImpairment: false,
      },
      lastUpdated: new Date().toISOString(),
    };
  }
}

export const userPreferenceService = new UserPreferenceService();
