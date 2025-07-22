import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import { MapPin, Calendar, Clock, ArrowRight, RotateCcw } from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Location from 'expo-location';
import Colors from "@/constants/colors";

type TripPlannerProps = {
  onPlanTrip?: () => void;
};

export default function TripPlanner({ onPlanTrip }: TripPlannerProps) {
  const router = useRouter();
  const [from, setFrom] = useState("Current Location");
  const [to, setTo] = useState("");
  const [isNow, setIsNow] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleFindRoutes = useCallback(async () => {
    if (!to.trim()) {
      Alert.alert("Destination Required", "Please enter a destination");
      return;
    }

    setIsLoading(true);
    
    try {
      // If the user wants to use current location
      if (from === "Current Location") {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Permission Denied", "Location permission is required to find routes from your current location");
          return;
        }
        
        const location = await Location.getCurrentPositionAsync({});
        const currentLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        
        // Get address from current coordinates for display
        const address = await Location.reverseGeocodeAsync(currentLocation);
        const displayAddress = address[0]?.name || 'Current Location';
        
        // Navigate to map screen with current location and destination
        router.push({
          pathname: "/map-screen",
          params: {
            origin: JSON.stringify(currentLocation),
            originName: displayAddress,
            destination: to,
            departureTime: isNow ? 'now' : 'schedule'
          }
        });
      } else {
        // For manual from address, we'll let the map screen handle geocoding
        router.push({
          pathname: "/map-screen",
          params: {
            origin: from,
            destination: to,
            departureTime: isNow ? 'now' : 'schedule'
          }
        });
      }
      
      // Call the onPlanTrip callback if provided
      if (onPlanTrip) {
        onPlanTrip();
      }
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get your current location. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [from, to, isNow, router, onPlanTrip]);

  const handleSearchPress = () => {
    router.push({
      pathname: "/search",
      params: { 
        type: 'to',
        currentFrom: from === "Current Location" ? '' : from,
        currentTo: to 
      }
    });
  };
  
  const handleFromPress = () => {
    router.push({
      pathname: "/search",
      params: {
        type: 'from',
        currentFrom: from === "Current Location" ? '' : from,
        currentTo: to
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where are you going?</Text>
      
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <MapPin size={20} color={Colors.primary} />
          <TouchableOpacity 
            style={styles.locationText}
            onPress={handleFromPress}
          >
            <Text style={styles.inputText} numberOfLines={1}>
              {from}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              // Swap from and to
              const temp = from;
              setFrom(to || "Current Location");
              setTo(temp === "Current Location" ? "" : temp);
            }}
          >
            <RotateCcw size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.inputRow}>
          <MapPin size={20} color={Colors.secondary} />
          <TouchableOpacity 
            style={styles.locationText}
            onPress={() => router.push({
              pathname: "/search",
              params: { 
                type: 'to',
                currentFrom: from === "Current Location" ? '' : from,
                currentTo: to
              }
            })}
          >
            <Text style={[styles.inputText, !to && { color: Colors.textLight }]} numberOfLines={1}>
              {to || "Where to?"}
            </Text>
          </TouchableOpacity>
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
      
      <TouchableOpacity 
        style={[styles.planButton, isLoading && styles.planButtonDisabled]}
        onPress={handleFindRoutes}
        disabled={isLoading}
      >
        <Text style={styles.planButtonText}>Find Routes</Text>
        <ArrowRight size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
    marginRight: 8,
  },
  locationText: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 8,
    marginLeft: 12,
    marginRight: 8,
  },
  planButtonDisabled: {
    opacity: 0.7,
  },
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
