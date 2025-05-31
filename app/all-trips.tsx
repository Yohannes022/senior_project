import React, { useState } from "react";
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft, Calendar, Clock, ArrowRight } from "lucide-react-native";
import Colors from "@/constants/colors";
import { recentTrips } from "@/constants/mockData";

export default function AllTripsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  
  const filteredTrips = activeTab === "all" 
    ? recentTrips 
    : recentTrips.filter(trip => trip.status.toLowerCase() === activeTab.toLowerCase());

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
      onPress={() => router.push(`/trip-details?id=${item.id}`)}
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
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen 
        options={{
          title: "My Trips",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "all" && styles.activeTab]}
          onPress={() => setActiveTab("all")}
        >
          <Text style={[styles.tabText, activeTab === "all" && styles.activeTabText]}>
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
          onPress={() => setActiveTab("upcoming")}
        >
          <Text style={[styles.tabText, activeTab === "upcoming" && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === "completed" && styles.activeTab]}
          onPress={() => setActiveTab("completed")}
        >
          <Text style={[styles.tabText, activeTab === "completed" && styles.activeTabText]}>
            Completed
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === "cancelled" && styles.activeTab]}
          onPress={() => setActiveTab("cancelled")}
        >
          <Text style={[styles.tabText, activeTab === "cancelled" && styles.activeTabText]}>
            Cancelled
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredTrips}
        renderItem={renderTripItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginVertical: 16,
    flexWrap: "wrap",
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: Colors.card,
  },
  activeTab: {
    backgroundColor: Colors.primaryLight + "30",
  },
  tabText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  tripCard: {
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
