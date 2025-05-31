import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { ArrowRight, Clock, Calendar } from "lucide-react-native";
import Colors from "@/constants/colors";
import { recentTrips } from "@/constants/mockData";

type RecentTripsProps = {
  onTripSelect?: (tripId: string) => void;
  onViewAll?: () => void;
};

export default function RecentTrips({ onTripSelect, onViewAll }: RecentTripsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return Colors.success;
      case "Cancelled":
        return Colors.danger;
      case "Upcoming":
        return Colors.warning;
      default:
        return Colors.textLight;
    }
  };

  const renderTripItem = ({ item }: { item: typeof recentTrips[0] }) => (
    <TouchableOpacity 
      style={styles.tripCard}
      onPress={() => onTripSelect && onTripSelect(item.id)}
    >
      <View style={styles.tripHeader}>
        <View>
          <Text style={styles.tripRoute}>{item.from} to {item.to}</Text>
          <View style={styles.tripTimeContainer}>
            <Calendar size={14} color={Colors.textLight} />
            <Text style={styles.tripTimeText}>{item.date}</Text>
            <Clock size={14} color={Colors.textLight} />
            <Text style={styles.tripTimeText}>{item.time}</Text>
          </View>
        </View>
        <ArrowRight size={16} color={Colors.textLight} />
      </View>
      
      <View style={styles.tripFooter}>
        <Text style={[styles.tripStatus, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
        <Text style={styles.tripPrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Recent Trips</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={recentTrips}
        renderItem={renderTripItem}
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  listContent: {
    paddingRight: 16,
  },
  tripCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    width: 260,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tripRoute: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  tripTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tripTimeText: {
    fontSize: 13,
    color: Colors.textLight,
    marginLeft: 4,
    marginRight: 8,
  },
  tripFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  tripStatus: {
    fontSize: 14,
    fontWeight: "500",
  },
  tripPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
});
