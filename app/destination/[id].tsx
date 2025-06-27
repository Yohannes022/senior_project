import React from "react";
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, MapPin, Clock, Star, Navigation, Bookmark } from "lucide-react-native";
import Colors from "@/constants/colors";

export default function DestinationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  // In a real app, you would fetch this data based on the ID
  const destination = {
    id: id as string,
    name: "Unity Park",
    location: "Arat Kilo, Addis Ababa",
    description: "A beautiful park located in the heart of Addis Ababa, featuring historical buildings, museums, and green spaces.",
    rating: 4.7,
    reviews: 1284,
    images: [
      "https://images.unsplash.com/photo-1586611292717-828c00e7ade9?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1593696140826-c58b478e6cba?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1593696119639-90b3e2b3af40?w=800&auto=format&fit=crop&q=80",
    ],
    openingHours: "9:00 AM - 6:00 PM (Daily)",
    entryFee: "100 ETB",
    address: "Arat Kilo, Addis Ababa, Ethiopia",
    coordinates: { lat: 9.0331, lng: 38.7501 },
    features: ["Parking Available", "Wheelchair Accessible", "Restrooms", "Food Court"],
  };

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.coordinates.lat},${destination.coordinates.lng}`;
    Linking.openURL(url);
  };

  const handleBookRide = () => {
    router.push(`/booking?destination=${encodeURIComponent(destination.name)}`);
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
          headerRight: () => (
            <TouchableOpacity style={{ marginRight: 16 }}>
              <Bookmark size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.imageGallery}
          pagingEnabled
        >
          {destination.images.map((image, index) => (
            <Image 
              key={index}
              source={{ uri: image }}
              style={styles.destinationImage}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        {/* Destination Info */}
        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{destination.name}</Text>
              <View style={styles.locationContainer}>
                <MapPin size={16} color={Colors.primary} />
                <Text style={styles.location}>{destination.location}</Text>
              </View>
            </View>
            <View style={styles.ratingContainer}>
              <Star size={20} fill={Colors.warning} color={Colors.warning} />
              <Text style={styles.ratingText}>{destination.rating}</Text>
              <Text style={styles.reviewCount}>({destination.reviews})</Text>
            </View>
          </View>

          <Text style={styles.description}>{destination.description}</Text>

          {/* Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Opening Hours:</Text>
              <View style={styles.detailValueContainer}>
                <Clock size={16} color={Colors.primary} style={styles.detailIcon} />
                <Text style={styles.detailValue}>{destination.openingHours}</Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Entry Fee:</Text>
              <Text style={[styles.detailValue, { color: Colors.primary }]}>
                {destination.entryFee}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Address:</Text>
              <Text style={styles.detailValue}>{destination.address}</Text>
            </View>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.featuresContainer}>
              {destination.features.map((feature, index) => (
                <View key={index} style={styles.featureTag}>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  imageGallery: {
    height: 250,
  },
  destinationImage: {
    width: 375,
    height: 250,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 8,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textLight,
    flex: 1,
  },
  detailValueContainer: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  detailIcon: {
    marginRight: 8,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  featureTag: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  featureText: {
    fontSize: 12,
    color: Colors.text,
  },
  actionButtons: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
  },
  directionsButton: {
    backgroundColor: Colors.card,
    marginRight: 8,
  },
  bookButton: {
    backgroundColor: Colors.primary,
  },
  directionsButtonText: {
    color: Colors.primary,
    fontWeight: "600",
    marginLeft: 8,
  },
  bookButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
