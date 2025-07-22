import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MapPin, Clock, Navigation, ChevronLeft, ArrowRight } from "lucide-react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from 'expo-location';
import Colors from "@/constants/colors";

type LocationType = {
  latitude: number;
  longitude: number;
  title: string;
  description: string;
};

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse the route params
  const origin = params.origin ? JSON.parse(params.origin as string) : null;
  const destination = params.destination ? JSON.parse(params.destination as string) : null;
  const originName = params.originName as string || 'Origin';
  const destinationName = params.destinationName as string || 'Destination';
  
  const [region, setRegion] = useState({
    latitude: origin?.latitude || 9.0054,
    longitude: origin?.longitude || 38.7636,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Calculate route coordinates (in a real app, you'd use a directions API)
  const routeCoordinates = origin && destination ? [
    { latitude: origin.latitude, longitude: origin.longitude },
    { latitude: destination.latitude, longitude: destination.longitude },
  ] : [];

  // Calculate distance and estimated time (simplified)
  const calculateDistance = () => {
    if (!origin || !destination) return { distance: 0, time: 0 };
    
    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in km
    const dLat = (destination.latitude - origin.latitude) * (Math.PI / 180);
    const dLon = (destination.longitude - origin.longitude) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(origin.latitude * (Math.PI / 180)) * 
      Math.cos(destination.latitude * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    const time = Math.round((distance / 30) * 60); // Assuming 30 km/h average speed
    
    return { distance: distance.toFixed(1), time };
  };

  const { distance, time } = calculateDistance();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen 
        options={{
          title: "Booking Confirmed",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
        >
          {origin && (
            <Marker
              coordinate={{
                latitude: origin.latitude,
                longitude: origin.longitude,
              }}
              title="Pickup"
              description={originName}
            >
              <View style={styles.marker}>
                <View style={[styles.markerDot, styles.pickupDot]} />
              </View>
            </Marker>
          )}
          
          {destination && (
            <Marker
              coordinate={{
                latitude: destination.latitude,
                longitude: destination.longitude,
              }}
              title="Destination"
              description={destinationName}
            >
              <View style={styles.marker}>
                <View style={[styles.markerDot, styles.destinationDot]} />
              </View>
            </Marker>
          )}
          
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={Colors.primary}
              strokeWidth={4}
              lineDashPattern={[1]}
            />
          )}
        </MapView>
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.routeInfo}>
          <View style={styles.locationRow}>
            <View style={[styles.dot, styles.pickupDot]} />
            <Text style={styles.locationText} numberOfLines={1}>
              {originName}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.locationRow}>
            <View style={[styles.dot, styles.destinationDot]} />
            <Text style={styles.locationText} numberOfLines={1}>
              {destinationName}
            </Text>
          </View>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Clock size={20} color={Colors.textLight} />
            <Text style={styles.detailText}>{time} min</Text>
          </View>
          <View style={styles.detailItem}>
            <Navigation size={20} color={Colors.textLight} />
            <Text style={styles.detailText}>{distance} km</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.trackButton}
          onPress={() => {
            // Navigate to live tracking when implemented
            router.push({
              pathname: '/track-ride',
              params: {
                origin: JSON.stringify(origin),
                destination: JSON.stringify(destination),
                originName,
                destinationName
              }
            } as any);
          }}
        >
          <Text style={styles.trackButtonText}>Track Your Ride</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mapContainer: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 16,
    backgroundColor: Colors.background,
  },
  routeInfo: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  pickupDot: {
    backgroundColor: Colors.primary,
  },
  destinationDot: {
    backgroundColor: Colors.secondary,
  },
  locationText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
    marginLeft: 6,
    width: 2,
    marginRight: 16,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  detailText: {
    marginLeft: 8,
    color: Colors.text,
    fontSize: 14,
  },
  trackButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  marker: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  markerDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#fff',
  },
});
