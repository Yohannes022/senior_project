import React from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft, MapPin, Clock, Calendar, Star, Info, Navigation } from "lucide-react-native";
import Colors from "@/constants/colors";
import { popularDestinations } from "@/constants/mockData";

export default function DestinationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  // Find the destination by id
  const destination = popularDestinations.find(dest => dest.id === id) || popularDestinations[0];

  const handleGetDirections = () => {
    router.push(`/directions?location=${destination.name}`);
  };

  const handleBookRide = () => {
    router.push("/booking");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen 
        options={{
          title: destination.name,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1540866225557-9e4c58100c67?q=80&w=1000&auto=format&fit=crop" }}
          style={styles.coverImage}
        />
        
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>{destination.name}</Text>
            <View style={styles.ratingContainer}>
              <Star size={16} color={Colors.warning} fill={Colors.warning} />
              <Text style={styles.ratingText}>4.8</Text>
              <Text style={styles.reviewCount}>(120 reviews)</Text>
            </View>
            
            <View style={styles.addressContainer}>
              <MapPin size={16} color={Colors.textLight} />
              <Text style={styles.addressText}>Addis Ababa, Ethiopia</Text>
            </View>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Opening Hours</Text>
            
            <View style={styles.hoursContainer}>
              <View style={styles.hourRow}>
                <Text style={styles.dayText}>Monday - Friday</Text>
                <Text style={styles.timeText}>8:00 AM - 6:00 PM</Text>
              </View>
              
              <View style={styles.hourRow}>
                <Text style={styles.dayText}>Saturday</Text>
                <Text style={styles.timeText}>9:00 AM - 5:00 PM</Text>
              </View>
              
              <View style={styles.hourRow}>
                <Text style={styles.dayText}>Sunday</Text>
                <Text style={styles.timeText}>10:00 AM - 4:00 PM</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Transit Options</Text>
            
            <View style={styles.transitOption}>
              <View style={styles.transitIconContainer}>
                <MapPin size={20} color={Colors.primary} />
              </View>
              <View style={styles.transitInfo}>
                <Text style={styles.transitTitle}>Bus Stop</Text>
                <Text style={styles.transitDetail}>250m away • Bus #105, #72</Text>
              </View>
            </View>
            
            <View style={styles.transitOption}>
              <View style={[styles.transitIconContainer, { backgroundColor: Colors.secondaryLight + "40" }]}>
                <MapPin size={20} color={Colors.secondary} />
              </View>
              <View style={styles.transitInfo}>
                <Text style={styles.transitTitle}>Train Station</Text>
                <Text style={styles.transitDetail}>500m away • Green Line</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.descriptionText}>
              {destination.name} is a popular destination in Addis Ababa, offering visitors a unique experience. 
              The location is easily accessible by public transportation and offers various amenities.
            </Text>
            
            <TouchableOpacity style={styles.readMoreButton}>
              <Text style={styles.readMoreText}>Read More</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.directionsButton]}
              onPress={handleGetDirections}
            >
              <Navigation size={20} color={Colors.primary} />
              <Text style={styles.directionsButtonText}>Directions</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.bookButton]}
              onPress={handleBookRide}
            >
              <Text style={styles.bookButtonText}>Book a Ride</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  coverImage: {
    width: "100%",
    height: 200,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 4,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  addressText: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 4,
  },
  infoCard: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  hoursContainer: {
    gap: 8,
  },
  hourRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayText: {
    fontSize: 15,
    color: Colors.text,
  },
  timeText: {
    fontSize: 15,
    color: Colors.textLight,
  },
  transitOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  transitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  transitInfo: {
    marginLeft: 12,
  },
  transitTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
  },
  transitDetail: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
  },
  readMoreButton: {
    marginTop: 8,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.primary,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  directionsButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
    flexDirection: "row",
  },
  directionsButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
    marginLeft: 8,
  },
  bookButton: {
    backgroundColor: Colors.primary,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
