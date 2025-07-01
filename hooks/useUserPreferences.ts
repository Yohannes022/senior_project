import { useState, useEffect, useCallback } from 'react';
import { userPreferenceService } from '@/services/userPreferenceService';
import { Route, RoutePreferences } from '@/types/routing';

interface UseUserPreferencesProps {
  userId: string;
  initialPreferences?: Partial<RoutePreferences>;
}

export const useUserPreferences = ({ userId, initialPreferences = {} }: UseUserPreferencesProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [preferences, setPreferences] = useState<RoutePreferences>(() => ({
    // Route planning preferences
    maxWalkDistance: 1000, // Default to 1km
    maxTransfers: 3, // Default max transfers
    avoidCrowds: false,
    prioritizeSpeed: false,
    maxPrice: undefined,
    
    // Transport modes
    modes: {
      transit: true,
      walking: true,
      bike: true,
      rideshare: true,
    },
    
    // Accessibility settings
    accessibility: {
      wheelchair: false,
      stepFreeAccess: false,
      elevatorFreeAccess: false,
    },
    
    // Visual accessibility settings
    visualAccessibility: {
      fontSize: 'medium',
      highContrast: false,
      screenReader: false,
    },
    
    // UI preferences
    theme: 'system',
    language: 'en',
    favoriteRoutes: [],
    preferredTransport: ['bus', 'train'],
    notificationPreferences: {
      email: true,
      push: true,
      sms: false,
    },
    
    // Apply any initial preferences last to allow overrides
    ...initialPreferences,
  }));

  // Initialize the service and load preferences
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        await userPreferenceService.initialize(userId);
        const userPrefs = userPreferenceService.getPersonalizedPreferences();
        setPreferences(prev => ({
          ...prev,
          ...userPrefs,
          // Don't override explicitly provided initial preferences
          ...initialPreferences,
        }));
      } catch (err) {
        console.error('Failed to initialize user preferences:', err);
        setError(err instanceof Error ? err : new Error('Failed to load preferences'));
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [userId, JSON.stringify(initialPreferences)]);

  // Update a specific preference
  const updatePreference = useCallback(async <K extends keyof RoutePreferences>(
    key: K,
    value: RoutePreferences[K]
  ) => {
    try {
      setIsLoading(true);
      setPreferences(prev => ({
        ...prev,
        [key]: value,
      }));
      
      // Update the service
      await userPreferenceService.updatePreferences({
        [key]: value,
      });
    } catch (err) {
      console.error('Failed to update preference:', err);
      setError(err instanceof Error ? err : new Error('Failed to update preference'));
      // Revert on error
      setPreferences(prev => ({
        ...prev,
        [key]: preferences[key],
      }));
    } finally {
      setIsLoading(false);
    }
  }, [preferences]);

  // Add a route to the user's history
  const addToHistory = useCallback(async (route: Route, selected: boolean) => {
    try {
      await userPreferenceService.addToHistory(route, selected);
      
      // If the route was selected, we might want to update preferences
      if (selected) {
        const updatedPrefs = userPreferenceService.getPersonalizedPreferences();
        setPreferences(prev => ({
          ...prev,
          ...updatedPrefs,
        }));
      }
    } catch (err) {
      console.error('Failed to add route to history:', err);
      // Don't show error to user for history tracking failures
    }
  }, []);

  // Add user feedback for a route
  const addFeedback = useCallback(async (routeId: string, rating: number, comment?: string) => {
    try {
      await userPreferenceService.addFeedback(routeId, rating, comment);
      
      // Update preferences based on the new feedback
      const updatedPrefs = userPreferenceService.getPersonalizedPreferences();
      setPreferences(prev => ({
        ...prev,
        ...updatedPrefs,
      }));
    } catch (err) {
      console.error('Failed to add feedback:', err);
      throw err; // Let the calling component handle this error
    }
  }, []);

  // Get user's most frequent routes
  const getFrequentRoutes = useCallback((limit = 3) => {
    return userPreferenceService.getFrequentRoutes(limit);
  }, []);

  // Get user's preferred travel times
  const getPreferredTravelTimes = useCallback(() => {
    return userPreferenceService.getPreferredTravelTimes();
  }, []);

  return {
    preferences,
    isLoading,
    error,
    updatePreference,
    addToHistory,
    addFeedback,
    getFrequentRoutes,
    getPreferredTravelTimes,
  };
};

// Helper hook to access user preferences in any component
export const useUserPreferencesContext = () => {
  // This would typically use a Context provider in a real app
  // For simplicity, we're just reusing the hook with a stored user ID
  const userId = 'current-user'; // In a real app, get this from auth context
  return useUserPreferences({ userId });
};
