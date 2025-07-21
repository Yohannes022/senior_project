import { FirebaseApp, initializeApp } from 'firebase/app';
import { Firestore, getFirestore, collection, doc, setDoc, serverTimestamp, writeBatch, enableIndexedDbPersistence } from 'firebase/firestore';

// Helper function to log with timestamp
const log = (message: string) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};
import { firebaseConfig } from '../config/firebase';

// Debug logging
console.log('🔍 Initializing Firebase with config:', {
  ...firebaseConfig,
  apiKey: '***', // Don't log the full API key
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId
});

// Initialize Firebase with error handling
log('🚀 Starting Firebase initialization...');
let app: FirebaseApp;
try {
  log('Initializing Firebase app...');
  app = initializeApp(firebaseConfig);
  log('✅ Firebase app initialized');
} catch (error: unknown) {
  console.error('❌ Failed to initialize Firebase:');
  
  // Type guard to check if error is an instance of Error
  if (error instanceof Error) {
    console.error(error.message);
    // Type assertion for Firebase error with code
    const firebaseError = error as { code?: string };
    if (firebaseError.code === 'app/duplicate-app') {
      console.log('ℹ️ Firebase app was already initialized');
      app = initializeApp(firebaseConfig, 'secondary');
    } else {
      console.error('Failed to initialize Firebase app');
      process.exit(1);
    }
  } else {
    console.error('An unknown error occurred');
    process.exit(1);
  }
}

// Initialize Firestore with settings
log('Initializing Firestore...');
const db = getFirestore(app);
log('🔌 Firestore instance created');

// Set Firestore settings
const settings = { ignoreUndefinedProperties: true };
log(`Firestore settings: ${JSON.stringify(settings)}`);

// Enable offline persistence (optional but recommended)
try {
  console.log('🔄 Enabling offline persistence...');
  await enableIndexedDbPersistence(db, {
    forceOwnership: false
  });
  console.log('✅ Offline persistence enabled');
} catch (error: unknown) {
  if (error instanceof Error) {
    const err = error as { code?: string };
    if (err.code === 'failed-precondition') {
    console.warn('⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('⚠️ The current browser does not support all of the features required to enable persistence.');
  }
  console.log('ℹ️ Using default online mode');
  }
}

// Helper function to add a document to a collection
const addDocument = async (collectionName: string, id: string, data: any) => {
  try {
    await setDoc(doc(db, collectionName, id), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`✅ Added document ${id} to ${collectionName}`);
  } catch (error) {
    console.error(`❌ Error adding document to ${collectionName}:`, error);
  }
};

// Initialize all collections with sample data
const initializeDatabase = async () => {
  console.log('Starting database initialization...');
  
  // 1. Add sample users
  const users = [
    {
      id: 'user1',
      name: 'Admin User',
      email: 'admin@shegertransit.com',
      role: 'admin',
      phone: '+251911223344',
      preferences: {
        language: 'en',
        theme: 'system',
        notificationEnabled: true
      },
      walletBalance: 1000,
emailVerified: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    {
      id: 'user2',
      name: 'John Passenger',
      email: 'john@example.com',
      role: 'passenger',
      phone: '+251911223355',
      preferences: {
        language: 'am',
        theme: 'light',
        notificationEnabled: true
      },
      walletBalance: 500
    }
  ];

  // 2. Add sample vehicles
  const vehicles = [
    {
      id: 'vehicle1',
      name: 'Bus #101',
      type: 'bus',
      capacity: 50,
      plateNumber: 'AA1234',
      year: 2022,
      lastMaintenance: serverTimestamp(),
      status: 'active',
      currentLocation: {
        latitude: 9.005401,
        longitude: 38.763611,
        lastUpdated: serverTimestamp()
      },
      currentRouteId: 'route1'
    },
    {
      id: 'vehicle2',
      name: 'Minibus #201',
      type: 'minibus',
      capacity: 14,
      plateNumber: 'BB5678',
      year: 2023,
      lastMaintenance: serverTimestamp(),
      status: 'active',
      currentLocation: {
        latitude: 9.015401,
        longitude: 38.773611,
        lastUpdated: serverTimestamp()
      },
      currentRouteId: 'route2'
    }
  ];

  // 3. Add sample routes
  const routes = [
    {
      id: 'route1',
      name: 'Megenagna - Bole',
      description: 'Main route connecting Megenagna to Bole',
      startPoint: 'Megenagna',
      endPoint: 'Bole',
      waypoints: ['Megenagna', 'Meskel Square', 'Mexico', 'Bole'],
      distance: 12.5,
      estimatedDuration: 45,
      active: true
    },
    {
      id: 'route2',
      name: 'Piassa - Mercato',
      description: 'City center route',
      startPoint: 'Piassa',
      endPoint: 'Mercato',
      waypoints: ['Piassa', 'Arada', 'Piazza', 'Mercato'],
      distance: 8.2,
      estimatedDuration: 30,
      active: true
    }
  ];

  // 4. Add sample schedules
  const schedules = [
    {
      id: 'schedule1',
      routeId: 'route1',
      vehicleId: 'vehicle1',
      departureTime: serverTimestamp(),
      arrivalTime: serverTimestamp(),
      recurring: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
      },
      status: 'scheduled',
      availableSeats: 50,
      price: 25
    }
  ];

  // 5. Add sample stops
  const stops = [
    {
      id: 'stop1',
      name: 'Megenagna Terminal',
      location: {
        latitude: 9.005401,
        longitude: 38.763611,
        address: 'Megenagna, Addis Ababa'
      },
      type: 'terminal',
      routes: ['route1']
    },
    {
      id: 'stop2',
      name: 'Meskel Square',
      location: {
        latitude: 9.015401,
        longitude: 38.773611,
        address: 'Meskel Square, Addis Ababa'
      },
      type: 'bus_stop',
      routes: ['route1']
    }
  ];

  // Add all documents to Firestore
  try {
    console.log('Adding sample data to Firestore...');
    
    // Add users
    for (const user of users) {
      await addDocument('users', user.id, user);
    }

    // Add vehicles
    for (const vehicle of vehicles) {
      await addDocument('vehicles', vehicle.id, vehicle);
    }

    // Add routes
    for (const route of routes) {
      await addDocument('routes', route.id, route);
    }

    // Add schedules
    for (const schedule of schedules) {
      await addDocument('schedules', schedule.id, schedule);
    }

    // Add stops
    for (const stop of stops) {
      await addDocument('stops', stop.id, stop);
    }

    console.log('Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

// Run the initialization
initializeDatabase();
