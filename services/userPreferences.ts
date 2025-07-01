import AsyncStorage from '@react-native-async-storage/async-storage';
import { BehaviorSubject } from 'rxjs';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  favoriteRoutes: string[];
  preferredTransport: string[];
  notificationPreferences: {
    tripUpdates: boolean;
    serviceAlerts: boolean;
    promotions: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    screenReader: boolean;
  };
  visualAccessibility?: {
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
    reduceMotion: boolean;
    colorBlindMode: boolean;
  };
  usageStats: {
    lastUsed: Date;
    tripsCompleted: number;
    favoriteStations: string[];
  };
  modes?: {
    [key: string]: boolean;
  };
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  language: 'en',
  favoriteRoutes: [],
  preferredTransport: ['bus', 'light_rail'],
  notificationPreferences: {
    tripUpdates: true,
    serviceAlerts: true,
    promotions: false,
  },
  accessibility: {
    fontSize: 'medium',
    highContrast: false,
    screenReader: false,
  },
  usageStats: {
    lastUsed: new Date(),
    tripsCompleted: 0,
    favoriteStations: [],
  },
};

const PREFERENCES_KEY = '@ShegerTransit:userPreferences';

class UserPreferencesService {
  private preferencesSubject = new BehaviorSubject<UserPreferences>(DEFAULT_PREFERENCES);
  
  constructor() {
    this.loadPreferences();
  }

  private async loadPreferences() {
    try {
      const json = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (json) {
        const saved = JSON.parse(json);
        // Merge with defaults to ensure all fields exist
        this.preferencesSubject.next({ ...DEFAULT_PREFERENCES, ...saved });
      }
    } catch (error) {
      console.error('Failed to load preferences', error);
    }
  }

  private async savePreferences(prefs: UserPreferences) {
    try {
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
      this.preferencesSubject.next(prefs);
    } catch (error) {
      console.error('Failed to save preferences', error);
    }
  }

  // Get current preferences
  getPreferences() {
    return this.preferencesSubject.asObservable();
  }

  // Update specific preference fields
  async updatePreferences(updates: Partial<UserPreferences>) {
    const current = this.preferencesSubject.value;
    const updated = { ...current, ...updates };
    await this.savePreferences(updated);
  }

  // Track trip completion
  async trackTripCompletion(routeId: string, stationId: string) {
    const current = this.preferencesSubject.value;
    const updatedStats = {
      ...current.usageStats,
      lastUsed: new Date(),
      tripsCompleted: (current.usageStats.tripsCompleted || 0) + 1,
      favoriteStations: this.updateFavorites(
        current.usageStats.favoriteStations || [],
        stationId
      ),
    };
    
    await this.updatePreferences({
      usageStats: updatedStats,
      favoriteRoutes: this.updateFavorites(
        current.favoriteRoutes || [],
        routeId
      ),
    });
  }

  private updateFavorites(current: string[], newItem: string): string[] {
    const updated = current.filter(id => id !== newItem);
    updated.unshift(newItem);
    return updated.slice(0, 5); // Keep only top 5
  }

  // Update visual accessibility preferences
  async updateVisualAccessibility(userId: string, updates: Partial<UserPreferences['accessibility']>) {
    const current = this.preferencesSubject.value;
    const updatedAccessibility = {
      ...current.accessibility,
      ...updates
    };
    
    await this.updatePreferences({
      accessibility: updatedAccessibility
    });
  }
}

export const userPreferencesService = new UserPreferencesService();
