import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { MapPin, Calendar, Clock, CreditCard, ChevronLeft, ChevronRight } from "lucide-react-native";
import Colors from "@/constants/colors";

export default function BookingScreen() {
  const router = useRouter();
  const [selectedVehicle, setSelectedVehicle] = useState("bus");
  const [selectedTime, setSelectedTime] = useState("08:30");
  const [selectedPayment, setSelectedPayment] = useState("wallet");

  const handleBooking = () => {
    // In a real app, this would process the booking
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen 
        options={{
          title: "Book a Ride",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route</Text>
          <View style={styles.routeCard}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.routeText}>Bole Road</Text>
            </View>
            
            <View style={styles.routeLine} />
            
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: Colors.secondary }]} />
              <Text style={styles.routeText}>Piassa</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Type</Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={[styles.optionButton, selectedVehicle === "bus" && styles.selectedOption]}
              onPress={() => setSelectedVehicle("bus")}
            >
              <Text style={[styles.optionText, selectedVehicle === "bus" && styles.selectedOptionText]}>
                Bus
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.optionButton, selectedVehicle === "train" && styles.selectedOption]}
              onPress={() => setSelectedVehicle("train")}
            >
              <Text style={[styles.optionText, selectedVehicle === "train" && styles.selectedOptionText]}>
                Train
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.optionButton, selectedVehicle === "taxi" && styles.selectedOption]}
              onPress={() => setSelectedVehicle("taxi")}
            >
              <Text style={[styles.optionText, selectedVehicle === "taxi" && styles.selectedOptionText]}>
                Taxi
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <View style={styles.dateContainer}>
            <View style={styles.dateSelector}>
              <Calendar size={20} color={Colors.primary} />
              <Text style={styles.dateText}>Today, May 22</Text>
              <ChevronRight size={20} color={Colors.textLight} />
            </View>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScroll}>
            {["07:30", "08:00", "08:30", "09:00", "09:30", "10:00"].map((time) => (
              <TouchableOpacity 
                key={time}
                style={[styles.timeButton, selectedTime === time && styles.selectedTimeButton]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[styles.timeText, selectedTime === time && styles.selectedTimeText]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentOptions}>
            <TouchableOpacity 
              style={[styles.paymentOption, selectedPayment === "wallet" && styles.selectedPaymentOption]}
              onPress={() => setSelectedPayment("wallet")}
            >
              <View style={styles.paymentIconContainer}>
                <CreditCard size={24} color={Colors.primary} />
              </View>
              <View style={styles.paymentDetails}>
                <Text style={styles.paymentTitle}>Sheger Wallet</Text>
                <Text style={styles.paymentBalance}>Balance: 450 ETB</Text>
              </View>
              {selectedPayment === "wallet" && (
                <View style={styles.selectedPaymentIndicator} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.paymentOption, selectedPayment === "points" && styles.selectedPaymentOption]}
              onPress={() => setSelectedPayment("points")}
            >
              <View style={styles.paymentIconContainer}>
                <MapPin size={24} color={Colors.secondary} />
              </View>
              <View style={styles.paymentDetails}>
                <Text style={styles.paymentTitle}>Sheger Points</Text>
                <Text style={styles.paymentBalance}>Available: 350 points</Text>
              </View>
              {selectedPayment === "points" && (
                <View style={styles.selectedPaymentIndicator} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Route</Text>
            <Text style={styles.summaryValue}>Bole Road to Piassa</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Vehicle</Text>
            <Text style={styles.summaryValue}>Bus #105</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date & Time</Text>
            <Text style={styles.summaryValue}>Today, {selectedTime}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment</Text>
            <Text style={styles.summaryValue}>
              {selectedPayment === "wallet" ? "Sheger Wallet" : "Sheger Points"}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>35 ETB</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
          <Text style={styles.bookButtonText}>Confirm Booking</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
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
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  optionButton: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
  },
  selectedOptionText: {
    color: "#FFFFFF",
  },
  dateContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 12,
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  dateText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
    marginLeft: 12,
  },
  timeScroll: {
    marginBottom: 8,
  },
  timeButton: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedTimeButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeText: {
    fontSize: 15,
    color: Colors.text,
  },
  selectedTimeText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  paymentOptions: {
    gap: 12,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedPaymentOption: {
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentDetails: {
    flex: 1,
    marginLeft: 12,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
  },
  paymentBalance: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  selectedPaymentIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  summarySection: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: Colors.textLight,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "500",
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
  bookButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 40,
    alignItems: "center",
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
