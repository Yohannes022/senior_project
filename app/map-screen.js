import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
import MapView from '../components/MapView';

export default function MapScreen() {
  const [region, setRegion] = useState({
    latitude: 9.0054,  // Addis Ababa coordinates
    longitude: 38.7636,
    zoom: 13
  });

  // Example markers
  const markers = [
    { 
      latitude: 9.0054, 
      longitude: 38.7636,
      title: 'Addis Ababa',
    },
    // Add more markers as needed
  ];

  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
    console.log('Map moved to:', newRegion);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Sheger Transit Map</Text>
        <Text style={styles.coordinates}>
          {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)} (Zoom: {region.zoom})
        </Text>
      </View>
      
      <View style={styles.mapContainer}>
        <MapView 
          initialRegion={region}
          onRegionChange={handleRegionChange}
          markers={markers}
          style={styles.map}
        />
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
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  coordinates: {
    textAlign: 'center',
    color: '#666',
    marginTop: 4,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
