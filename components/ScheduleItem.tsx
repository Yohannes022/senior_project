import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Bus, Train, Clock } from "lucide-react-native";
import Colors from "@/constants/colors";

type ScheduleItemProps = {
  type: string;
  number: string;
  line?: string;
  route: string;
  departures: string[];
  price: string;
  onBookTicket?: () => void;
};

export default function ScheduleItem({ 
  type, 
  number, 
  line, 
  route, 
  departures, 
  price,
  onBookTicket
}: ScheduleItemProps) {
  const getIcon = () => {
    if (type === "Bus") {
      return <Bus size={24} color={Colors.primary} />;
    } else if (type === "Train") {
      return <Train size={24} color={Colors.secondary} />;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {getIcon()}
        </View>
        
        <View style={styles.routeInfo}>
          <Text style={styles.routeTitle}>
            {type} {number || line}
          </Text>
          <Text style={styles.routeText}>{route}</Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>{price}</Text>
        </View>
      </View>
      
      <View style={styles.departuresContainer}>
        <View style={styles.departuresHeader}>
          <Clock size={16} color={Colors.textLight} />
          <Text style={styles.departuresTitle}>Departures</Text>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timesList}
        >
          {departures.map((time, index) => (
            <TouchableOpacity key={index} style={styles.timeButton}>
              <Text style={styles.timeText}>{time}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <TouchableOpacity style={styles.bookButton} onPress={onBookTicket}>
        <Text style={styles.bookButtonText}>Book Ticket</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
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
  routeText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  priceContainer: {
    backgroundColor: Colors.primaryLight + "30",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  departuresContainer: {
    marginBottom: 16,
  },
  departuresHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  departuresTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.textLight,
    marginLeft: 6,
  },
  timesList: {
    paddingBottom: 4,
  },
  timeButton: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeText: {
    fontSize: 14,
    color: Colors.text,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
