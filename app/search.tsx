import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft, Search, MapPin, Clock, X } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useAppStore } from "@/stores/useAppStore";

export default function SearchScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const { recentSearches, addRecentSearch, clearRecentSearches } = useAppStore();
  
  const popularLocations = [
    { id: "1", name: "Bole International Airport", address: "Bole, Addis Ababa" },
    { id: "2", name: "Meskel Square", address: "Central Addis Ababa" },
    { id: "3", name: "Unity Park", address: "Near National Palace" },
    { id: "4", name: "Merkato", address: "Addis Ketema, Addis Ababa" },
    { id: "5", name: "National Museum", address: "King George VI Street" },
  ];

  const handleSearch = () => {
    if (searchText.trim()) {
      addRecentSearch(searchText);
      router.push(`/directions?location=${searchText}`);
    }
  };

  const handleLocationSelect = (location: string) => {
    addRecentSearch(location);
    router.push(`/directions?location=${location}`);
  };

  const renderRecentItem = ({ item }: { item: string }) => (
    <TouchableOpacity 
      style={styles.searchItem}
      onPress={() => handleLocationSelect(item)}
    >
      <Clock size={20} color={Colors.textLight} />
      <Text style={styles.searchItemText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderPopularItem = ({ item }: { item: typeof popularLocations[0] }) => (
    <TouchableOpacity 
      style={styles.searchItem}
      onPress={() => handleLocationSelect(item.name)}
    >
      <MapPin size={20} color={Colors.primary} />
      <View style={styles.locationInfo}>
        <Text style={styles.locationName}>{item.name}</Text>
        <Text style={styles.locationAddress}>{item.address}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a location"
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <X size={20} color={Colors.textLight} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      
      {recentSearches.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={clearRecentSearches}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={recentSearches}
            renderItem={renderRecentItem}
            keyExtractor={(item, index) => `recent-${index}`}
            scrollEnabled={false}
          />
        </View>
      )}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Locations</Text>
        <FlatList
          data={popularLocations}
          renderItem={renderPopularItem}
          keyExtractor={item => `popular-${item.id}`}
          scrollEnabled={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: Colors.text,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  clearText: {
    fontSize: 14,
    color: Colors.primary,
  },
  searchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchItemText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  locationInfo: {
    marginLeft: 12,
  },
  locationName: {
    fontSize: 16,
    color: Colors.text,
  },
  locationAddress: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
});
