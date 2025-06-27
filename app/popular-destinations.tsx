import React from "react";
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft, MapPin, Star } from "lucide-react-native";
import Colors from "@/constants/colors";
import { popularDestinations } from "@/constants/mockData";

export default function PopularDestinationsScreen() {
  const router = useRouter();

  type DestinationRouteParams = {
    pathname: string;
    params: { id: string };
  };

  const renderDestination = ({ item }: { item: any }) => {
    const destinationRoute: DestinationRouteParams = {
      pathname: "/destination/[id]",
      params: { id: item.id }
    };
    
    return (
      <TouchableOpacity 
        style={styles.destinationCard}
        onPress={() => router.push(destinationRoute as any)}
      >
        <Image 
          source={{ uri: item.image }} 
          style={styles.destinationImage} 
          resizeMode="cover"
        />
        <View style={styles.destinationInfo}>
          <Text style={styles.destinationName}>{item.name}</Text>
          <View style={styles.destinationMeta}>
            <MapPin size={14} color={Colors.primary} />
            <Text style={styles.destinationLocation}>{item.location}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Star size={14} fill={Colors.warning} color={Colors.warning} />
            <Text style={styles.ratingText}>{item.rating} ({item.reviews} reviews)</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen 
        options={{
          title: "Popular Destinations",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <FlatList
        data={popularDestinations}
        renderItem={renderDestination}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Top Places to Visit</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 16,
  },
  destinationCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  destinationImage: {
    width: "100%",
    height: 160,
  },
  destinationInfo: {
    padding: 16,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  destinationMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  destinationLocation: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
  },
});
