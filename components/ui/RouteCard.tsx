import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Route, RouteSegment } from '@/types';
import theme from '@/constants/theme';
import Card from './Card';
import { Clock, ArrowRight, Bus, Train, Footprints, ChevronsUp } from 'lucide-react-native';

interface RouteCardProps {
  route: Route;
  onSelect: (route: Route) => void;
  isSelected?: boolean;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, onSelect, isSelected = false }) => {
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
        return <Footprints size={16} color={theme.colors.subtext} />;
      case 'transit':
        if (segment.route?.type === 'bus') {
          return <Bus size={16} color={segment.route.color || theme.colors.primary} />;
        }
        return <Train size={16} color={segment.route?.color || theme.colors.primary} />;
      case 'wait':
        return <Clock size={16} color={theme.colors.subtext} />;
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity onPress={() => onSelect(route)} activeOpacity={0.7}>
      <Card 
        style={[
          styles.card, 
          isSelected && styles.selectedCard
        ]}
      >
        <View style={styles.header}>
          <View style={styles.timeContainer}>
            <Text style={styles.time}>{formatTime(route.departureTime)}</Text>
            <Text style={styles.time}>{formatTime(route.arrivalTime)}</Text>
          </View>
          <View style={styles.durationContainer}>
            <Clock size={16} color={theme.colors.subtext} />
            <Text style={styles.duration}>{formatDuration(route.totalDuration)}</Text>
          </View>
          <View style={styles.fareContainer}>
            <Text style={styles.fare}>{route.fare} ETB</Text>
          </View>
        </View>

        <View style={styles.seatsContainer}>
          <ChevronsUp size={16} color={theme.colors.success} />
          <Text style={styles.seatsText}>
            {route.availableSeats} {route.availableSeats === 1 ? 'seat' : 'seats'} available
          </Text>
        </View>

        <View style={styles.routeVisualizer}>
          {route.segments.map((segment, index) => (
            <View key={index} style={styles.segment}>
              <View style={styles.segmentIconContainer}>
                {getSegmentIcon(segment)}
              </View>
              <View style={styles.segmentDetails}>
                <Text style={styles.segmentType}>
                  {segment.type === 'transit' 
                    ? segment.route?.name 
                    : segment.type === 'walk' 
                      ? `Walk ${segment.distance ? `(${(segment.distance / 1000).toFixed(1)} km)` : ''}` 
                      : 'Wait'}
                </Text>
                <Text style={styles.segmentTime}>{formatDuration(segment.duration)}</Text>
              </View>
              {index < route.segments.length - 1 && (
                <View style={styles.connector}>
                  <ArrowRight size={12} color={theme.colors.subtext} />
                </View>
              )}
            </View>
          ))}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.highlight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginRight: theme.spacing.md,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
  },
  fareContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fare: {
    fontSize: theme.fontSizes.md,
    fontWeight: '500',
    color: theme.colors.text,
  },
  seatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  seatsText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.success,
    fontWeight: '500',
    marginLeft: 4,
  },
  routeVisualizer: {
    marginTop: theme.spacing.sm,
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  segmentIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  segmentDetails: {
    flex: 1,
  },
  segmentType: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    fontWeight: '500',
  },
  segmentTime: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.subtext,
  },
  connector: {
    marginHorizontal: theme.spacing.xs,
  },
});