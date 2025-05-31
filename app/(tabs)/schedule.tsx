import React, { useState } from "react";
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Bus, Train, Car } from "lucide-react-native";
import Colors from "@/constants/colors";

import ScheduleItem from "@/components/ScheduleItem";
import { schedules } from "@/constants/mockData";

export default function ScheduleScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  
  const filteredSchedules = activeTab === "all" 
    ? schedules 
    : schedules.filter(item => item.type.toLowerCase() === activeTab);

  const handleBookTicket = (scheduleId: string) => {
    router.push(`/booking?scheduleId=${scheduleId}`);
  };

  const renderScheduleItem = ({ item }: { item: typeof schedules[0] }) => (
    <ScheduleItem
      type={item.type}
      number={item.number || ""}  // Add empty string as fallback
      line={item.line || ""}      // Add empty string as fallback
      route={item.route}
      departures={item.departures}
      price={item.price}
      onBookTicket={() => handleBookTicket(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Transit Schedule</Text>
      </View>
      
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
          style={[styles.tab, activeTab === "bus" && styles.activeTab]}
          onPress={() => setActiveTab("bus")}
        >
          <Bus size={16} color={activeTab === "bus" ? Colors.primary : Colors.textLight} />
          <Text style={[styles.tabText, activeTab === "bus" && styles.activeTabText]}>
            Bus
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === "train" && styles.activeTab]}
          onPress={() => setActiveTab("train")}
        >
          <Train size={16} color={activeTab === "train" ? Colors.primary : Colors.textLight} />
          <Text style={[styles.tabText, activeTab === "train" && styles.activeTabText]}>
            Train
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === "taxi" && styles.activeTab]}
          onPress={() => setActiveTab("taxi")}
        >
          <Car size={16} color={activeTab === "taxi" ? Colors.primary : Colors.textLight} />
          <Text style={[styles.tabText, activeTab === "taxi" && styles.activeTabText]}>
            Taxi
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredSchedules}
        renderItem={renderScheduleItem}
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: Colors.card,
  },
  activeTab: {
    backgroundColor: Colors.primaryLight + "30",
  },
  tabText: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 4,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
