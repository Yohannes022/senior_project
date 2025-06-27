import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { MapPin, Clock, Users, Star } from "lucide-react-native";
import Colors from "@/constants/colors";
import { nearbyVehicles } from "@/constants/mockData";

type NearbyVehiclesProps = {
  onBookNow?: (vehicleId: string) => void;
  onVehicleSelect?: (vehicle: any) => void;
};

const VehicleIcon = ({ type }: { type: string }) => {
  let iconUrl = "";
  
  switch (type) {
    case "Bus":
      iconUrl = "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=100&auto=format&fit=crop";
      break;
    case "Taxi":
      iconUrl = "https://images.unsplash.com/photo-1559829604-f45b5d2afb1a?q=80&w=100&auto=format&fit=crop";
      break;
    case "Train":
      iconUrl = "https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=100&auto=format&fit=crop";
      break;
    default:
      iconUrl = "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=100&auto=format&fit=crop";
  }
  
  return (
    <Image 
      source={{ uri: iconUrl }} 
      style={styles.vehicleIcon} 
    />
  );
};

const getCrowdLevelColor = (level: string) => {
  switch (level) {
    case "Low":
      return Colors.success;
    case "Medium":
      return Colors.warning;
    case "High":
      return Colors.danger;
    default:
      return Colors.textLight;
  }
};

export default function NearbyVehicles({ onBookNow, onVehicleSelect }: NearbyVehiclesProps) {
  const renderVehicleItem = ({ item }: { item: typeof nearbyVehicles[0] }) => (
    <TouchableOpacity 
      style={styles.vehicleCard}
      onPress={() => onVehicleSelect && onVehicleSelect(item)}
    >
      <View style={styles.vehicleHeader}>
        <VehicleIcon type={item.type} />
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleTitle}>
            {item.type} {item.number || item.line}
          </Text>
          <Text style={styles.vehicleRoute}>
            {item.route}
          </Text>
        </View>
      </View>
      
      <View style={styles.vehicleDetails}>
        <View style={styles.detailItem}>
          <Clock size={14} color={Colors.textLight} />
          <Text style={styles.detailText}>{item.eta}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <MapPin size={14} color={Colors.textLight} />
          <Text style={styles.detailText}>{item.distance}</Text>
        </View>
        
        {item.crowdLevel && (
          <View style={styles.detailItem}>
            <Users size={14} color={getCrowdLevelColor(item.crowdLevel)} />
            <Text style={[styles.detailText, { color: getCrowdLevelColor(item.crowdLevel) }]}>
              {item.crowdLevel}
            </Text>
          </View>
        )}
        
        {item.rating && (
          <View style={styles.detailItem}>
            <Star size={14} color={Colors.warning} />
            <Text style={styles.detailText}>{item.rating}</Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.bookButton}
        onPress={(e) => {
          e.stopPropagation(); // Prevent triggering the parent onPress
          onBookNow && onBookNow(item.id);
        }}
      >
        <Text style={styles.bookButtonText}>Book Now</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Vehicles</Text>
      <FlatList
        data={nearbyVehicles}
        renderItem={renderVehicleItem}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
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
  listContent: {
    paddingRight: 16,
  },
  vehicleCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    width: 240,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  vehicleHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  vehicleInfo: {
    marginLeft: 12,
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  vehicleRoute: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  vehicleDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textLight,
    marginLeft: 4,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: 14,
  },
});
