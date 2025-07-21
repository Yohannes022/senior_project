import { initializeFirebase } from './initFirestore.js';
import { log } from '../utils/logger.js';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

async function listCollections() {
  try {
    log('Initializing Firebase to list collections...');
    const db = await initializeFirebase();
    
    log('Fetching collections...');
    
    // List of collections we expect to find
    const collectionsToCheck = [
      'users',
      'vehicles',
      'routes',
      'trips',
      'schedules',
      'payments',
      'subscriptions',
      'notifications',
      'reviews',
      'stops'
    ];
    
    log(`Checking for ${collectionsToCheck.length} collections...`, 'info');
    
    // Check each collection
    for (const collectionName of collectionsToCheck) {
      log(`\nCollection: ${collectionName}`, 'info');
      
      try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const docs = [];
        
        querySnapshot.forEach((doc) => {
          docs.push({
            id: doc.id,
            data: doc.data()
          });
        });
        
        log(`  Documents: ${docs.length}`, 'info');
        
        // Log first 3 documents as samples
        docs.slice(0, 3).forEach((doc, index) => {
          log(`  Document ${index + 1} (${doc.id}):`, 'info');
          console.log(JSON.stringify(doc.data, null, 2));
        });
        
        if (docs.length > 3) {
          log(`  ... and ${docs.length - 3} more documents`, 'info');
        }
      } catch (error) {
        log(`  Error reading documents: ${error.message}`, 'error');
      }
    }
    
    log('\n✅ Collection listing completed', 'success');
    process.exit(0);
  } catch (error) {
    log(`❌ Error listing collections: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Run the function
listCollections();
