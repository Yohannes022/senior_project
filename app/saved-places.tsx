import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Plus, 
  MapPin, 
  Home, 
  Briefcase, 
  Heart, 
  Star, 
  Search, 
  X,
  ChevronRight
} from 'lucide-react-native';
import Colors from '@/constants/colors';

type Place = {
  id: string;
  name: string;
  address: string;
  type: 'home' | 'work' | 'favorite' | 'other';
  isFavorite: boolean;
};

export default function SavedPlacesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState<Place[]>([
    // Initial places can be loaded here if needed
    {
      id: '1',
      name: 'Home',
      address: 'Bole Road, Addis Ababa',
      type: 'home',
      isFavorite: true,
    },
    {
      id: '2',
      name: 'Work',
      address: 'Kazanchis, Addis Ababa',
      type: 'work',
      isFavorite: false,
    },
    {
      id: '3',
      name: 'Meskel Square',
      address: 'Meskel Square, Addis Ababa',
      type: 'favorite',
      isFavorite: true,
    },
    {
      id: '4',
      name: 'Unity Park',
      address: 'Entoto Road, Addis Ababa',
      type: 'other',
      isFavorite: true,
    },
  ]);

  const handleAddHome = () => {
    if (places.some(p => p.type === 'home')) return;
    
    const newPlace: Place = {
      id: Date.now().toString(),
      name: 'Home',
      address: 'Bole Road, Addis Ababa',
      type: 'home',
      isFavorite: true,
    };
    setPlaces([...places, newPlace]);
  };

  const handleAddWork = () => {
    if (places.some(p => p.type === 'work')) return;
    
    const newPlace: Place = {
      id: Date.now().toString(),
      name: 'Work',
      address: 'Kazanchis, Addis Ababa',
      type: 'work',
      isFavorite: false,
    };
    setPlaces([...places, newPlace]);
  };

  const handleAddFavorite = () => {
    const newPlace: Place = {
      id: Date.now().toString(),
      name: 'Favorite Place',
      address: 'Add address',
      type: 'favorite',
      isFavorite: true,
    };
    setPlaces([...places, newPlace]);
  };

  const filteredPlaces = places.filter(place => 
    place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPlaceIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home size={20} color={Colors.primary} />;
      case 'work':
        return <Briefcase size={20} color={Colors.secondary} />;
      case 'favorite':
        return <Heart size={20} color={Colors.danger} fill={Colors.danger} />;
      default:
        return <MapPin size={20} color={Colors.textLight} />;
    }
  };

  const toggleFavorite = (id: string) => {
    setPlaces(places.map(place => 
      place.id === id ? { ...place, isFavorite: !place.isFavorite } : place
    ));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Saved Places',
          headerShown: true,
          headerTitleStyle: {
            color: Colors.text,
            fontFamily: 'outfit-semibold',
          },
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={Colors.textLight} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search saved places"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.textLight}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <X size={18} color={Colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={handleAddHome}
            disabled={places.some(p => p.type === 'home')}
          >
            <View style={[
              styles.quickActionIcon, 
              { 
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                opacity: places.some(p => p.type === 'home') ? 0.5 : 1
              }
            ]}>
              <Home size={20} color={Colors.primary} />
            </View>
            <Text style={[
              styles.quickActionText,
              places.some(p => p.type === 'home') && { color: Colors.textLight }
            ]}>
              {places.some(p => p.type === 'home') ? 'Home Added' : 'Add Home'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={handleAddWork}
            disabled={places.some(p => p.type === 'work')}
          >
            <View style={[
              styles.quickActionIcon, 
              { 
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                opacity: places.some(p => p.type === 'work') ? 0.5 : 1
              }
            ]}>
              <Briefcase size={20} color={Colors.secondary} />
            </View>
            <Text style={[
              styles.quickActionText,
              places.some(p => p.type === 'work') && { color: Colors.textLight }
            ]}>
              {places.some(p => p.type === 'work') ? 'Work Added' : 'Add Work'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={handleAddFavorite}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <Heart size={20} color={Colors.danger} />
            </View>
            <Text style={styles.quickActionText}>Add Favorite</Text>
          </TouchableOpacity>
        </View>

        {/* Saved Places List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Places</Text>
          
          {filteredPlaces.length === 0 ? (
            <View style={styles.emptyState}>
              <MapPin size={48} color={Colors.textLight} />
              <Text style={styles.emptyStateText}>No saved places found</Text>
              <Text style={styles.emptyStateSubtext}>Save your favorite places for quick access</Text>
              <TouchableOpacity style={styles.addButton}>
                <Plus size={20} color={Colors.primary} />
                <Text style={styles.addButtonText}>Add New Place</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placesList}>
              {filteredPlaces.map((place) => (
                <TouchableOpacity 
                  key={place.id} 
                  style={styles.placeCard}
                  onPress={() => {}}
                >
                  <View style={styles.placeIcon}>
                    {getPlaceIcon(place.type)}
                  </View>
                  <View style={styles.placeInfo}>
                    <Text style={styles.placeName} numberOfLines={1}>{place.name}</Text>
                    <Text style={styles.placeAddress} numberOfLines={1}>{place.address}</Text>
                  </View>
                  <View style={styles.placeActions}>
                    <TouchableOpacity 
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleFavorite(place.id);
                      }}
                      style={styles.favoriteButton}
                    >
                      {place.isFavorite ? (
                        <Heart size={20} color={Colors.danger} fill={Colors.danger} />
                      ) : (
                        <Heart size={20} color={Colors.textLight} />
                      )}
                    </TouchableOpacity>
                    <ChevronRight size={20} color={Colors.textLight} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: Colors.background,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: 'outfit-regular',
    color: Colors.text,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  quickActionButton: {
    alignItems: 'center',
    marginRight: 16,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'outfit-regular',
    color: Colors.text,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'outfit-semibold',
    color: Colors.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: 'outfit-semibold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'outfit-regular',
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: Colors.primary,
    fontFamily: 'outfit-medium',
    marginLeft: 8,
  },
  placesList: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.inputBackground,
    marginBottom: 8,
    borderRadius: 12,
  },
  placeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  placeInfo: {
    flex: 1,
    marginRight: 12,
  },
  placeName: {
    fontSize: 16,
    fontFamily: 'outfit-medium',
    color: Colors.text,
    marginBottom: 2,
  },
  placeAddress: {
    fontSize: 13,
    fontFamily: 'outfit-regular',
    color: Colors.textLight,
  },
  placeActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteButton: {
    padding: 8,
    marginRight: 4,
  },
});
