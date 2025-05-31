import React from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MapPin, Navigation, Layers, Search } from "lucide-react-native";
import Colors from "@/constants/colors";

export default function MapScreen() {
  const router = useRouter();

  const handleDirections = (locationName: string) => {
    router.push(`/directions?location=${locationName}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.mapContainer}>
        {/* Placeholder for the map - in a real app, use a proper map component */}
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1569336415962-a4bd9f69c07a?q=80&w=1000&auto=format&fit=crop" }}
          style={styles.mapImage}
          resizeMode="cover"
        />
        
        {/* Map controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.mapButton}>
            <Layers size={20} color={Colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.mapButton}>
            <Navigation size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>
        
        {/* Search bar */}
        <TouchableOpacity 
          style={styles.searchContainer}
          onPress={() => router.push("/search")}
        >
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.textLight} />
            <Text style={styles.searchPlaceholder}>Search for a location</Text>
          </View>
        </TouchableOpacity>
        
        {/* Bottom card */}
        <View style={styles.bottomCard}>
          <Text style={styles.bottomCardTitle}>Nearby Transit</Text>
          
          <View style={styles.transitItem}>
            <View style={[styles.transitIcon, { backgroundColor: Colors.primary + "20" }]}>
              <MapPin size={20} color={Colors.primary} />
            </View>
            <View style={styles.transitInfo}>
              <Text style={styles.transitName}>Bus Stop - Bole Road</Text>
              <Text style={styles.transitDistance}>250m away</Text>
            </View>
            <TouchableOpacity 
              style={styles.directionsButton}
              onPress={() => handleDirections("Bus Stop - Bole Road")}
            >
              <Text style={styles.directionsText}>Directions</Text>
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
              onPress={() => handleDirections("Train Station - Mexico")}
            >
              <Text style={styles.directionsText}>Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  mapControls: {
    position: "absolute",
    top: 16,
    right: 16,
    gap: 8,
  },
  mapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 70,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchPlaceholder: {
    marginLeft: 8,
    fontSize: 15,
    color: Colors.textLight,
  },
  bottomCard: {
    position: "absolute",
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
  directionsText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});
