import { TransitRoute, TransitStop, TransitVehicle } from '@/types';

export const transitStops: TransitStop[] = [
  {
    id: 'stop1',
    name: 'Meskel Square',
    location: {
      latitude: 9.0105,
      longitude: 38.7651,
      address: 'Meskel Square, Addis Ababa'
    },
    routes: ['route1', 'route2', 'route3']
  },
  {
    id: 'stop2',
    name: 'Bole International Airport',
    location: {
      latitude: 8.9778,
      longitude: 38.7989,
      address: 'Bole Road, Addis Ababa'
    },
    routes: ['route1', 'route3']
  },
  {
    id: 'stop3',
    name: 'Merkato',
    location: {
      latitude: 9.0356,
      longitude: 38.7468,
      address: 'Merkato, Addis Ababa'
    },
    routes: ['route2', 'route4']
  },
  {
    id: 'stop4',
    name: 'Piazza',
    location: {
      latitude: 9.0341,
      longitude: 38.7529,
      address: 'Piazza, Addis Ababa'
    },
    routes: ['route1', 'route5']
  },
  {
    id: 'stop5',
    name: 'Mexico Square',
    location: {
      latitude: 9.0062,
      longitude: 38.7618,
      address: 'Mexico Square, Addis Ababa'
    },
    routes: ['route3', 'route4']
  },
  {
    id: 'stop6',
    name: 'Megenagna',
    location: {
      latitude: 9.0204,
      longitude: 38.8004,
      address: 'Megenagna, Addis Ababa'
    },
    routes: ['route2', 'route5']
  }
];

export const transitRoutes: TransitRoute[] = [
  {
    id: 'route1',
    name: 'Blue Line',
    type: 'bus',
    color: '#3B82F6',
    stops: transitStops.filter(stop => stop.routes.includes('route1')),
    frequency: 15
  },
  {
    id: 'route2',
    name: 'Red Line',
    type: 'bus',
    color: '#EF4444',
    stops: transitStops.filter(stop => stop.routes.includes('route2')),
    frequency: 20
  },
  {
    id: 'route3',
    name: 'Express Bus 38',
    type: 'bus',
    color: '#10B981',
    stops: transitStops.filter(stop => stop.routes.includes('route3')),
    frequency: 25
  },
  {
    id: 'route4',
    name: 'Local Bus 22',
    type: 'bus',
    color: '#F59E0B',
    stops: transitStops.filter(stop => stop.routes.includes('route4')),
    frequency: 30
  },
  {
    id: 'route5',
    name: 'Light Rail',
    type: 'tram',
    color: '#8B5CF6',
    stops: transitStops.filter(stop => stop.routes.includes('route5')),
    frequency: 12
  }
];

export const transitVehicles: TransitVehicle[] = [
  {
    id: 'vehicle1',
    routeId: 'route1',
    location: {
      latitude: 9.0125,
      longitude: 38.7671
    },
    heading: 45,
    speed: 30,
    occupancy: 'medium',
    nextStop: 'stop2',
    estimatedArrival: new Date(Date.now() + 3 * 60000).toISOString(),
    availableSeats: 8
  },
  {
    id: 'vehicle2',
    routeId: 'route2',
    location: {
      latitude: 9.0366,
      longitude: 38.7488
    },
    heading: 90,
    speed: 25,
    occupancy: 'high',
    nextStop: 'stop3',
    estimatedArrival: new Date(Date.now() + 5 * 60000).toISOString(),
    availableSeats: 3
  },
  {
    id: 'vehicle3',
    routeId: 'route3',
    location: {
      latitude: 9.0082,
      longitude: 38.7638
    },
    heading: 180,
    speed: 20,
    occupancy: 'low',
    nextStop: 'stop5',
    estimatedArrival: new Date(Date.now() + 7 * 60000).toISOString(),
    availableSeats: 12
  },
  {
    id: 'vehicle4',
    routeId: 'route4',
    location: {
      latitude: 9.0346,
      longitude: 38.7488
    },
    heading: 270,
    speed: 15,
    occupancy: 'medium',
    nextStop: 'stop3',
    estimatedArrival: new Date(Date.now() + 10 * 60000).toISOString(),
    availableSeats: 6
  },
  {
    id: 'vehicle5',
    routeId: 'route5',
    location: {
      latitude: 9.0331,
      longitude: 38.7549
    },
    heading: 0,
    speed: 22,
    occupancy: 'low',
    nextStop: 'stop6',
    estimatedArrival: new Date(Date.now() + 8 * 60000).toISOString(),
    availableSeats: 15
  }
];

export const suggestedLocations = [
  {
    name: "Work",
    address: "Kazanchis, Addis Ababa",
    latitude: 9.0167,
    longitude: 38.7792
  },
  {
    name: "Home",
    address: "Bole, Addis Ababa",
    latitude: 9.0092,
    longitude: 38.7885
  },
  {
    name: "Addis Ababa University",
    address: "Sidist Kilo, Addis Ababa",
    latitude: 9.0399,
    longitude: 38.7651
  },
  {
    name: "Entoto Park",
    address: "Entoto, Addis Ababa",
    latitude: 9.0847,
    longitude: 38.7633
  },
  {
    name: "Bole International Airport",
    address: "Bole Road, Addis Ababa",
    latitude: 8.9778,
    longitude: 38.7989
  }
];

export const sampleRoutes = [
  {
    id: 'route1',
    segments: [
      {
        type: 'walk',
        duration: 5,
        distance: 400,
        from: {
          latitude: 9.0105,
          longitude: 38.7651,
          name: 'Current Location'
        },
        to: {
          latitude: 9.0105,
          longitude: 38.7651,
          name: 'Meskel Square'
        }
      },
      {
        type: 'transit',
        duration: 12,
        route: transitRoutes[0],
        from: {
          latitude: 9.0105,
          longitude: 38.7651,
          name: 'Meskel Square'
        },
        to: {
          latitude: 9.0341,
          longitude: 38.7529,
          name: 'Piazza'
        },
        departureTime: new Date(Date.now() + 5 * 60000).toISOString(),
        arrivalTime: new Date(Date.now() + 17 * 60000).toISOString()
      },
      {
        type: 'walk',
        duration: 3,
        distance: 250,
        from: {
          latitude: 9.0341,
          longitude: 38.7529,
          name: 'Piazza'
        },
        to: {
          latitude: 9.0351,
          longitude: 38.7539,
          name: 'Destination'
        }
      }
    ],
    totalDuration: 20,
    totalDistance: 650,
    fare: 25,
    departureTime: new Date(Date.now()).toISOString(),
    arrivalTime: new Date(Date.now() + 20 * 60000).toISOString(),
    availableSeats: 8
  },
  {
    id: 'route2',
    segments: [
      {
        type: 'walk',
        duration: 7,
        distance: 550,
        from: {
          latitude: 9.0105,
          longitude: 38.7651,
          name: 'Current Location'
        },
        to: {
          latitude: 9.0062,
          longitude: 38.7618,
          name: 'Mexico Square'
        }
      },
      {
        type: 'transit',
        duration: 8,
        route: transitRoutes[2],
        from: {
          latitude: 9.0062,
          longitude: 38.7618,
          name: 'Mexico Square'
        },
        to: {
          latitude: 9.0204,
          longitude: 38.8004,
          name: 'Megenagna'
        },
        departureTime: new Date(Date.now() + 7 * 60000).toISOString(),
        arrivalTime: new Date(Date.now() + 15 * 60000).toISOString()
      },
      {
        type: 'walk',
        duration: 4,
        distance: 300,
        from: {
          latitude: 9.0204,
          longitude: 38.8004,
          name: 'Megenagna'
        },
        to: {
          latitude: 9.0214,
          longitude: 38.8014,
          name: 'Destination'
        }
      }
    ],
    totalDuration: 19,
    totalDistance: 850,
    fare: 20,
    departureTime: new Date(Date.now()).toISOString(),
    arrivalTime: new Date(Date.now() + 19 * 60000).toISOString(),
    availableSeats: 3
  }
];

export const sampleTickets = [
  {
    id: 'ticket1',
    type: 'single',
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    routes: ['route1', 'route2', 'route3', 'route4', 'route5'],
    price: 25,
    isActive: true,
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TICKET-12345',
    seatNumber: 'A12'
  },
  {
    id: 'ticket2',
    type: 'day',
    validFrom: new Date().toISOString(),
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    routes: ['route1', 'route2', 'route3', 'route4', 'route5'],
    price: 50,
    isActive: true,
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TICKET-67890',
    seatNumber: 'B05'
  },
  {
    id: 'ticket3',
    type: 'week',
    validFrom: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    routes: ['route1', 'route2', 'route3', 'route4', 'route5'],
    price: 250,
    isActive: true,
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TICKET-24680',
    seatNumber: 'C08'
  }
];

export const rideHistory = [
  {
    id: 'ride1',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    route: sampleRoutes[0],
    fare: 25,
    status: 'completed',
    seatNumber: 'A15'
  },
  {
    id: 'ride2',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    route: sampleRoutes[1],
    fare: 20,
    status: 'completed',
    seatNumber: 'B22'
  },
  {
    id: 'ride3',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    route: sampleRoutes[0],
    fare: 25,
    status: 'upcoming',
    seatNumber: 'C10'
  }
];