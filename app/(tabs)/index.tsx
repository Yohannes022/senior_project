import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Search, Navigation, MapPin, Clock, Menu, Ticket } from 'lucide-react-native';
import theme from '@/constants/theme';
import useAppStore from '@/store/useAppStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { suggestedLocations } from '@/mocks/transitData';

export default function HomeScreen() {
  const router = useRouter();
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { 
    currentLocation, 
    setCurrentLocation,
    recentSearches,
  } = useAppStore();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      
      if (status === 'granted') {
        try {
          const location = await Location.getCurrentPositionAsync({});
          setCurrentLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        } catch (error) {
          console.error('Error getting location:', error);
          // Use a default location in Addis Ababa if we can't get the user's location
          setCurrentLocation({
            latitude: 9.0105,
            longitude: 38.7651,
            name: 'Meskel Square, Addis Ababa',
          });
        }
      } else {
        // Use a default location in Addis Ababa if permission is denied
        setCurrentLocation({
          latitude: 9.0105,
          longitude: 38.7651,
          name: 'Meskel Square, Addis Ababa',
        });
      }
      setIsLoading(false);
    })();
  }, []);

  const handleSearchPress = () => {
    router.push('/search');
  };

  const handleLocationSelect = (location: any) => {
    router.push({
      pathname: '/routes',
      params: { 
        destination: JSON.stringify(location)
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
          <Text style={styles.subtitle}>Where are you going today?</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Menu size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.searchBar}
        onPress={handleSearchPress}
        activeOpacity={0.7}
      >
        <Search size={20} color={theme.colors.subtext} />
        <Text style={styles.searchPlaceholder}>Search for a destination</Text>
      </TouchableOpacity>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Location */}
        <Card style={styles.locationCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Your Location</Text>
            {locationPermission === false && (
              <Button 
                title="Enable Location" 
                size="small"
                onPress={async () => {
                  const { status } = await Location.requestForegroundPermissionsAsync();
                  setLocationPermission(status === 'granted');
                }}
              />
            )}
          </View>
          <View style={styles.currentLocationContainer}>
            <View style={styles.locationIconContainer}>
              <Navigation size={24} color="#FFFFFF" />
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationName}>
                {isLoading 
                  ? 'Getting your location...' 
                  : currentLocation?.name || 'Current Location'}
              </Text>
              {currentLocation?.address && (
                <Text style={styles.locationAddress}>{currentLocation.address}</Text>
              )}
            </View>
          </View>
        </Card>

        {/* App Highlight */}
        <Card style={styles.highlightCard}>
          <View style={styles.highlightContent}>
            <View style={styles.highlightIconContainer}>
              <Ticket size={28} color="#FFFFFF" />
            </View>
            <View style={styles.highlightTextContainer}>
              <Text style={styles.highlightTitle}>Never Stand Again!</Text>
              <Text style={styles.highlightDescription}>
                Reserve your seat on public transport in Addis Ababa and travel comfortably.
              </Text>
            </View>
          </View>
          <Button 
            title="Reserve a Seat Now" 
            onPress={() => router.push('/search')}
            style={styles.highlightButton}
          />
        </Card>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <Card style={styles.recentCard}>
            <Text style={styles.cardTitle}>Recent Searches</Text>
            {recentSearches.slice(0, 3).map((location, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.recentItem}
                onPress={() => handleLocationSelect(location)}
              >
                <Clock size={20} color={theme.colors.subtext} />
                <View style={styles.recentTextContainer}>
                  <Text style={styles.recentName}>{location.name || 'Location'}</Text>
                  {location.address && (
                    <Text style={styles.recentAddress} numberOfLines={1}>
                      {location.address}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        )}

        {/* Suggested Locations */}
        <Card style={styles.suggestedCard}>
          <Text style={styles.cardTitle}>Popular Destinations</Text>
          <View style={styles.suggestedGrid}>
            {suggestedLocations.map((location, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.suggestedItem}
                onPress={() => handleLocationSelect(location)}
              >
                <View style={styles.suggestedIconContainer}>
                  <MapPin size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.suggestedName}>{location.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <Button 
              title="Find Route" 
              onPress={() => router.push('/search')}
              style={styles.actionButton}
              leftIcon={<MapPin size={18} color="#FFFFFF" />}
            />
            <Button 
              title="My Tickets" 
              onPress={() => router.push('/tickets')}
              style={styles.actionButton}
              variant="secondary"
              leftIcon={<Ticket size={18} color="#FFFFFF" />}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  greeting: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.subtext,
    marginTop: 4,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    color: theme.colors.subtext,
    fontSize: theme.fontSizes.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  locationCard: {
    marginBottom: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  currentLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationName: {
    fontSize: theme.fontSizes.md,
    fontWeight: '500',
    color: theme.colors.text,
  },
  locationAddress: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.subtext,
    marginTop: 2,
  },
  highlightCard: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.highlight,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  highlightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  highlightIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  highlightTextContainer: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  highlightDescription: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.subtext,
    lineHeight: 18,
  },
  highlightButton: {
    alignSelf: 'flex-start',
  },
  recentCard: {
    marginBottom: theme.spacing.md,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  recentTextContainer: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  recentName: {
    fontSize: theme.fontSizes.md,
    fontWeight: '500',
    color: theme.colors.text,
  },
  recentAddress: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.subtext,
    marginTop: 2,
  },
  suggestedCard: {
    marginBottom: theme.spacing.md,
  },
  suggestedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  suggestedItem: {
    width: '50%',
    padding: theme.spacing.xs,
  },
  suggestedIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  suggestedName: {
    fontSize: theme.fontSizes.md,
    fontWeight: '500',
    color: theme.colors.text,
  },
  actionsCard: {
    marginBottom: theme.spacing.xl,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
});