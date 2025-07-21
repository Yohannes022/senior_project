import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
const envResult = dotenv.config();
if (envResult.error) {
  console.error('❌ Error loading .env file:', envResult.error);
  process.exit(1);
}

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

// Main function to initialize the database
async function initializeDatabase() {
  try {
    log('🚀 Starting Firestore database initialization...');
    
    // Import the initFirestore script
    log('Importing Firestore initialization script...');
    const firestoreModule = await import('./scripts/initFirestore.js');
    
    // Initialize Firebase and Firestore
    log('Initializing Firebase and Firestore...');
    const db = await firestoreModule.initializeFirebase();
    
    log('✅ Firestore initialized successfully', 'success');
    log('✨ Database initialization completed successfully!', 'success');
    
    return true;
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
    
    return false;
  }
}

// Execute the initialization
(async () => {
  try {
    const success = await initializeDatabase();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
})();
