// User type
export interface SavedLocation {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  dateOfBirth: string;
  profilePicture: string;
  savedLocations?: SavedLocation[];
  otp?: string;
  otpExpires?: string;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Transit Stop type
export interface TransitStop {
  id: string;
  name: string;
  type: 'bus' | 'train' | 'taxi' | 'other';
  location: {
    latitude: number;
    longitude: number;
  };
  distance: number;
  routes: string[];
}

// Trip type
export interface Trip {
  id: string;
  userId: string;
  startLocation: {
    name: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  endLocation: {
    name: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  departureTime: string;
  arrivalTime?: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// Favorite type
export interface Favorite {
  id: string;
  userId: string;
  stopId: string;
  stopName: string;
  createdAt: string;
}

// Database schema
export interface Database {
  users: User[];
  transitStops: TransitStop[];
  trips: Trip[];
  favorites: Favorite[];
}
