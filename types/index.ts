export interface Location {
    latitude: number;
    longitude: number;
    address?: string;
    name?: string;
  }
  
  export interface TransitStop {
    id: string;
    name: string;
    location: Location;
    routes: string[];
  }
  
  export interface TransitRoute {
    id: string;
    name: string;
    type: 'bus' | 'train' | 'subway' | 'tram' | 'ferry';
    color: string;
    stops: TransitStop[];
    frequency: number; // in minutes
  }
  
  export interface TransitVehicle {
    id: string;
    routeId: string;
    location: Location;
    heading: number;
    speed: number;
    occupancy: 'low' | 'medium' | 'high';
    nextStop: string;
    estimatedArrival: string;
    availableSeats?: number;
  }
  
  export interface RouteSegment {
    type: 'walk' | 'transit' | 'wait';
    duration: number; // in minutes
    distance?: number; // in meters, for walking
    route?: TransitRoute;
    from: Location;
    to: Location;
    departureTime?: string;
    arrivalTime?: string;
  }
  
  export interface Route {
    id: string;
    segments: RouteSegment[];
    totalDuration: number;
    totalDistance: number;
    fare: number;
    departureTime: string;
    arrivalTime: string;
    availableSeats?: number;
  }
  
  export interface Seat {
    id: string;
    number: string;
    status: 'available' | 'reserved' | 'occupied';
    position: {
      row: number;
      column: number;
    };
  }
  
  export interface Ticket {
    id: string;
    type: 'single' | 'return' | 'day' | 'week' | 'month';
    validFrom: string;
    validUntil: string;
    routes: string[];
    price: number;
    isActive: boolean;
    qrCode: string;
    seatNumber?: string;
  }
  
  export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    profilePicture?: string;
    favoriteLocations: Location[];
    paymentMethods: PaymentMethod[];
  }
  
  export interface PaymentMethod {
    id: string;
    type: 'card' | 'paypal' | 'applepay' | 'googlepay' | 'telebirr';
    lastFour?: string;
    expiryDate?: string;
    isDefault: boolean;
  }
  
  export interface RideHistory {
    id: string;
    date: string;
    route: Route;
    fare: number;
    status: 'completed' | 'cancelled' | 'upcoming';
    seatNumber?: string;
  }