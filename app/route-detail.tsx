import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  Clock, 
  Users, 
  Share2, 
  MapPin, 
  Navigation, 
  ArrowRight,
  Bus,
  Train,
  Footprints,
  ArmchairIcon
} from 'lucide-react-native';
import theme from '@/constants/theme';
import useAppStore from '@/store/useAppStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Route, RouteSegment, Seat } from '@/types';
import SeatSelector from '@/components/ui/SeatSelector';

export default function RouteDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [route, setRoute] = useState<Route | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  
  const { availableRoutes } = useAppStore();

  useEffect(() => {
    if (params.routeId) {
      const foundRoute = availableRoutes.find(r => r.id === params.routeId);
      if (foundRoute) {
        setRoute(foundRoute);
      }
    }
  }, [params, availableRoutes]);

  const handleBuyTicket = () => {
    if (selectedSeat) {
      router.push({
        pathname: '/payment',
        params: { 
          routeId: route?.id,
          seatNumber: selectedSeat
        }
      });
    } else {
      router.push('/payment');
    }
  };

  const handleShare = () => {
    // In a real app, this would use the Share API
    console.log('Share route:', route?.id);
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes > 0 ? `${remainingMinutes}m` : ''}`;
  };

  const getSegmentIcon = (segment: RouteSegment) => {
    switch (segment.type) {
      case 'walk':
        return <Footprints size={20} color={theme.colors.subtext} />;
      case 'transit':
        if (segment.route?.type === 'bus') {
          return <Bus size={20} color={segment.route.color || theme.colors.primary} />;
        }
        return <Train size={20} color={segment.route?.color || theme.colors.primary} />;
      case 'wait':
        return <Clock size={20} color={theme.colors.subtext} />;
      default:
        return null;
    }
  };

  if (!route) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading route details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.timeContainer}>
              <Text style={styles.timeLabel}>Departure</Text>
              <Text style={styles.timeValue}>{formatTime(route.departureTime)}</Text>
            </View>
            <View style={styles.timeArrow}>
              <ArrowRight size={20} color={theme.colors.subtext} />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeLabel}>Arrival</Text>
              <Text style={styles.timeValue}>{formatTime(route.arrivalTime)}</Text>
            </View>
          </View>
          
          <View style={styles.summaryDetails}>
            <View style={styles.summaryItem}>
              <Clock size={18} color={theme.colors.primary} />
              <Text style={styles.summaryText}>{formatDuration(route.totalDuration)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryText}>{route.fare} ETB</Text>
            </View>
            <View style={styles.summaryItem}>
              <ArmchairIcon size={18} color={theme.colors.primary} />
              <Text style={styles.summaryText}>{route.availableSeats} seats available</Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <Button 
              title="Reserve Seat" 
              onPress={handleBuyTicket}
              style={styles.buyButton}
              disabled={!selectedSeat}
            />
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={handleShare}
            >
              <Share2 size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Select Your Seat</Text>
        
        <Card style={styles.seatSelectorCard}>
          <SeatSelector 
            availableSeats={route.availableSeats || 0}
            onSelectSeat={setSelectedSeat}
            selectedSeat={selectedSeat}
          />
          {selectedSeat ? (
            <Text style={styles.selectedSeatText}>
              You selected seat <Text style={styles.seatNumber}>{selectedSeat}</Text>
            </Text>
          ) : (
            <Text style={styles.seatPrompt}>Please select a seat to continue</Text>
          )}
        </Card>

        <Text style={styles.sectionTitle}>Route Details</Text>
        
        <Card style={styles.routeCard}>
          {route.segments.map((segment, index) => (
            <View key={index} style={styles.segmentContainer}>
              <View style={styles.timelineContainer}>
                <View style={[
                  styles.timelineDot,
                  index === 0 && styles.timelineStart,
                  index === route.segments.length - 1 && styles.timelineEnd
                ]}>
                  {index === 0 ? (
                    <Navigation size={16} color="#FFFFFF" />
                  ) : index === route.segments.length - 1 ? (
                    <MapPin size={16} color="#FFFFFF" />
                  ) : (
                    getSegmentIcon(segment)
                  )}
                </View>
                {index < route.segments.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
              </View>
              
              <View style={styles.segmentDetails}>
                <View style={styles.segmentHeader}>
                  <Text style={styles.segmentLocation}>
                    {index === 0 ? 'Start from' : index === route.segments.length - 1 ? 'Arrive at' : ''}
                    {' '}{segment.from.name}
                  </Text>
                  {segment.departureTime && (
                    <Text style={styles.segmentTime}>{formatTime(segment.departureTime)}</Text>
                  )}
                </View>
                
                {segment.type !== 'wait' && (
                  <View style={styles.segmentAction}>
                    <View style={styles.segmentIconContainer}>
                      {getSegmentIcon(segment)}
                    </View>
                    <View style={styles.segmentActionDetails}>
                      <Text style={styles.segmentActionText}>
                        {segment.type === 'transit' 
                          ? `Take ${segment.route?.name} for ${formatDuration(segment.duration)}`
                          : `Walk for ${formatDuration(segment.duration)} (${(segment.distance || 0) / 1000} km)`}
                      </Text>
                      {segment.type === 'transit' && segment.route && (
                        <View style={[styles.routeBadge, { backgroundColor: segment.route.color }]}>
                          <Text style={styles.routeBadgeText}>{segment.route.type}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
                
                {index === route.segments.length - 1 && (
                  <View style={styles.segmentHeader}>
                    <Text style={styles.segmentLocation}>{segment.to.name}</Text>
                    {segment.arrivalTime && (
                      <Text style={styles.segmentTime}>{formatTime(segment.arrivalTime)}</Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          ))}
        </Card>

        <Card style={styles.fareCard}>
          <Text style={styles.fareTitle}>Fare Details</Text>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Base fare</Text>
            <Text style={styles.fareValue}>{route.fare - 5} ETB</Text>
          </View>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Seat reservation fee</Text>
            <Text style={styles.fareValue}>5 ETB</Text>
          </View>
          <View style={styles.fareDivider} />
          <View style={styles.fareRow}>
            <Text style={styles.fareTotalLabel}>Total</Text>
            <Text style={styles.fareTotalValue}>{route.fare} ETB</Text>
          </View>
        </Card>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          title={selectedSeat ? `Reserve Seat ${selectedSeat}` : "Select a Seat"}
          onPress={handleBuyTicket}
          fullWidth
          size="large"
          disabled={!selectedSeat}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
  },
  scrollView: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  summaryCard: {
    marginBottom: theme.spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  timeContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.subtext,
  },
  timeValue: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 2,
  },
  timeArrow: {
    marginHorizontal: theme.spacing.sm,
  },
  summaryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buyButton: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  shareButton: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  seatSelectorCard: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  selectedSeatText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  seatNumber: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  seatPrompt: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.subtext,
    marginTop: theme.spacing.md,
    fontStyle: 'italic',
  },
  routeCard: {
    marginBottom: theme.spacing.lg,
  },
  segmentContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  timelineContainer: {
    width: 40,
    alignItems: 'center',
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineStart: {
    backgroundColor: theme.colors.primary,
  },
  timelineEnd: {
    backgroundColor: theme.colors.success,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.border,
    position: 'absolute',
    top: 32,
    bottom: 0,
    left: 19,
  },
  segmentDetails: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  segmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  segmentLocation: {
    fontSize: theme.fontSizes.md,
    fontWeight: '500',
    color: theme.colors.text,
  },
  segmentTime: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.subtext,
  },
  segmentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.highlight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  segmentIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  segmentActionDetails: {
    flex: 1,
  },
  segmentActionText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  routeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    marginTop: 4,
  },
  routeBadgeText: {
    fontSize: theme.fontSizes.xs,
    color: '#FFFFFF',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  fareCard: {
    marginBottom: theme.spacing.xl,
  },
  fareTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  fareLabel: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  fareValue: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  fareDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  fareTotalLabel: {
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  fareTotalValue: {
    fontSize: theme.fontSizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  bottomBar: {
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
});