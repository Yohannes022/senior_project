export interface Comment {
  id: string;
  user: string;
  rating: number;
  comment: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  date: string;
}

export interface VehicleStats {
  cleanliness: number;
  comfort: number;
  punctuality: number;
  safety: number;
}

export interface VehicleDetails {
  id: string;
  name: string;
  type: string;
  capacity: number;
  route: string;
  averageRating: number;
  totalRatings: number;
  comments: Comment[];
  stats: VehicleStats;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  nextStop?: string;
  lastMaintenance?: string;
  year?: number;
  plateNumber?: string;
  driver?: {
    name: string;
    contact: string;
    rating: number;
  };
}

export interface Trip {
  id: string;
  vehicleId: string;
  from: string;
  to: string;
  date: string;
  time: string;
  status: 'Completed' | 'Upcoming' | 'Cancelled';
  price: string;
  vehicle?: VehicleDetails;
}

export const vehicleDetails: Record<string, VehicleDetails> = {
  'bus-101': {
    id: 'bus-101',
    name: 'Bus #101',
    type: 'City Bus',
    capacity: 50,
    route: 'Bole - Piassa',
    averageRating: 4.2,
    totalRatings: 128,
    stats: {
      cleanliness: 4.3,
      comfort: 4.1,
      punctuality: 4.5,
      safety: 4.4,
    },
    currentLocation: {
      latitude: 9.0323,
      longitude: 38.7636,
    },
    nextStop: 'Megenagna',
    lastMaintenance: '2023-05-15',
    year: 2020,
    plateNumber: 'AA-101-AB',
    driver: {
      name: 'Alemayehu Kebede',
      contact: '+251 91 123 4567',
      rating: 4.6,
    },
    comments: [
      {
        id: 'c1',
        user: 'John D.',
        rating: 5,
        comment: 'Very comfortable ride with good AC. Driver was professional and careful.',
        sentiment: 'positive',
        date: '2023-06-10',
      },
      {
        id: 'c2',
        user: 'Sarah M.',
        rating: 4,
        comment: 'Good service but sometimes late in the morning.',
        sentiment: 'neutral',
        date: '2023-06-08',
      },
      {
        id: 'c3',
        user: 'Michael T.',
        rating: 3,
        comment: 'Bus was clean but the AC was not working properly.',
        sentiment: 'neutral',
        date: '2023-06-05',
      },
    ],
  },
  'bus-102': {
    id: 'bus-102',
    name: 'Bus #102',
    type: 'City Bus',
    capacity: 45,
    route: 'Megenagna - Mexico',
    averageRating: 4.0,
    totalRatings: 98,
    stats: {
      cleanliness: 4.0,
      comfort: 3.8,
      punctuality: 4.2,
      safety: 4.3,
    },
    year: 2019,
    plateNumber: 'AA-102-AB',
    comments: [],
  },
};

export const getVehicleDetails = (id: string): VehicleDetails | undefined => {
  return vehicleDetails[id];
};

export const recentTrips: Trip[] = [
  {
    id: '1',
    vehicleId: 'bus-101',
    from: 'Bole',
    to: 'Piassa',
    date: 'Today',
    time: '08:30 AM',
    status: 'Completed',
    price: '35 ETB',
    vehicle: vehicleDetails['bus-101'],
  },
  {
    id: '2',
    vehicleId: 'bus-102',
    from: 'Megenagna',
    to: 'Mexico Square',
    date: 'Yesterday',
    time: '02:15 PM',
    status: 'Completed',
    price: '25 ETB',
    vehicle: vehicleDetails['bus-102'],
  },
  {
    id: "8",
    vehicleId: "bus-108",
    from: "Stadium",
    to: "Bole",
    date: "May 20",
    time: "09:45 AM",
    status: "Cancelled",
    price: "40 ETB",
  },
];

export const popularDestinations = [
  {
    id: "1",
    name: "Bole International Airport",
    icon: "plane",
  },
  {
    id: "2",
    name: "Meskel Square",
    icon: "map-pin",
  },
  {
    id: "3",
    name: "Unity Park",
    icon: "tree",
  },
  {
    id: "4",
    name: "Merkato",
    icon: "shopping-bag",
  },
  {
    id: "5",
    name: "National Museum",
    icon: "landmark",
  },
  {
    id: "6",
    name: "Entoto Mountain",
    icon: "mountain",
  },
  {
    id: "7",
    name: "Unity Park",
    icon: "tree",
  },
  {
    id: "8",
    name: "Sheraton Addis",
    icon: "hotel",
  },
];

export interface NearbyVehicle {
  id: string;
  type: string;
  number: string;
  route: string;
  eta: string;
  crowdLevel?: string;
  distance: string;
  driver?: string;
  rating?: number;
  line?: string;
}

export const nearbyVehicles: NearbyVehicle[] = [
  {
    id: "1",
    type: "Bus",
    number: "105",
    route: "Bole to Piassa",
    eta: "3 min",
    crowdLevel: "Low",
    distance: "0.5 km",
  },
  {
    id: "2",
    type: "Taxi",
    number: "AET-1234",
    route: "Megenagna to Mexico",
    driver: "Alemu T.",
    rating: 4.8,
    eta: "5 min",
    distance: "0.8 km",
  },
  {
    id: "3",
    type: "Train",
    number: "",
    line: "Green Line",
    route: "East-West",
    eta: "7 min",
    crowdLevel: "Medium",
    distance: "1.2 km",
  },
  {
    id: "4",
    type: "Train",
    number: "",
    line: "Blue Line",
    route: "North-South",
    eta: "7 min",
    crowdLevel: "Medium",
    distance: "1.2 km",
  },
];

export interface Schedule {
  id: string;
  type: string;
  number: string;
  route: string;
  departures: string[];
  price: string;
  line?: string;
}

export const schedules: Schedule[] = [
  {
    id: "1",
    type: "Bus",
    number: "105",
    route: "Bole to Piassa",
    departures: ["06:00", "06:30", "07:00", "07:30", "08:00", "08:30"],
    price: "15 ETB",
  },
  {
    id: "2",
    type: "Bus",
    number: "72",
    route: "Megenagna to Mexico",
    departures: ["06:15", "06:45", "07:15", "07:45", "08:15", "08:45"],
    price: "12 ETB",
  },
  {
    id: "3",
    type: "Train",
    number: "",
    line: "Green Line",
    route: "East-West",
    departures: ["06:00", "06:20", "06:40", "07:00", "07:20", "07:40"],
    price: "10 ETB",
  },
  {
    id: "4",
    type: "Train",
    number: "",
    line: "Blue Line",
    route: "North-South",
    departures: ["06:00", "06:20", "06:40", "07:00", "07:20", "07:40"],
    price: "10 ETB",
  },
];
  
  export const userProfile = {
    name: "Abebe Kebede",
    phone: "+251 91 234 5678",
    email: "abebe@example.com",
    points: 350,
    level: "Silver",
    savedLocations: [
      { id: "1", name: "Home", address: "Bole, Addis Ababa" },
      { id: "2", name: "Work", address: "Kazanchis, Addis Ababa" },
      { id: "3", name: "Gym", address: "Meskel Square, Addis Ababa" },
    ],
  };