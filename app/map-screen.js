import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import MapView from '../components/MapView';
import { Ionicons } from '@expo/vector-icons';

// Example destination (in a real app, this would come from user selection)
const EXAMPLE_DESTINATION = {
  latitude: 9.0227,  // Example destination in Addis Ababa
  longitude: 38.7469,
  title: 'Destination'
};

export default function MapScreen() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);

  // Set destination when tracking starts
  const startNavigation = () => {
    setDestination(EXAMPLE_DESTINATION);
    setIsTracking(true);
  };

  // Stop navigation
  const stopNavigation = () => {
    setDestination(null);
    setIsTracking(false);
    setRouteInfo(null);
  };

  // Handle location updates
  const handleLocationUpdate = (location) => {
    setCurrentLocation(location);
    
    // If we have a destination, we could calculate distance here
    if (destination) {
      // In a real app, you might want to calculate distance and ETA here
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        destination.latitude,
        destination.longitude
      );
      
      setRouteInfo({
        distance: distance.toFixed(1),
        // Add more route info as needed
      });
    }
  };

  // Helper function to calculate distance between two points in km
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Distance in km
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Sheger Transit</Text>
        {currentLocation && (
          <Text style={styles.coordinates}>
            {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
          </Text>
        )}
      </View>
      
      <View style={styles.mapContainer}>
        <MapView 
          style={styles.map}
          destination={isTracking ? destination : null}
          onLocationUpdate={handleLocationUpdate}
          updateInterval={15000} // Update route every 15 seconds
        />
        
        {!isTracking ? (
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={startNavigation}
          >
            <Ionicons name="navigate" size={24} color="white" />
            <Text style={styles.navButtonText}>Start Navigation</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.navControls}>
            <View style={styles.routeInfo}>
              {routeInfo && (
                <Text style={styles.routeText}>
                  {routeInfo.distance} km to destination
                </Text>
              )}
            </View>
            <TouchableOpacity 
              style={styles.stopButton}
              onPress={stopNavigation}
            >
              <Text style={styles.stopButtonText}>Stop Navigation</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#4285F4',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
  coordinates: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    fontSize: 12,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  navButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  navButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
  navControls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  routeInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  routeText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
  stopButton: {
    backgroundColor: '#EA4335',
    padding: 15,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  stopButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});
