import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import Colors from '@/constants/colors';

// Mock data for demonstration
const mockVehicleData = [
  {
    id: '1',
    type: 'Taxi',
    plate: 'AA123AA',
    driver: 'Abebe Kebede',
    code: 'TX-4567',
    rating: 4.5,
    status: 'Available',
    distance: 1.2,
    coordinates: { latitude: 9.005401, longitude: 38.763611 },
    route: 'Megenagna to Bole',
    fare: '150 ETB',
    capacity: 4,
    lastUpdated: '2 min ago',
    comments: [
      { user: 'John', rating: 5, comment: 'Great driver, very professional', date: '2023-06-15' },
      { user: 'Sara', rating: 4, comment: 'Clean car and safe driver', date: '2023-06-10' },
    ],
  },
  // Add more mock data as needed
];

const USER_LOCATION = {
  latitude: 9.0227,  // Approximate center of Addis Ababa
  longitude: 38.7469,
};

// Function to calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export default function VehicleDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Process and find the selected vehicle
  useEffect(() => {
    const vehicle = mockVehicleData.find(v => v.id === id);
    if (vehicle) {
      setSelectedVehicle({
        ...vehicle,
        distance: calculateDistance(
          USER_LOCATION.latitude,
          USER_LOCATION.longitude,
          vehicle.coordinates.latitude,
          vehicle.coordinates.longitude
        ).toFixed(1)
      });
    }
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  if (!selectedVehicle) {
    return (
      <View style={styles.centered}>
        <Text>Loading vehicle details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.vehicleType}>
            <Ionicons 
              name={selectedVehicle.type === 'Taxi' ? 'car-sport' : 'bus'}
              size={24} 
              color={Colors.primary} 
            />
            <Text style={styles.vehicleTypeText}>
              {selectedVehicle.type} • {selectedVehicle.plate}
            </Text>
          </View>
          
          <View style={styles.driverInfo}>
            <View>
              <Text style={styles.driverName}>{selectedVehicle.driver}</Text>
              <Text style={styles.vehicleCode}>{selectedVehicle.code}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color={Colors.warning} />
              <Text style={styles.ratingText}>{selectedVehicle.rating}</Text>
            </View>
          </View>

          <View style={styles.statusContainer}>
            <View 
              style={[
                styles.statusBadge,
                { 
                  backgroundColor: selectedVehicle.status === 'Available' 
                    ? 'rgba(40, 167, 69, 0.1)' 
                    : 'rgba(255, 193, 7, 0.1)' 
                }
              ]}
            >
              <View 
                style={[
                  styles.statusDot,
                  { 
                    backgroundColor: selectedVehicle.status === 'Available' 
                      ? Colors.success 
                      : Colors.warning 
                  }
                ]} 
              />
              <Text 
                style={[
                  styles.statusText,
                  { 
                    color: selectedVehicle.status === 'Available' 
                      ? Colors.success 
                      : Colors.warning 
                  }
                ]}
              >
                {selectedVehicle.status}
              </Text>
            </View>
            <View style={styles.distanceBadge}>
              <Ionicons name="navigate" size={14} color={Colors.primary} />
              <Text style={styles.distanceText}>{selectedVehicle.distance} km</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="location" size={20} color={Colors.textLight} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Current Location</Text>
              <Text style={styles.detailValue}>{selectedVehicle.route.split(' to ')[0]}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="cash" size={20} color={Colors.textLight} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Fare</Text>
              <Text style={styles.detailValue}>{selectedVehicle.fare}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="people" size={20} color={Colors.textLight} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Capacity</Text>
              <Text style={styles.detailValue}>{selectedVehicle.capacity} people</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="time" size={20} color={Colors.textLight} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Last Updated</Text>
              <Text style={styles.detailValue}>{selectedVehicle.lastUpdated}</Text>
            </View>
          </View>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>User Reviews</Text>
          {selectedVehicle.comments.map((comment: any, index: number) => (
            <View key={index} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentUser}>{comment.user}</Text>
                <View style={styles.commentRating}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons 
                      key={i} 
                      name={i < Math.floor(comment.rating) ? 'star' : 'star-outline'} 
                      size={16} 
                      color={Colors.warning} 
                    />
                  ))}
                </View>
              </View>
              <Text style={styles.commentText}>{comment.comment}</Text>
              <Text style={styles.commentDate}>{comment.date}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => {
            // Handle book now
          }}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  vehicleType: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleTypeText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  driverInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  driverName: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  vehicleCode: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    marginLeft: 4,
    color: Colors.text,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 110, 253, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  distanceText: {
    marginLeft: 4,
    color: Colors.primary,
    fontWeight: '500',
  },
  detailsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailTextContainer: {
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 2,
  },
  commentsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  commentCard: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  commentUser: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  commentRating: {
    flexDirection: 'row',
  },
  commentText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  commentDate: {
    fontSize: 12,
    color: Colors.textLight,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
