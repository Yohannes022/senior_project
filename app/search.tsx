import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, X, MapPin, Star, StarOff } from 'lucide-react-native';
import theme from '@/constants/theme';
import useAppStore from '@/store/useAppStore';
import Input from '@/components/ui/Input';
import LocationSearchItem from '@/components/ui/LocationSearchItem';
import { suggestedLocations } from '@/mocks/transitData';
import { Location } from '@/types';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  
  const { 
    recentSearches, 
    addRecentSearch,
    user
  } = useAppStore();

  const favoriteLocations = user?.favoriteLocations || [];

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      
      // Simulate API call with timeout
      const timeoutId = setTimeout(() => {
        const filtered = suggestedLocations.filter(location => 
          location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (location.address && location.address.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setSearchResults(filtered);
        setIsSearching(false);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleLocationSelect = (location: Location) => {
    addRecentSearch(location);
    router.push({
      pathname: '/routes',
      params: { 
        destination: JSON.stringify(location)
      }
    });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const isFavorite = (location: Location) => {
    return favoriteLocations.some(favLocation => 
      favLocation.name === location.name
    );
  };

  const toggleFavorite = (location: Location) => {
    // This would update the user's favorite locations in a real app
    console.log('Toggle favorite for:', location.name);
  };

  const renderEmptyResults = () => (
    <View style={styles.emptyContainer}>
      <MapPin size={48} color={theme.colors.subtext} />
      <Text style={styles.emptyTitle}>No results found</Text>
      <Text style={styles.emptyText}>
        Try searching for a different location or address
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search for a destination"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearable
          autoFocus
          leftIcon={<Search size={20} color={theme.colors.subtext} />}
          containerStyle={styles.searchInputContainer}
        />
      </View>

      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : searchQuery.trim() ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => `search-${item.name}-${index}`}
          renderItem={({ item }) => (
            <LocationSearchItem
              location={item}
              onPress={handleLocationSelect}
              isFavorite={isFavorite(item)}
              onToggleFavorite={toggleFavorite}
            />
          )}
          ListEmptyComponent={renderEmptyResults}
          style={styles.list}
        />
      ) : (
        <>
          {recentSearches.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                <TouchableOpacity>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={recentSearches}
                keyExtractor={(item, index) => `recent-${item.name}-${index}`}
                renderItem={({ item }) => (
                  <LocationSearchItem
                    location={item}
                    onPress={handleLocationSelect}
                    isRecent
                    isFavorite={isFavorite(item)}
                    onToggleFavorite={toggleFavorite}
                  />
                )}
                scrollEnabled={false}
              />
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggested Locations</Text>
            <FlatList
              data={suggestedLocations}
              keyExtractor={(item, index) => `suggested-${item.name}-${index}`}
              renderItem={({ item }) => (
                <LocationSearchItem
                  location={item}
                  onPress={handleLocationSelect}
                  isFavorite={isFavorite(item)}
                  onToggleFavorite={toggleFavorite}
                />
              )}
              scrollEnabled={false}
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
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchInputContainer: {
    marginBottom: 0,
  },
  list: {
    flex: 1,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  clearText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.subtext,
    textAlign: 'center',
  },
});