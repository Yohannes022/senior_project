import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MapPin, Navigation, ArrowRight, Calendar, Clock } from 'lucide-react-native';
import theme from '@/constants/theme';
import useAppStore from '@/store/useAppStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {RouteCard} from '@/components/ui/RouteCard';
import { Location } from '@/types';

export default function RoutesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [destination, setDestination] = useState<Location | null>(null);
  
  const { 
    currentLocation,
    availableRoutes,
    selectedRoute,
    setSelectedRoute,
  } = useAppStore();

  useEffect(() => {
    if (params.destination) {
      try {
        const parsedDestination = JSON.parse(params.destination as string);
        setDestination(parsedDestination);
      } catch (error) {
        console.error('Error parsing destination:', error);
      }
    }
  }, [params]);

  const handleSearchPress = () => {
    router.push('/search');
  };

  const handleRouteSelect = (route: any) => {
    setSelectedRoute(route);
  };

  const handleContinue = () => {
    if (selectedRoute) {
      router.push({
        pathname: '/route-details',
        params: { routeId: selectedRoute.id }
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        {/* Origin and Destination */}
        <Card style={styles.locationCard}>
          <View style={styles.locationRow}>
            <View style={styles.locationIconContainer}>
              <Navigation size={20} color="#FFFFFF" />
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>From</Text>
              <Text style={styles.locationName}>
                {currentLocation?.name || 'Current Location'}
              </Text>
            </View>
          </View>
          
          <View style={styles.locationDivider} />
          
          <View style={styles.locationRow}>
            <View style={[styles.locationIconContainer, { backgroundColor: theme.colors.secondary }]}>
              <MapPin size={20} color="#FFFFFF" />
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>To</Text>
              {destination ? (
                <Text style={styles.locationName}>{destination.name || 'Destination'}</Text>
              ) : (
                <TouchableOpacity onPress={handleSearchPress}>
                  <Text style={styles.searchPrompt}>Select destination</Text>
                </TouchableOpacity>
              )}
            </View>
            {destination && (
              <TouchableOpacity 
                style={styles.changeButton}
                onPress={handleSearchPress}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>

        {/* Departure Time */}
        <Card style={styles.timeCard}>
          <View style={styles.timeHeader}>
            <Text style={styles.timeTitle}>Departure Time</Text>
            <TouchableOpacity style={styles.timeToggle}>
              <Text style={styles.timeToggleText}>Now</Text>
              <ArrowRight size={16} color={theme.colors.primary} />
              <Text style={styles.timeToggleTextActive}>Schedule</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.timeSelectors}>
            <TouchableOpacity style={styles.dateSelector}>
              <Calendar size={18} color={theme.colors.primary} />
              <Text style={styles.dateSelectorText}>Today</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.timeSelector}>
              <Clock size={18} color={theme.colors.primary} />
              <Text style={styles.timeSelectorText}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Available Routes */}
        {destination && (
          <>
            <Text style={styles.sectionTitle}>Available Routes</Text>
            
            {availableRoutes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                onSelect={handleRouteSelect}
                isSelected={selectedRoute?.id === route.id}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      {selectedRoute && (
        <View style={styles.bottomBar}>
          <Button
            title="Continue"
            onPress={handleContinue}
            fullWidth
            size="large"
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  locationCard: {
    marginBottom: theme.spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.subtext,
  },
  locationName: {
    fontSize: theme.fontSizes.md,
    fontWeight: '500',
    color: theme.colors.text,
    marginTop: 2,
  },
  searchPrompt: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.primary,
    marginTop: 2,
  },
  changeButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.highlight,
    borderRadius: theme.borderRadius.sm,
  },
  changeButtonText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  locationDivider: {
    height: 20,
    width: 1,
    backgroundColor: theme.colors.border,
    marginLeft: 18,
  },
  timeCard: {
    marginBottom: theme.spacing.lg,
  },
  timeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  timeTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  timeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.highlight,
    borderRadius: theme.borderRadius.round,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  timeToggleText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.subtext,
    marginRight: theme.spacing.xs,
  },
  timeToggleTextActive: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  timeSelectors: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
  },
  dateSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.highlight,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.sm,
  },
  dateSelectorText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.primary,
    fontWeight: '500',
    marginLeft: theme.spacing.sm,
  },
  timeSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.highlight,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  timeSelectorText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.primary,
    fontWeight: '500',
    marginLeft: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  bottomBar: {
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
});