import * as geofire from 'geofire-common';

// Note: Firebase v9+ uses tree-shakable imports
// We'll import Firebase modules dynamically where needed to support both client and server-side rendering

type VehiclePosition = {
  vehicleId: string;
  routeId: string;
  position: {
    lat: number;
    lng: number;
    bearing?: number;
    speed?: number;
  };
  timestamp: number;
  nextStop?: string;
  occupancy?: 'low' | 'medium' | 'high';
};

class RealtimeTrackingService {
  private static instance: RealtimeTrackingService;
  private db: any;
  private geoFire: any;
  private vehiclePositions: Map<string, VehiclePosition> = new Map();
  private subscribers: Array<(vehicles: VehiclePosition[]) => void> = [];

  private constructor() {
    // Initialize Firebase
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };

    // Import Firebase modules
    const { initializeApp } = require('firebase/app');
    const { getDatabase } = require('firebase/database');

    const app = initializeApp(firebaseConfig);
    this.db = getDatabase(app);
  }

  public static getInstance(): RealtimeTrackingService {
    if (!RealtimeTrackingService.instance) {
      RealtimeTrackingService.instance = new RealtimeTrackingService();
    }
    return RealtimeTrackingService.instance;
  }

  // Subscribe to vehicle position updates
  public subscribeToVehiclePositions(
    routeId: string,
    callback: (vehicles: VehiclePosition[]) => void
  ): () => void {
    const { ref, onValue, off } = require('firebase/database');
    const routeRef = ref(this.db, `vehiclePositions/${routeId}`);
    
    const onPositionUpdate = (snapshot: any) => {
      const positions: VehiclePosition[] = [];
      snapshot.forEach((childSnapshot: any) => {
        positions.push({
          vehicleId: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      callback(positions);
    };

    // Set up the listener
    onValue(routeRef, onPositionUpdate);
    
    // Return unsubscribe function
    return () => {
      off(routeRef, 'value', onPositionUpdate);
    };
  }

  // Update vehicle position (for vehicle clients)
  public async updateVehiclePosition(vehicleId: string, position: VehiclePosition): Promise<void> {
    const { lat, lng } = position.position;
    const hash = geofire.geohashForLocation([lat, lng]);
    const { ref, set } = await import('firebase/database');
    
    const positionRef = ref(this.db, `vehiclePositions/${position.routeId}/${vehicleId}`);
    await set(positionRef, {
      ...position,
      _geohash: hash,
      _timestamp: Date.now()
    });
  }

  // Get vehicles within a radius (in km)
  public async getVehiclesInRadius(
    center: { lat: number; lng: number },
    radiusInKm: number
  ): Promise<VehiclePosition[]> {
    const bounds = geofire.geohashQueryBounds([center.lat, center.lng], radiusInKm * 1000);
    const promises: Promise<any>[] = [];
    
    // Import query functions from Firebase
    const { query, orderByChild, startAt, endAt, get, ref } = await import('firebase/database');
    
    // Query all GeoFire hashes in the bounds
    bounds.forEach((b) => {
      const dbRef = ref(this.db, 'vehiclePositions');
      const q = query(
        dbRef,
        orderByChild('_geohash'),
        startAt(b[0]),
        endAt(b[1])
      );
      
      promises.push(
        get(q).then((snapshot) => {
          const results: VehiclePosition[] = [];
          snapshot.forEach((child) => {
            results.push({
              vehicleId: child.key || '',
              ...child.val()
            });
          });
          return results;
        })
      );
    });

    // Collect all the query results
    const snapshots = await Promise.all(promises);
    const matchingVehicles: VehiclePosition[] = [];
    
    // Filter for vehicles within the radius
    snapshots.forEach((vehicles) => {
      vehicles.forEach((vehicle: any) => {
        const distance = geofire.distanceBetween(
          [vehicle.position.lat, vehicle.position.lng],
          [center.lat, center.lng]
        );
        
        if (distance <= radiusInKm) {
          matchingVehicles.push(vehicle);
        }
      });
    });
    
    return matchingVehicles;
  }

  // Calculate ETA between two points
  public calculateETA(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    vehicleSpeed: number = 40 // km/h
  ): number {
    // Using Haversine formula for distance calculation
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(destination.lat - origin.lat);
    const dLon = this.toRad(destination.lng - origin.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(origin.lat)) * Math.cos(this.toRad(destination.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    
    // ETA in minutes
    return (distance / vehicleSpeed) * 60;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const realtimeTrackingService = RealtimeTrackingService.getInstance();
