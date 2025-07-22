import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MapPin, Navigation, Layers, Search, X, ArrowRight } from "lucide-react-native";
import Colors from "@/constants/colors";
import MapView, { Marker, MapType } from "react-native-maps";
import { useAuth } from "@/contexts/AuthContext";
import * as Location from 'expo-location';
import type { LocationObject } from 'expo-location';

export default function MapScreen() {
  const router = useRouter();
  const { isLoading } = useAuth();
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDirections, setShowDirections] = useState(false);
  const [startLocation, setStartLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [mapType, setMapType] = useState<MapType>('standard');
  const [initialRegion, setInitialRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  
  // Get route params
  const params = useLocalSearchParams();

  useEffect(() => {
    (async () => {
      try {
        // Check if we have route params with destination
        const destinationParam = params.destination;
        if (destinationParam) {
          // Ensure we always set a string, even if it's an array
          const destinationValue = Array.isArray(destinationParam) ? destinationParam[0] : destinationParam;
          setDestination(destinationValue);
          setShowDirections(true);
        }
        
        if (params.originName) {
          // Ensure we always set a string, even if it's an array
          const originNameValue = Array.isArray(params.originName) ? params.originName[0] : params.originName;
          setStartLocation(originNameValue);
        } else if (params.origin) {
          // If we have origin coordinates, use them
          const originParam = Array.isArray(params.origin) ? params.origin[0] : params.origin;
          const origin = JSON.parse(originParam);
          setStartLocation('Current Location');
          setInitialRegion(prev => ({
            ...prev || { latitudeDelta: 0.009, longitudeDelta: 0.009 },
            latitude: origin.latitude,
            longitude: origin.longitude,
          }));
        }
        
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        
        // If we don't have an initial region from params, use current location
        if (location && !initialRegion) {
          setInitialRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.009,
            longitudeDelta: 0.009,
          });
        }
      } catch (error) {
        console.error('Error getting location:', error);
        setErrorMsg('Error getting location');
      }
    })();
  }, []);

  const handleGetDirections = async () => {
    if (!startLocation || !destination) {
      Alert.alert('Error', 'Please enter both start and destination locations');
      return;
    }

    try {
      // Get coordinates for start location
      const startGeocode = await Location.geocodeAsync(startLocation);
      if (!startGeocode || startGeocode.length === 0) {
        Alert.alert('Error', 'Could not find coordinates for the start location');
        return;
      }

      // Get coordinates for destination
      const destGeocode = await Location.geocodeAsync(destination);
      if (!destGeocode || destGeocode.length === 0) {
        Alert.alert('Error', 'Could not find coordinates for the destination');
        return;
      }

      // Navigate to directions screen with both locations
      router.push({
        pathname: '/directions',
        params: new URLSearchParams({
          startLocation,
          startLat: startGeocode[0].latitude.toString(),
          startLng: startGeocode[0].longitude.toString(),
          destination,
          destLat: destGeocode[0].latitude.toString(),
          destLng: destGeocode[0].longitude.toString(),
        }).toString()
      } as any);
    } catch (error) {
      console.error('Error getting coordinates for location:', error);
      Alert.alert('Error', 'Could not get directions. Please try again.');
    }
  };

  const toggleMapType = () => {
    const mapTypes: MapType[] = ['standard', 'satellite', 'hybrid', 'terrain'];
    const currentIndex = mapTypes.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % mapTypes.length;
    setMapType(mapTypes[nextIndex]);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.mapContainer}>
        {initialRegion ? (
          <MapView
            style={styles.map}
            initialRegion={initialRegion}
            mapType={mapType}
            showsUserLocation={true}
            showsMyLocationButton={true}
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
          </MapView>
        ) : null}
        
        {/* Map controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.mapButton}>
            <Layers size={20} color={Colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.mapButton}>
            <Navigation size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>
        
        {/* Map type toggle */}
        <TouchableOpacity 
          style={styles.mapTypeButton}
          onPress={toggleMapType}
        >
          <Layers size={24} color={Colors.primary} />
        </TouchableOpacity>
        
        {/* Search bar */}
        <TouchableOpacity 
          style={styles.searchContainer}
          onPress={() => router.push('/search' as any)}
        >
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.textLight} />
            <Text style={styles.searchPlaceholder}>Search for a location</Text>
          </View>
        </TouchableOpacity>
        
        {/* Directions Panel */}
        {showDirections ? (
          <View style={styles.directionsPanel}>
            <View style={styles.directionsHeader}>
              <Text style={styles.directionsTitle}>Get Directions</Text>
              <TouchableOpacity onPress={() => setShowDirections(false)}>
                <X size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputContainer}>
              <View style={styles.locationInput}>
                <Text style={styles.inputLabel}>From</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Current location"
                  value={startLocation}
                  onChangeText={setStartLocation}
                  placeholderTextColor={Colors.textLight}
                />
              </View>
              
              <View style={styles.locationInput}>
                <Text style={styles.inputLabel}>To</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter destination"
                  value={destination}
                  onChangeText={setDestination}
                  placeholderTextColor={Colors.textLight}
                />
              </View>
              
              <TouchableOpacity 
                style={[styles.directionsButton, { marginTop: 16 }]}
                onPress={handleGetDirections}
              >
                <Text style={styles.directionsText}>Get Directions</Text>
                <ArrowRight size={16} color="#FFFFFF" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.bottomCard}>
            <View style={styles.bottomCardHeader}>
              <Text style={styles.bottomCardTitle}>Nearby Transit</Text>
              <TouchableOpacity onPress={() => setShowDirections(true)}>
                <Text style={styles.directionsLink}>Directions</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.transitItem}>
              <View style={[styles.transitIcon, { backgroundColor: Colors.primary + "20" }]}>
                <MapPin size={20} color={Colors.primary} />
              </View>
              <View style={styles.transitInfo}>
                <Text style={styles.transitName}>Bus Stop - Bole Road</Text>
                <Text style={styles.transitDistance}>250m away</Text>
              </View>
              <TouchableOpacity 
                style={styles.smallDirectionsButton}
                onPress={() => {
                  setDestination("Bus Stop - Bole Road");
                  setShowDirections(true);
                }}
              >
                <Text style={styles.directionsText}>Go</Text>
              </TouchableOpacity>
            </View>
          
          <View style={styles.transitItem}>
            <View style={[styles.transitIcon, { backgroundColor: Colors.secondary + "20" }]}>
              <MapPin size={20} color={Colors.secondary} />
            </View>
            <View style={styles.transitInfo}>
              <Text style={styles.transitName}>Train Station - Mexico</Text>
              <Text style={styles.transitDistance}>1.2km away</Text>
            </View>
            <TouchableOpacity 
              style={styles.directionsButton}
              onPress={() => {
                setDestination("Train Station - Mexico");
                setShowDirections(true);
              }}
            >
              <Text style={styles.directionsText}>Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  directionsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  directionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  directionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  inputContainer: {
    marginTop: 8,
  },
  locationInput: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    color: Colors.text,
    fontSize: 16,
  },
  bottomCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  directionsLink: {
    color: Colors.primary,
    fontWeight: '500',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapButton: {
    padding: 8,
  },
  mapTypeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  searchContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 70,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchPlaceholder: {
    marginLeft: 8,
    color: Colors.textLight,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 16,
  },
  transitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  transitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  transitInfo: {
    flex: 1,
    marginLeft: 12,
  },
  transitName: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.text,
  },
  transitDistance: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 2,
  },
  directionsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary,
    borderRadius: 16,
  },
  smallDirectionsButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  directionsText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});
