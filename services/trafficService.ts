import { LocationObject } from 'expo-location';

export interface TrafficConditions {
  timestamp: Date;
  segments: TrafficSegment[];
}

export interface TrafficSegment {
  start: LocationObject;
  end: LocationObject;
  speed: number; // in km/h
  congestionLevel: 'free_flow' | 'light' | 'moderate' | 'heavy' | 'severe';
  incidents: TrafficIncident[];
}

export interface TrafficIncident {
  type: 'accident' | 'construction' | 'hazard' | 'congestion' | 'event';
  description: string;
  startTime: Date;
  endTime?: Date;
  severity: 'low' | 'medium' | 'high';
  location: LocationObject;
  affectedRoutes?: string[];
}

class TrafficService {
  private static instance: TrafficService;
  private trafficData: TrafficConditions | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: ((data: TrafficConditions) => void)[] = [];

  private constructor() {}

  static getInstance(): TrafficService {
    if (!TrafficService.instance) {
      TrafficService.instance = new TrafficService();
    }
    return TrafficService.instance;
  }

  async initialize(updateIntervalMs: number = 300000): Promise<void> {
    // Initial data load
    await this.fetchTrafficData();
    
    // Set up periodic updates
    this.updateInterval = setInterval(
      () => this.fetchTrafficData(),
      updateIntervalMs
    );
  }

  private async fetchTrafficData(): Promise<void> {
    try {
      // TODO: Replace with actual API call to traffic data provider
      // For now, we'll use mock data
      this.trafficData = {
        timestamp: new Date(),
        segments: [] // Mock data would go here
      };
      
      // Notify subscribers
      this.notifySubscribers();
    } catch (error) {
      console.error('Failed to fetch traffic data:', error);
    }
  }

  subscribe(callback: (data: TrafficConditions) => void): () => void {
    this.subscribers.push(callback);
    
    // Send current data immediately if available
    if (this.trafficData) {
      callback(this.trafficData);
    }
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers(): void {
    if (!this.trafficData) return;
    
    for (const subscriber of this.subscribers) {
      try {
        subscriber(this.trafficData);
      } catch (error) {
        console.error('Error notifying subscriber:', error);
      }
    }
  }

  getCurrentTraffic(): TrafficConditions | null {
    return this.trafficData;
  }

  cleanup(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.subscribers = [];
  }
}

export const trafficService = TrafficService.getInstance();
