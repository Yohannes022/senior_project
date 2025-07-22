import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '@/constants/colors';

type Coordinate = {
  latitude: number;
  longitude: number;
};

type RouteParams = {
  origin?: string;        // Can be a JSON string of coordinates or an address
  originName?: string;    // Display name for origin
  destination?: string;   // Can be a JSON string of coordinates or an address
  destinationCoords?: string; // JSON string of destination coordinates
  type?: 'from' | 'to';   // Whether this is setting origin or destination
  departureTime?: string; // 'now' or 'schedule'
  currentFrom?: string;   // Current 'from' value in the search
  currentTo?: string;     // Current 'to' value in the search
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList {
      'map-screen': RouteParams;
    }
  }
}

export default function MapScreen() {
  const params = useLocalSearchParams<RouteParams>();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [destination, setDestination] = useState<Coordinate | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [region, setRegion] = useState({
    latitude: 9.0331,
    longitude: 38.7748,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Get current location
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return null;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      return currentLocation;
    } catch (error) {
      console.error('Error getting location:', error);
      setErrorMsg('Unable to get your location');
      return null;
    }
  };

  // Convert address to coordinates
  const getCoordinatesFromAddress = async (address: string) => {
    try {
      const geocoded = await Location.geocodeAsync(address);
      if (geocoded.length > 0) {
        return {
          latitude: geocoded[0].latitude,
          longitude: geocoded[0].longitude,
        };
      }
      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  };

  // Get route between two points (simplified - in a real app, use a routing service)
  const getRoute = async (start: Coordinate, end: Coordinate): Promise<Coordinate[]> => {
    // This is a simplified straight line - in a real app, use a routing service
    return [
      { latitude: start.latitude, longitude: start.longitude },
      { latitude: end.latitude, longitude: end.longitude },
    ];
  };

  useEffect(() => {
    const setupMap = async () => {
      setIsLoading(true);
      try {
        // Get current location
        const currentLocation = await getCurrentLocation();
        if (currentLocation) {
          setLocation(currentLocation);
          
          // If we have a destination in params, set it up
          if (params.destination) {
            let destCoords;
            
            // Check if destination is a JSON string of coordinates
            try {
              const parsedDest = JSON.parse(params.destination);
              if (parsedDest.latitude && parsedDest.longitude) {
                destCoords = parsedDest;
              }
            } catch (e) {
              // If not JSON, treat as address
              destCoords = await getCoordinatesFromAddress(params.destination);
            }
            
            if (destCoords) {
              setDestination(destCoords);
              // Get route between current location and destination
              const route = await getRoute(
                {
                  latitude: currentLocation.coords.latitude,
                  longitude: currentLocation.coords.longitude
                },
                destCoords
              );
              setRouteCoordinates(route);
              
              // Update map region to show both points
              const points = [
                {
                  latitude: currentLocation.coords.latitude,
                  longitude: currentLocation.coords.longitude
                },
                destCoords
              ];
              
              // Calculate region to fit both points
              const minLat = Math.min(...points.map(p => p.latitude));
              const maxLat = Math.max(...points.map(p => p.latitude));
              const minLng = Math.min(...points.map(p => p.longitude));
              const maxLng = Math.max(...points.map(p => p.longitude));
              
              setRegion({
                latitude: (minLat + maxLat) / 2,
                longitude: (minLng + maxLng) / 2,
                latitudeDelta: (maxLat - minLat) * 1.5, // Add some padding
                longitudeDelta: (maxLng - minLng) * 1.5,
              });
            }
          } else {
            // No destination, just center on current location
            setRegion({
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }
        }
      } catch (error) {
        console.error('Error setting up map:', error);
        setErrorMsg('Error setting up map');
      } finally {
        setIsLoading(false);
      }
    };
    
    setupMap();
  }, [params.destination]);

  const toggleMapType = () => {
    setMapType(prev => {
      if (prev === 'standard') return 'satellite';
      if (prev === 'satellite') return 'hybrid';
      return 'standard';
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        mapType={mapType}
        onMapReady={() => setIsLoading(false)}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
            pinColor={Colors.primary}
          />
        )}
        
        {destination && (
          <Marker
            coordinate={destination}
            title="Destination"
            pinColor={Colors.danger}
          />
        )}
        
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={Colors.primary}
            strokeWidth={4}
          />
        )}
      </MapView>
      
      <TouchableOpacity 
        style={styles.mapTypeButton}
        onPress={toggleMapType}
      >
        <Ionicons 
          name={mapType === 'standard' ? 'map' : mapType === 'satellite' ? 'globe' : 'layers'} 
          size={24} 
          color={Colors.primary} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  errorText: {
    color: Colors.danger,
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  mapTypeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});