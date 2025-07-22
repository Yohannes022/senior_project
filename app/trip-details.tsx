import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft, MapPin, Clock, Calendar, Bus, CreditCard, Star } from "lucide-react-native";
import Colors from "@/constants/colors";
import { recentTrips } from "@/constants/mockData";

export default function TripDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  // Find the trip by id
  const trip = recentTrips.find(trip => trip.id === id) || recentTrips[0];

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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen 
        options={{
          title: "Trip Details",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <Text style={[styles.statusText, { color: getStatusColor(trip.status) }]}>
            {trip.status}
          </Text>
          <Text style={styles.tripId}>Trip ID: #{trip.id}</Text>
        </View>
        
        <View style={styles.routeCard}>
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.routeText}>{trip.from}</Text>
          </View>
          
          <View style={styles.routeLine} />
          
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, { backgroundColor: Colors.secondary }]} />
            <Text style={styles.routeText}>{trip.to}</Text>
          </View>
        </View>
        
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Trip Details</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Calendar size={20} color={Colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{trip.date}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Clock size={20} color={Colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{trip.time}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Bus size={20} color={Colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Vehicle</Text>
              <Text style={styles.detailValue}>Bus #105</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <CreditCard size={20} color={Colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Payment</Text>
              <Text style={styles.detailValue}>Sheger Wallet</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.fareCard}>
          <Text style={styles.sectionTitle}>Fare Details</Text>
          
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Base Fare</Text>
            <Text style={styles.fareValue}>30 ETB</Text>
          </View>
          
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Service Fee</Text>
            <Text style={styles.fareValue}>5 ETB</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{trip.price}</Text>
          </View>
        </View>
        
        {trip.status === "Completed" && (
          <View style={styles.ratingCard}>
            <Text style={styles.sectionTitle}>Rate Your Trip</Text>
            
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} style={styles.starButton}>
                  <Star 
                    size={32} 
                    color={star <= 4 ? Colors.warning : Colors.border}
                    fill={star <= 4 ? Colors.warning : "none"}
                  />
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity style={styles.submitButton}>
              <Text style={styles.submitButtonText}>Submit Rating</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.actionsContainer}>
          {trip.status === "Upcoming" && (
            <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
              <Text style={styles.cancelButtonText}>Cancel Trip</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push("/booking" as any)}
          >
            <Text style={styles.actionButtonText}>Book Similar Trip</Text>
          </TouchableOpacity>
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
  statusCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  tripId: {
    fontSize: 14,
    color: Colors.textLight,
  },
  routeCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: Colors.border,
    marginLeft: 5,
  },
  detailsCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
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
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
    marginTop: 2,
  },
  fareCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  fareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  fareLabel: {
    fontSize: 15,
    color: Colors.textLight,
  },
  fareValue: {
    fontSize: 15,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },
  ratingCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  starButton: {
    marginHorizontal: 8,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  actionsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 40,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.danger,
  },
});
