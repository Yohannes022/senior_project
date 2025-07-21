import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp, 
  writeBatch, 
  enableIndexedDbPersistence, 
  connectFirestoreEmulator 
} from 'firebase/firestore';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Enhanced logging function with colors and timestamps
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',  // Cyan
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m',   // Red
    reset: '\x1b[0m'     // Reset
  };
  const color = colors[type] || colors.info;
  console.log(`${colors.info}[${timestamp}]${color} ${message}${colors.reset}`);
};

// Main function to initialize Firebase and Firestore
export async function initializeFirebase() {
  // Load environment variables
  log('Loading environment variables...');
  const result = dotenv.config();

  if (result.error) {
    throw new Error(`Error loading .env file: ${result.error}`);
  }
  
  log('✅ Environment variables loaded successfully', 'success');
  log(`Found ${Object.keys(result.parsed || {}).length} environment variables`, 'info');

  // Firebase configuration from environment variables
  log('Loading Firebase configuration...');
  const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
  };

  // Validate required Firebase config
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error('Missing required Firebase configuration. Please check your .env file.');
  }

  // Initialize Firebase
  log('Initializing Firebase...');
  const app = initializeApp(firebaseConfig);
  log('✅ Firebase initialized successfully', 'success');

  // Initialize Firestore
  log('Initializing Firestore...');
  const db = getFirestore(app);
  
  // Check if we're in development mode and should use emulator
  if (process.env.NODE_ENV === 'development' || process.env.USE_FIREBASE_EMULATOR === 'true') {
    log('🔌 Connecting to Firestore Emulator...', 'info');
    connectFirestoreEmulator(db, '127.0.0.1', 8090);
    log('✅ Connected to Firestore Emulator on port 8090', 'success');
  }
  
  // Enable offline persistence with error handling
  log('Enabling offline persistence...');
  try {
    await enableIndexedDbPersistence(db);
    log('✅ Offline persistence enabled', 'success');
  } catch (err) {
    if (err.code === 'failed-precondition') {
      log('⚠️ Offline persistence can only be enabled in one tab at a time', 'warning');
    } else if (err.code === 'unimplemented') {
      log('⚠️ Offline persistence is not available in this browser', 'warning');
    } else {
      log(`⚠️ Error enabling offline persistence: ${err.message}`, 'warning');
    }
  }

  return db;
}

// Function to create sample data in Firestore
async function createSampleData(db) {
  try {
    log('📝 Creating sample data in Firestore...');
    
    // Create a batch for atomic writes
    const batch = writeBatch(db);
    
    // 1. Create sample users collection
    const usersRef = collection(db, 'users');
    const user1Ref = doc(usersRef, 'user1');
    batch.set(user1Ref, {
      uid: 'user1',
      email: 'passenger1@example.com',
      displayName: 'John Doe',
      role: 'passenger',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // 2. Create sample vehicles collection
    const vehiclesRef = collection(db, 'vehicles');
    const vehicle1Ref = doc(vehiclesRef, 'vehicle1');
    batch.set(vehicle1Ref, {
      id: 'vehicle1',
      name: 'Bus 101',
      type: 'bus',
      capacity: 50,
      currentRoute: 'route1',
      currentLocation: {
        latitude: 9.0054,
        longitude: 38.7636
      },
      status: 'active',
      lastMaintenance: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // 3. Create sample routes collection
    const routesRef = collection(db, 'routes');
    const route1Ref = doc(routesRef, 'route1');
    batch.set(route1Ref, {
      id: 'route1',
      name: 'Megenagna to Piassa',
      stops: [
        { name: 'Megenagna', order: 1, location: { latitude: 9.0227, longitude: 38.8003 } },
        { name: 'Meskel Square', order: 2, location: { latitude: 9.0219, longitude: 38.7820 } },
        { name: 'Piassa', order: 3, location: { latitude: 9.0331, longitude: 38.7500 } }
      ],
      estimatedDuration: 30, // minutes
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // 4. Create sample trips collection
    const tripsRef = collection(db, 'trips');
    const trip1Ref = doc(tripsRef, 'trip1');
    batch.set(trip1Ref, {
      id: 'trip1',
      routeId: 'route1',
      vehicleId: 'vehicle1',
      driverId: 'driver1',
      startTime: serverTimestamp(),
      endTime: null,
      status: 'in_progress',
      passengers: ['user1'],
      currentStopIndex: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Commit the batch
    await batch.commit();
    
    log('✅ Sample data created successfully', 'success');
    return true;
  } catch (error) {
    log(`❌ Error creating sample data: ${error.message}`, 'error');
    if (error.stack) log(`Stack trace: ${error.stack}`, 'error');
    throw error;
  }
}

// Main function
async function main() {
  try {
    log('🚀 Starting Firestore database initialization...');
    
    // Initialize Firebase and Firestore
    const db = await initializeFirebase();
    
    log('✅ Firestore initialized successfully', 'success');
    
    // Create sample data
    await createSampleData(db);
    
    log('✨ Database initialization completed successfully!', 'success');
    
    // Exit with success code
    process.exit(0);
  } catch (error) {
    log(`❌ Error during initialization: ${error.message}`, 'error');
    if (error.stack) {
      log(`Stack trace: ${error.stack}`, 'error');
    }
    
    log('\nTroubleshooting tips:', 'error');
    log('1. Check your internet connection', 'error');
    log('2. Verify your Firebase project ID and API key in .env', 'error');
    log('3. Make sure Firestore is enabled in your Firebase Console', 'error');
    log('4. Check if your IP is whitelisted in Firebase (if using IP restrictions)', 'error');
    
    // Exit with error code
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log(`❌ Uncaught exception: ${error.message}`, 'error');
  if (error.stack) log(`Stack trace: ${error.stack}`, 'error');
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  log(`❌ Unhandled rejection at: ${promise}. Reason: ${reason}`, 'error');
  process.exit(1);
});

// Start the main function
main().catch(error => {
  log(`❌ Fatal error in main function: ${error.message}`, 'error');
  if (error.stack) log(`Stack trace: ${error.stack}`, 'error');
  process.exit(1);
});
