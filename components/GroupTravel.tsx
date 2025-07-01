import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useFeatures } from "@/hooks/useFeatures";
import { GroupTravelOption } from "@/types/pricing";

interface GroupTravelProps {
  routeId: string;
  basePrice: number;
  onSelectOption: (option: GroupTravelOption) => void;
}

export const GroupTravel = ({
  routeId,
  basePrice,
  onSelectOption,
}: GroupTravelProps) => {
  const { groupOptions, loading, error, createGroupBooking } = useFeatures();
  const [selectedOption, setSelectedOption] =
    useState<GroupTravelOption | null>(null);
  const [passengerCount, setPassengerCount] = useState(1);
  const [travelDate, setTravelDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Filter options for the current route
  const routeOptions = groupOptions.filter(
    (option) => option.availableRoutes.includes(routeId) && option.isActive
  );

  // Calculate savings
  const calculateSavings = (option: GroupTravelOption) => {
    const discount = option.discountPercentage / 100;
    const totalDiscount = basePrice * passengerCount * discount;
    const totalPrice = basePrice * passengerCount - totalDiscount;
    return { totalDiscount, totalPrice };
  };

  //   const handleBookGroup = async () => {
  //     if (!selectedOption || !travelDate) {
  //       Alert.alert('Error', 'Please select an option and travel date');
  //       return;
  //     }

  //     try {
  //       const { totalPrice } = calculateSavings(selectedOption);

  //       const booking = {
  //         organizerId: 'current-user-id', // Replace with actual user ID
  //         routeId,
  //         travelDate: new Date(travelDate),
  //         passengers: passengerCount,
  //         totalAmount: totalPrice,
  //       };

  //       const result = await createGroupBooking(booking);
  //       onSelectOption(selectedOption);
  //       Alert.alert('Success', 'Your group booking has been created!');

  //     } catch (error) {
  //       Alert.alert('Error', 'Failed to create group booking. Please try again.');
  //       console.error('Booking error:', error);
  //     }
  //   };

  const handleBookGroup = async () => {
    if (!selectedOption || !travelDate) {
      Alert.alert("Error", "Please select an option and travel date");
      return;
    }

    try {
      const { totalPrice, totalDiscount } = calculateSavings(selectedOption);

      const booking = {
        organizerId: "current-user-id", // Replace with actual user ID
        routeId,
        travelDate: new Date(travelDate),
        passengers: passengerCount,
        totalAmount: totalPrice,
        discountApplied: totalDiscount,
        discountPercentage: selectedOption.discountPercentage,
      };

      const result = await createGroupBooking(booking);
      onSelectOption(selectedOption);
      Alert.alert("Success", "Your group booking has been created!");
    } catch (error) {
      Alert.alert("Error", "Failed to create group booking. Please try again.");
      console.error("Booking error:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading group travel options...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (routeOptions.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No group travel options available for this route.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Group Travel Options</Text>
      <Text style={styles.subtitle}>Save more when you travel together</Text>

      <View style={styles.passengerSelector}>
        <Text style={styles.label}>Number of Passengers:</Text>
        <View style={styles.counter}>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => setPassengerCount(Math.max(1, passengerCount - 1))}
            disabled={passengerCount <= 1}
          >
            <MaterialIcons name="remove" size={20} color="#333" />
          </TouchableOpacity>
          <Text style={styles.counterValue}>{passengerCount}</Text>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() => setPassengerCount(passengerCount + 1)}
          >
            <MaterialIcons name="add" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.datePicker}>
        <Text style={styles.label}>Travel Date:</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{travelDate || "Select date"}</Text>
          <MaterialIcons name="calendar-today" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <View style={styles.datePickerModal}>
          {/* In a real app, you would use a proper date picker component here */}
          <Text>Date picker would appear here</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(false)}>
            <Text style={styles.doneButton}>Done</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.optionsContainer}>
        {routeOptions.map((option) => {
          const isSelected = selectedOption?.id === option.id;
          const { totalDiscount, totalPrice } = calculateSavings(option);

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedOption(option)}
            >
              <View style={styles.optionHeader}>
                <Text style={styles.optionName}>{option.name}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    {option.discountPercentage}% OFF
                  </Text>
                </View>
              </View>

              <Text style={styles.optionDescription}>{option.description}</Text>

              <View style={styles.priceContainer}>
                <View>
                  <Text style={styles.originalPrice}>
                    ETB {basePrice * passengerCount}
                  </Text>
                  <Text style={styles.discountedPrice}>
                    ETB {totalPrice.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.savingsText}>
                  Save ETB {totalDiscount.toFixed(2)}
                </Text>
              </View>

              <Text style={styles.minPassengers}>
                Min. {option.minPassengers} passengers • Max{" "}
                {option.maxPassengers}
              </Text>

              {isSelected && (
                <View style={styles.selectedIndicator}>
                  <MaterialIcons
                    name="check-circle"
                    size={20}
                    color="#4CAF50"
                  />
                  <Text style={styles.selectedText}>Selected</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[
          styles.bookButton,
          (!selectedOption || !travelDate) && styles.bookButtonDisabled,
        ]}
        onPress={handleBookGroup}
        disabled={!selectedOption || !travelDate}
      >
        <Text style={styles.bookButtonText}>
          {selectedOption
            ? `Book Group (${selectedOption.name})`
            : "Select an option to book"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  passengerSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  counterValue: {
    marginHorizontal: 16,
    fontSize: 18,
    fontWeight: "600",
  },
  datePicker: {
    marginBottom: 20,
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  datePickerModal: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  doneButton: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
    marginTop: 16,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  optionCardSelected: {
    borderColor: "#4CAF50",
    backgroundColor: "#f8f9fa",
  },
  optionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  optionName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  discountBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  optionDescription: {
    color: "#666",
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  originalPrice: {
    textDecorationLine: "line-through",
    color: "#999",
    fontSize: 14,
  },
  discountedPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  savingsText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  minPassengers: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  selectedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  selectedText: {
    color: "#4CAF50",
    marginLeft: 4,
    fontWeight: "600",
  },
  bookButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  bookButtonDisabled: {
    backgroundColor: "#a5d6a7",
  },
  bookButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});
