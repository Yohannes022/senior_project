import React from "react";
import { StyleSheet, ScrollView, View, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { Link } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import LocationHeader from "@/components/LocationHeader";
import TripPlanner from "@/components/TripPlanner";
import NearbyVehicles from "@/components/NearbyVehicls";
import TerminalVehicles from "@/components/TerminalVehicles";
import RecentTrips from "@/components/RecentTrips";
import PopularDestinations from "@/components/PopularDestinations";
import UserPoints from "@/components/UserPoints";

export default function HomeScreen() {
  const router = useRouter();

  const handleBooking = () => {
    router.push("/booking");
  };

  const handleVehicleSelect = (vehicle: { id: string }) => {
    // Navigate to vehicle details page with the selected vehicle's id
    // Using the correct type for the route path
    router.push({
      pathname: "/vehicle-details/[id]",
      params: { id: vehicle.id }
    } as any);
  };

  const handleTripDetails = (tripId: string) => {
    router.push(`/trip-details?id=${tripId}`);
  };

  const handleDestinationSelect = (destinationId: string) => {
    router.push(`/destination?id=${destinationId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <LocationHeader />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TripPlanner onPlanTrip={handleBooking} />
        <UserPoints onPress={() => router.push("/rewards")} />
        <TerminalVehicles 
          onVehicleSelect={handleVehicleSelect}
        />
        <NearbyVehicles 
          onBookNow={handleBooking}
          onVehicleSelect={handleVehicleSelect}
        />
        <RecentTrips onTripSelect={handleTripDetails} onViewAll={() => router.push("/all-trips")} />
        <PopularDestinations onDestinationSelect={handleDestinationSelect} />
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  bottomPadding: {
    height: 40,
  },
});
