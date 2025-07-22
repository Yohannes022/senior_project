import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Search, MapPin, Clock, X, ArrowLeft } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useAppStore } from "@/stores/useAppStore";

const PLACES_API_KEY = "YOUR_GOOGLE_PLACES_API_KEY"; // Replace with your actual API key

interface SearchResult {
  id: string;
  name: string;
  address: string;
  place_id: string;
}

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    type?: 'from' | 'to';
    currentFrom?: string;
    currentTo?: string;
  }>();
  
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const { recentSearches, addRecentSearch, clearRecentSearches } = useAppStore();
  
  // Set initial search text based on the type (from/to)
  useEffect(() => {
    if (params.type === 'from' && params.currentFrom) {
      setSearchText(params.currentFrom);
    } else if (params.type === 'to' && params.currentTo) {
      setSearchText(params.currentTo);
    }
  }, [params]);
  
  const handleSearch = async (text: string) => {
    setSearchText(text);
    
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      // In a real app, you would call the Google Places API here
      // This is a simplified example with mock data
      const mockResults = await searchPlaces(text);
      setSearchResults(mockResults);
    } catch (error) {
      console.error("Error searching places:", error);
      // Fallback to recent searches if API fails
      setSearchResults(recentSearches
        .filter(item => item.toLowerCase().includes(text.toLowerCase()))
        .map((item, index) => ({
          id: `recent-${index}`,
          name: item,
          address: item,
          place_id: `recent-${index}`
        }))
      );
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleLocationSelect = async (location: SearchResult) => {
    addRecentSearch(location.name);
    
    // Get coordinates for the selected location
    try {
      const geocoded = await Location.geocodeAsync(location.name);
      if (geocoded.length > 0) {
        const coords = {
          latitude: geocoded[0].latitude,
          longitude: geocoded[0].longitude,
        };
        
        // Navigate back to the previous screen with the selected location
        if (params?.type === 'from') {
          // Navigate to map screen with the selected location as origin
          router.push({
            pathname: "/map-screen",
            params: {
              origin: JSON.stringify(coords),
              originName: location.name,
              destination: params.currentTo || '',
              type: 'from'
            }
          });
        } else if (params?.type === 'to') {
          // Navigate to map screen with the selected location as destination
          router.push({
            pathname: "/map-screen",
            params: {
              origin: params.currentFrom || 'Current Location',
              destination: location.name,
              destinationCoords: JSON.stringify(coords),
              type: 'to'
            }
          });
        } else {
          // If no type specified, just navigate back with the location
          router.back();
        }
      }
    } catch (error) {
      console.error('Error getting coordinates for location:', error);
      // Fallback to just going back if geocoding fails
      router.back();
    }
  };
  
  const popularLocations = [
    { id: "1", name: "Bole International Airport", address: "Bole, Addis Ababa" },
    { id: "2", name: "Meskel Square", address: "Central Addis Ababa" },
    { id: "3", name: "Unity Park", address: "Near National Palace" },
    { id: "4", name: "Merkato", address: "Addis Ketema, Addis Ababa" },
    { id: "5", name: "National Museum", address: "King George VI Street" },
  ];

  // All styles are defined in a single StyleSheet.create() at the bottom of the file

  const renderSearchItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity 
      style={styles.searchItem}
      onPress={() => handleLocationSelect(item)}
    >
      <MapPin size={20} color={Colors.primary} />
      <View style={styles.locationInfo}>
        <Text style={styles.locationName} numberOfLines={1} ellipsizeMode="tail">
          {item.name}
        </Text>
        <Text 
          style={styles.locationAddress} 
          numberOfLines={1} 
          ellipsizeMode="tail"
        >
          {item.address}
        </Text>
      </View>
    </TouchableOpacity>
  );
  
  const renderRecentItem = ({ item }: { item: string }) => (
    <TouchableOpacity 
      style={styles.searchItem}
      onPress={() => handleLocationSelect({
        id: `recent-${item}`,
        name: item,
        address: item,
        place_id: `recent-${item}`
      })}
    >
      <Clock size={20} color={Colors.textLight} />
      <View style={styles.locationInfo}>
        <Text style={styles.locationName} numberOfLines={1} ellipsizeMode="tail">
          {item}
        </Text>
      </View>
    </TouchableOpacity>
  );
  
  const renderPopularItem = ({ item }: { item: typeof popularLocations[0] }) => (
    <TouchableOpacity 
      style={styles.searchItem}
      onPress={() => handleLocationSelect({
        id: item.id,
        name: item.name,
        address: item.address,
        place_id: item.id
      })}
    >
      <MapPin size={20} color={Colors.primary} />
      <View style={styles.locationInfo}>
        <Text style={styles.locationName} numberOfLines={1} ellipsizeMode="tail">
          {item.name}
        </Text>
        <Text 
          style={styles.locationAddress} 
          numberOfLines={1} 
          ellipsizeMode="tail"
        >
          {item.address}
        </Text>
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
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              params?.type === 'from' 
                ? 'Enter pickup location' 
                : 'Where to?'
            }
            value={searchText}
            onChangeText={handleSearch}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => handleSearch(searchText)}
            clearButtonMode="while-editing"
            placeholderTextColor={Colors.textLight}
          />
        </View>
      </View>
      
      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : searchText ? (
        <FlatList
          data={searchResults}
          renderItem={renderSearchItem}
          keyExtractor={(item) => item.place_id}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No results found for "{searchText}"
              </Text>
            </View>
          }
        />
      ) : (
        <>
          {recentSearches.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={clearRecentSearches}>
                  <Text style={styles.clearText}>Clear All</Text>
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={recentSearches}
                renderItem={renderRecentItem}
                keyExtractor={(item, index) => `recent-${index}`}
              />
            </View>
          )}
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Locations</Text>
            <FlatList
              data={popularLocations}
              renderItem={renderPopularItem}
              keyExtractor={(item) => item.id}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card || '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text || '#1E293B',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textLight || '#64748B',
    textAlign: 'center',
  },
  section: {
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    padding: 16,
    paddingBottom: 8,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text || '#1E293B',
  },
  clearText: {
    fontSize: 14,
    color: Colors.primary || '#3B82F6',
  },
  searchItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border || '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentSearchItem: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border || '#E2E8F0',
  },
  popularItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border || '#E2E8F0',
  },
  locationName: {
    fontSize: 16,
    color: Colors.text || '#1E293B',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: Colors.textLight || '#64748B',
  },
  recentSearchIcon: {
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  // locationName: {
  //   fontSize: 16,
  //   color: Colors.text,
  //   marginBottom: 2,
  // },
  // locationAddress: {
  //   fontSize: 14,
  //   color: Colors.textLight,
  // },
  // recentSearchIcon: {
  //   marginRight: 12,
  // }
});
