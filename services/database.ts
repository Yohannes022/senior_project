import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import { Asset } from 'expo-asset';
import { Alert } from 'react-native';

const DB_PATH = `${FileSystem.documentDirectory}database.json`;

// Initialize database if it doesn't exist
async function initializeDatabase() {
  try {
    const fileInfo = await FileSystem.getInfoAsync(DB_PATH);
    
    if (!fileInfo.exists) {
      console.log('Database not found, initializing new database...');
      
      // Create a default database structure
      const defaultDb = {
        users: [],
        transitStops: [],
        trips: [],
        favorites: []
      };
      
      // Try to load from asset first
      try {
        const asset = Asset.fromModule(require('../data/database.json'));
        await asset.downloadAsync();
        if (asset.localUri) {
          const assetContent = await FileSystem.readAsStringAsync(asset.localUri);
          await FileSystem.writeAsStringAsync(DB_PATH, assetContent);
          console.log('Database initialized from asset');
          return;
        }
      } catch (assetError) {
        console.warn('Could not load database from asset, creating default database', assetError);
      }
      
      // If asset loading fails, create a new database file
      await FileSystem.writeAsStringAsync(DB_PATH, JSON.stringify(defaultDb, null, 2));
      console.log('Default database created');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    Alert.alert('Database Error', 'Failed to initialize the database. Please restart the app.');
    throw error; // Re-throw to be caught by the calling function
  }
}

// Read all data
async function readDatabase() {
  try {
    await initializeDatabase();
    const fileContents = await FileSystem.readAsStringAsync(DB_PATH);
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading database:', error);
    Alert.alert('Error', 'Failed to read database. Please restart the app.');
    throw error;
  }
}

// Write data to database
async function writeDatabase(data: any) {
  try {
    await FileSystem.writeAsStringAsync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing to database:', error);
    Alert.alert('Error', 'Failed to save data. Please try again.');
    throw error;
  }
}

// CRUD Operations for Users
export const userService = {
  async getAll() {
    const db = await readDatabase();
    return db.users;
  },
  
  async getById(id: string) {
    const db = await readDatabase();
    return db.users.find((user: any) => user.id === id);
  },
  
  async create(userData: Omit<any, 'id' | 'createdAt' | 'updatedAt'>) {
    const db = await readDatabase();
    const newUser = {
      id: await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${Date.now()}-${userData.email}`),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.users.push(newUser);
    await writeDatabase(db);
    return newUser;
  },
  
  async update(id: string, updates: Partial<any>) {
    const db = await readDatabase();
    const userIndex = db.users.findIndex((user: any) => user.id === id);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    db.users[userIndex] = {
      ...db.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await writeDatabase(db);
    return db.users[userIndex];
  },
  
  async delete(id: string) {
    const db = await readDatabase();
    const initialLength = db.users.length;
    db.users = db.users.filter((user: any) => user.id !== id);
    
    if (db.users.length === initialLength) {
      throw new Error('User not found');
    }
    
    await writeDatabase(db);
    return true;
  }
};

// CRUD Operations for Transit Stops
export const transitStopService = {
  async getAll() {
    const db = await readDatabase();
    return db.transitStops;
  },
  
  async getById(id: string) {
    const db = await readDatabase();
    return db.transitStops.find((stop: any) => stop.id === id);
  },
  
  async getNearby(latitude: number, longitude: number, radiusKm: number = 5) {
    const db = await readDatabase();
    // Simple distance calculation (for demo purposes)
    return db.transitStops.filter((stop: any) => {
      const distance = Math.sqrt(
        Math.pow(stop.location.latitude - latitude, 2) +
        Math.pow(stop.location.longitude - longitude, 2)
      ) * 111; // Rough conversion to kilometers
      
      return distance <= radiusKm;
    });
  }
};

// CRUD Operations for Trips
export const tripService = {
  async getUserTrips(userId: string) {
    const db = await readDatabase();
    return db.trips.filter((trip: any) => trip.userId === userId);
  },
  
  async create(tripData: any) {
    const db = await readDatabase();
    const newTrip = {
      id: await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${Date.now()}-${tripData.userId}`),
      ...tripData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.trips.push(newTrip);
    await writeDatabase(db);
    return newTrip;
  },
  
  async delete(id: string) {
    const db = await readDatabase();
    const initialLength = db.trips.length;
    db.trips = db.trips.filter((trip: any) => trip.id !== id);
    
    if (db.trips.length === initialLength) {
      throw new Error('Trip not found');
    }
    
    await writeDatabase(db);
    return true;
  }
};

// CRUD Operations for Favorites
export const favoriteService = {
  async getUserFavorites(userId: string) {
    const db = await readDatabase();
    return db.favorites.filter((fav: any) => fav.userId === userId);
  },
  
  async addFavorite(favoriteData: any) {
    const db = await readDatabase();
    const newFavorite = {
      id: await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${Date.now()}-${favoriteData.userId}-${favoriteData.stopId}`),
      ...favoriteData,
      createdAt: new Date().toISOString()
    };
    
    // Check if already favorited
    const exists = db.favorites.some(
      (fav: any) => fav.userId === favoriteData.userId && fav.stopId === favoriteData.stopId
    );
    
    if (!exists) {
      db.favorites.push(newFavorite);
      await writeDatabase(db);
    }
    
    return newFavorite;
  },
  
  async removeFavorite(userId: string, stopId: string) {
    const db = await readDatabase();
    const initialLength = db.favorites.length;
    db.favorites = db.favorites.filter(
      (fav: any) => !(fav.userId === userId && fav.stopId === stopId)
    );
    
    if (db.favorites.length === initialLength) {
      throw new Error('Favorite not found');
    }
    
    await writeDatabase(db);
    return true;
  }
};
