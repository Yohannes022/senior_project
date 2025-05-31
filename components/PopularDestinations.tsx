import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { MapPin, Building, ShoppingBag, Landmark } from "lucide-react-native";
import Colors from "@/constants/colors";
import { popularDestinations } from "@/constants/mockData";

type PopularDestinationsProps = {
  onDestinationSelect?: (destinationId: string) => void;
};

const getIcon = (iconName: string) => {
  switch (iconName) {
    case "plane":
      return <Building size={20} color="#FFFFFF" />;
    case "shopping-bag":
      return <ShoppingBag size={20} color="#FFFFFF" />;
    case "tree":
      return <Landmark size={20} color="#FFFFFF" />;
    case "map-pin":
    default:
      return <MapPin size={20} color="#FFFFFF" />;
  }
};

export default function PopularDestinations({ onDestinationSelect }: PopularDestinationsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Popular Destinations</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {popularDestinations.map((destination) => (
          <TouchableOpacity 
            key={destination.id} 
            style={styles.destinationCard}
            onPress={() => onDestinationSelect && onDestinationSelect(destination.id)}
          >
            <View style={styles.iconContainer}>
              {getIcon(destination.icon)}
            </View>
            <Text style={styles.destinationName} numberOfLines={2}>
              {destination.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingLeft: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  scrollContent: {
    paddingRight: 16,
  },
  destinationCard: {
    alignItems: "center",
    marginRight: 16,
    width: 100,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  destinationName: {
    fontSize: 14,
    color: Colors.text,
    textAlign: "center",
  },
});
