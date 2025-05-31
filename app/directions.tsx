import React from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft, MapPin, Navigation, Clock, ArrowRight, Bus, Train, Car } from "lucide-react-native";
import Colors from "@/constants/colors";

export default function DirectionsScreen() {
  const router = useRouter();
  const { location } = useLocalSearchParams();
  
  const locationName = location as string || "Selected Location";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen 
        options={{
          title: "Directions",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
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
            <Navigation size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.directionsContainer}>
        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <View style={styles.locationIconContainer}>
              <MapPin size={24} color={Colors.primary} />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>{locationName}</Text>
              <Text style={styles.locationDistance}>1.2 km away</Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>Available Routes</Text>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity 
            style={styles.routeCard}
            onPress={() => router.push("/booking")}
          >
            <View style={styles.routeHeader}>
              <View style={styles.routeIconContainer}>
                <Bus size={24} color={Colors.primary} />
              </View>
              <View style={styles.routeInfo}>
                <Text style={styles.routeTitle}>Bus Route</Text>
                <Text style={styles.routeDescription}>Bus #105 - Direct</Text>
              </View>
              <View style={styles.routeTimeContainer}>
                <Clock size={16} color={Colors.textLight} />
                <Text style={styles.routeTime}>15 min</Text>
              </View>
            </View>
            
            <View style={styles.routePath}>
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
                <Text style={styles.routePointText}>Current Location</Text>
              </View>
              
              <View style={styles.routeLine} />
              
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: Colors.secondary }]} />
                <Text style={styles.routePointText}>{locationName}</Text>
              </View>
            </View>
            
            <View style={styles.routeFooter}>
              <Text style={styles.routePrice}>15 ETB</Text>
              <View style={styles.routeButton}>
                <Text style={styles.routeButtonText}>Select</Text>
                <ArrowRight size={16} color="#FFFFFF" />
              </View>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.routeCard}
            onPress={() => router.push("/booking")}
          >
            <View style={styles.routeHeader}>
              <View style={[styles.routeIconContainer, { backgroundColor: Colors.secondaryLight + "40" }]}>
                <Train size={24} color={Colors.secondary} />
              </View>
              <View style={styles.routeInfo}>
                <Text style={styles.routeTitle}>Train + Walk</Text>
                <Text style={styles.routeDescription}>Green Line + 5 min walk</Text>
              </View>
              <View style={styles.routeTimeContainer}>
                <Clock size={16} color={Colors.textLight} />
                <Text style={styles.routeTime}>20 min</Text>
              </View>
            </View>
            
            <View style={styles.routePath}>
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
                <Text style={styles.routePointText}>Current Location</Text>
              </View>
              
              <View style={styles.routeLine} />
              
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: Colors.warning }]} />
                <Text style={styles.routePointText}>Mexico Station</Text>
              </View>
              
              <View style={styles.routeLine} />
              
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: Colors.secondary }]} />
                <Text style={styles.routePointText}>{locationName}</Text>
              </View>
            </View>
            
            <View style={styles.routeFooter}>
              <Text style={styles.routePrice}>10 ETB</Text>
              <View style={styles.routeButton}>
                <Text style={styles.routeButtonText}>Select</Text>
                <ArrowRight size={16} color="#FFFFFF" />
              </View>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.routeCard}
            onPress={() => router.push("/booking")}
          >
            <View style={styles.routeHeader}>
              <View style={[styles.routeIconContainer, { backgroundColor: Colors.warning + "40" }]}>
                <Car size={24} color={Colors.warning} />
              </View>
              <View style={styles.routeInfo}>
                <Text style={styles.routeTitle}>Taxi</Text>
                <Text style={styles.routeDescription}>Direct ride</Text>
              </View>
              <View style={styles.routeTimeContainer}>
                <Clock size={16} color={Colors.textLight} />
                <Text style={styles.routeTime}>8 min</Text>
              </View>
            </View>
            
            <View style={styles.routePath}>
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
                <Text style={styles.routePointText}>Current Location</Text>
              </View>
              
              <View style={styles.routeLine} />
              
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: Colors.secondary }]} />
                <Text style={styles.routePointText}>{locationName}</Text>
              </View>
            </View>
            
            <View style={styles.routeFooter}>
              <Text style={styles.routePrice}>45 ETB</Text>
              <View style={styles.routeButton}>
                <Text style={styles.routeButtonText}>Select</Text>
                <ArrowRight size={16} color="#FFFFFF" />
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
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
    height: "40%",
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
  directionsContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  locationCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  locationDistance: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  routeCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  routeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  routeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  routeDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  routeTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  routeTime: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    marginLeft: 4,
  },
  routePath: {
    marginBottom: 16,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  routePointText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 10,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: Colors.border,
    marginLeft: 4,
  },
  routeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  routePrice: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  routeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  routeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginRight: 4,
  },
});
