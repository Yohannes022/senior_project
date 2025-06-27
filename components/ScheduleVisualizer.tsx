import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { useScheduling } from '@/contexts/SchedulingContext';
import Colors from '@/constants/colors';

interface ScheduleVisualizerProps {
  showDetails?: boolean;
  onRoutePress?: (routeId: string) => void;
}

const ScheduleVisualizer: React.FC<ScheduleVisualizerProps> = ({
  showDetails = true,
  onRoutePress,
}) => {
  const { currentAllocations, timeOfDay, lastUpdated, isLoading, error } = useScheduling();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Format time of day for display
  const formatTimeOfDay = (time: string) => {
    return time.charAt(0).toUpperCase() + time.slice(1);
  };

  // Format last updated time
  const formatLastUpdated = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString();
  };

  // Get color based on vehicle allocation percentage
  const getAllocationColor = (allocated: number, base: number) => {
    const percentage = (allocated / base) * 100;
    if (percentage > 150) return Colors.danger;
    if (percentage > 100) return Colors.warning;
    return Colors.success;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: isDark ? '#fff' : '#000' }]}>
          Updating schedule...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  if (currentAllocations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: isDark ? '#ccc' : '#666' }]}>
          No schedule data available
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.timeOfDay, { color: isDark ? Colors.primaryLight : Colors.primary }]}>
          {formatTimeOfDay(timeOfDay)}
        </Text>
        <Text style={[styles.lastUpdated, { color: isDark ? '#aaa' : '#666' }]}>
          Updated: {formatLastUpdated(lastUpdated)}
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {currentAllocations.map((allocation) => (
          <View 
            key={allocation.routeId} 
            style={[
              styles.routeCard, 
              { 
                backgroundColor: isDark ? '#2a2a2a' : '#fff',
                borderColor: isDark ? '#444' : '#e0e0e0'
              }
            ]}
            onTouchEnd={() => onRoutePress?.(allocation.routeId)}
          >
            <View style={styles.routeHeader}>
              <Text style={[styles.routeName, { color: isDark ? '#fff' : '#000' }]}>
                {allocation.routeId}
              </Text>
              <View style={[
                styles.allocationBadge,
                { 
                  backgroundColor: getAllocationColor(
                    allocation.allocatedVehicles,
                    allocation.allocatedVehicles // Using current as base for now
                  )
                }
              ]}>
                <Text style={styles.allocationText}>
                  {allocation.allocatedVehicles} vehicles
                </Text>
              </View>
            </View>
            
            {showDetails && (
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: isDark ? '#aaa' : '#666' }]}>
                    Time of Day:
                  </Text>
                  <Text style={[styles.detailValue, { color: isDark ? '#fff' : '#000' }]}>
                    {formatTimeOfDay(allocation.timeOfDay)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: isDark ? '#aaa' : '#666' }]}>
                    Last Updated:
                  </Text>
                  <Text style={[styles.detailValue, { color: isDark ? '#fff' : '#000' }]}>
                    {formatLastUpdated(allocation.lastUpdated)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 8,
  },
  timeOfDay: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lastUpdated: {
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  routeCard: {
    margin: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  allocationBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  allocationText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  detailsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    margin: 10,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
  },
});

export default ScheduleVisualizer;
