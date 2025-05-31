import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { MapPin, Calendar, Clock, ArrowRight, RotateCcw } from "lucide-react-native";
import Colors from "@/constants/colors";

type TripPlannerProps = {
  onPlanTrip?: () => void;
};

export default function TripPlanner({ onPlanTrip }: TripPlannerProps) {
  const [from, setFrom] = useState("Current Location");
  const [to, setTo] = useState("");
  const [isNow, setIsNow] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where are you going?</Text>
      
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <MapPin size={20} color={Colors.primary} />
          <TextInput
            style={styles.input}
            placeholder="From"
            value={from}
            onChangeText={setFrom}
          />
          <TouchableOpacity>
            <RotateCcw size={18} color={Colors.textLight} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.inputRow}>
          <MapPin size={20} color={Colors.secondary} />
          <TextInput
            style={styles.input}
            placeholder="To"
            value={to}
            onChangeText={setTo}
          />
        </View>
      </View>
      
      <View style={styles.timeSelector}>
        <TouchableOpacity 
          style={[styles.timeOption, isNow && styles.timeOptionActive]}
          onPress={() => setIsNow(true)}
        >
          <Clock size={16} color={isNow ? Colors.primary : Colors.textLight} />
          <Text style={[styles.timeText, isNow && styles.timeTextActive]}>Now</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.timeOption, !isNow && styles.timeOptionActive]}
          onPress={() => setIsNow(false)}
        >
          <Calendar size={16} color={!isNow ? Colors.primary : Colors.textLight} />
          <Text style={[styles.timeText, !isNow && styles.timeTextActive]}>Schedule</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.planButton} onPress={onPlanTrip}>
        <Text style={styles.planButtonText}>Find Routes</Text>
        <ArrowRight size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  inputContainer: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 8,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  timeSelector: {
    flexDirection: "row",
    marginBottom: 16,
  },
  timeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  timeOptionActive: {
    backgroundColor: Colors.primaryLight + "30",
  },
  timeText: {
    marginLeft: 4,
    fontSize: 14,
    color: Colors.textLight,
  },
  timeTextActive: {
    color: Colors.primary,
    fontWeight: "500",
  },
  planButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  planButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginRight: 8,
  },
});
