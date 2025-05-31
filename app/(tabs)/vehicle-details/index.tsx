import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ViewStyle, 
  TextStyle,
  StyleProp
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import * as tf from '@tensorflow/tfjs';
import * as tfreact from '@tensorflow/tfjs-react-native';
import * as nlp from '@tensorflow-models/universal-sentence-encoder';
type Sentiment = 'positive' | 'neutral' | 'negative';
type VehicleType = 'completed' | 'next_line' | 'waiting' | 'nearby';

interface Comment {
  id: string;
  user: string;
  rating: number;
  comment: string;
  sentiment: Sentiment;
}

interface VehicleData {
  id: string;
  name: string;
  type: string;
  capacity: number;
  route: string;
  averageRating: number;
  totalRatings: number;
  vehicleType: VehicleType;
  estimatedArrival?: string; // for next_line and nearby vehicles
  currentLocation?: string;   // for nearby vehicles
  waitTime?: string;          // for waiting vehicles
  nextDeparture?: string;     // for waiting vehicles
  comments: Comment[];
  stats: {
    cleanliness: number;
    comfort: number;
    punctuality: number;
    safety: number;
  };
}

// Mock data for vehicle details
const mockVehicles: Record<string, VehicleData> = {
  // Completed trip vehicle
  'completed': {
    id: '1',
    name: 'Bus #1234',
    type: 'City Bus',
    capacity: 50,
    route: 'Megenagna - Bole',
    averageRating: 4.5,
    totalRatings: 128,
    vehicleType: 'completed',
    stats: {
      cleanliness: 4.5,
      comfort: 4.3,
      punctuality: 4.7,
      safety: 4.6,
    },
    comments: [
      {
        id: '1',
        user: 'John D.',
        rating: 5,
        comment: 'Very clean and comfortable ride!',
        sentiment: 'positive',
      },
    ],
  },
  // Next in line vehicle
  'next_line': {
    id: '2',
    name: 'Minibus #456',
    type: 'Minibus',
    capacity: 12,
    route: 'Megenagna - Piazza',
    averageRating: 4.2,
    totalRatings: 85,
    vehicleType: 'next_line',
    estimatedArrival: '5 min',
    stats: {
      cleanliness: 4.2,
      comfort: 4.0,
      punctuality: 4.5,
      safety: 4.3,
    },
    comments: [
      {
        id: '1',
        user: 'Sarah M.',
        rating: 4,
        comment: 'Good service but a bit crowded during rush hours.',
        sentiment: 'positive',
      },
    ],
  },
  // Waiting vehicle
  'waiting': {
    id: '3',
    name: 'Bus #789',
    type: 'City Bus',
    capacity: 50,
    route: 'Megenagna - Mexico',
    averageRating: 4.2,
    totalRatings: 128,
    vehicleType: 'waiting',
    waitTime: '15 min',
    nextDeparture: '10:30 AM',
    stats: {
      cleanliness: 4.1,
      comfort: 3.9,
      punctuality: 4.3,
      safety: 4.0,
    },
    comments: [
      { id: '1', user: 'Alex', rating: 5, comment: 'Great service, always on time!', sentiment: 'positive' },
      { id: '2', user: 'Beth', rating: 3, comment: 'Average experience, could be better', sentiment: 'neutral' },
    ],
  },
  // Nearby vehicle
  'nearby': {
    id: '4',
    name: 'Minibus #101',
    type: 'Minibus',
    capacity: 14,
    route: 'Megenagna - Saris',
    averageRating: 4.0,
    totalRatings: 64,
    vehicleType: 'nearby',
    estimatedArrival: '8 min',
    currentLocation: '200m away',
    stats: {
      cleanliness: 4.0,
      comfort: 3.8,
      punctuality: 4.2,
      safety: 4.1,
    },
    comments: [
      { id: '1', user: 'Mike T.', rating: 4, comment: 'Good service, driver was friendly', sentiment: 'positive' },
    ],
  },
};

export default function VehicleDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  console.log('Vehicle ID:', id); // Debug log
  
  // Fetch vehicle data based on the ID
  const [vehicle, setVehicle] = useState<VehicleData>(() => {
    // Use the vehicle with the matching ID or fallback to the first vehicle
    const selectedVehicle = mockVehicles[id as string] || mockVehicles['1'];
    return {
      ...selectedVehicle,
      id: id as string || '1',
    };
  });
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<nlp.UniversalSentenceEncoder | null>(null);
  const [sentimentScore, setSentimentScore] = useState<number | null>(null);

  // Load the TensorFlow model
  useEffect(() => {
    async function loadModel() {
      await tf.ready();
      const loadedModel = await nlp.load();
      setModel(loadedModel);
    }
    loadModel();
  }, []);

  // Analyze sentiment of the comment
  const analyzeSentiment = async (text: string): Promise<number> => {
    if (!model) return 0.5; // Return neutral if model not loaded
    
    try {
      const embeddings = await model.embed([text]);
      const prediction = await embeddings.array() as number[][];
      await embeddings.dispose(); // Clean up
      
      if (!prediction[0]) return 0.5;
      
      // Simple sentiment score (0-1 where 1 is positive)
      const sum = prediction[0].reduce((acc: number, val: number) => acc + val, 0);
      return sum / prediction[0].length;
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return 0.5; // Return neutral on error
    }
  };

  const handleSubmit = async () => {
    if (!comment.trim() || rating === 0) {
      Alert.alert('Error', 'Please provide both a rating and comment');
      return;
    }

    setLoading(true);
    try {
      // Analyze sentiment
      const sentiment = await analyzeSentiment(comment);
      setSentimentScore(sentiment);
      
      // Determine sentiment label
      const sentimentLabel: Sentiment = 
        sentiment > 0.6 ? 'positive' : 
        sentiment < 0.4 ? 'negative' : 'neutral';
      
      // In a real app, you would send this data to your backend
      const newComment: Comment = {
        id: Date.now().toString(),
        user: 'Current User',
        rating,
        comment,
        sentiment: sentimentLabel,
      };

      console.log('New comment:', newComment);
      
      // Reset form
      setComment('');
      setRating(0);
      
      Alert.alert('Success', 'Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: Sentiment | string) => {
    switch (sentiment) {
      case 'positive': return Colors.success;
      case 'negative': return Colors.danger;
      default: return Colors.warning;
    }
  };

  const renderStars = (count: number, size = 20) => (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= count ? 'star' : 'star-outline'}
          size={size}
          color={Colors.warning}
        />
      ))}
    </View>
  );

  const renderComment = (item: Comment) => (
    <View key={item.id} style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentUser}>{item.user}</Text>
        <View style={styles.ratingContainer}>
          {renderStars(item.rating, 16)}
        </View>
      </View>
      <Text style={styles.commentText}>{item.comment}</Text>
      <View style={[
        styles.sentimentBadge,
        { backgroundColor: `${getSentimentColor(item.sentiment)}20` }
      ]}>
        <Text style={[
          styles.sentimentBadgeText,
          { color: getSentimentColor(item.sentiment) }
        ]}>
          {item.sentiment}
        </Text>
      </View>
    </View>
  );

  const renderStat = (label: string, value: number) => {
    const width = (value / 5) * 100;
    
    return (
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={styles.statBarContainer}>
          <View 
            style={[
              styles.statBar, 
              { width: `${width}%` as any },
              value >= 4 ? styles.statBarHigh : 
              value >= 3 ? styles.statBarMedium : 
              styles.statBarLow
            ]} 
          />
        </View>
        <Text style={styles.statValue}>{value.toFixed(1)}</Text>
      </View>
    );
  };

  // Render vehicle status badge based on vehicle type
  const renderVehicleStatus = () => {
    switch(vehicle.vehicleType) {
      case 'completed':
        return (
          <View style={[styles.statusBadge, styles.completedBadge]}>
            <Text style={styles.statusBadgeText}>Completed Trip</Text>
          </View>
        );
      case 'next_line':
        return (
          <View style={[styles.statusBadge, styles.nextLineBadge]}>
            <Text style={styles.statusBadgeText}>Next in Line</Text>
            <Text style={styles.statusDetail}>Arriving in: {vehicle.estimatedArrival}</Text>
          </View>
        );
      case 'waiting':
        return (
          <View style={[styles.statusBadge, styles.waitingBadge]}>
            <Text style={styles.statusBadgeText}>Waiting</Text>
            <Text style={styles.statusDetail}>Next Departure: {vehicle.nextDeparture}</Text>
            <Text style={styles.statusDetail}>Wait Time: {vehicle.waitTime}</Text>
          </View>
        );
      case 'nearby':
        return (
          <View style={[styles.statusBadge, styles.nearbyBadge]}>
            <Text style={styles.statusBadgeText}>Nearby</Text>
            <Text style={styles.statusDetail}>Arriving in: {vehicle.estimatedArrival}</Text>
            <Text style={styles.statusDetail}>{vehicle.currentLocation}</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Vehicle Details',
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.vehicleName}>{vehicle.name}</Text>
              <Text style={styles.vehicleType}>{vehicle.type} • {vehicle.capacity} seats</Text>
            </View>
            <View style={styles.ratingContainer}>
              {renderStars(Math.round(vehicle.averageRating))}
              <Text style={styles.ratingText}>
                {vehicle.averageRating.toFixed(1)} ({vehicle.totalRatings} ratings)
              </Text>
            </View>
          </View>
          
          {/* Vehicle Status Badge */}
          {renderVehicleStatus()}
          
          {/* Route Information */}
          <View style={styles.routeContainer}>
            <Text style={styles.sectionTitle}>Route</Text>
            <Text style={styles.routeText}>{vehicle.route}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsContainer}>
            {Object.entries(vehicle.stats).map(([key, value]) => (
              renderStat(key.charAt(0).toUpperCase() + key.slice(1), value)
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leave a Review</Text>
          <View style={styles.ratingInputContainer}>
            <Text style={styles.ratingLabel}>Your Rating:</Text>
            <View style={styles.starInput}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={32}
                    color={Colors.warning}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="Share your experience..."
            placeholderTextColor={Colors.textLight}
            multiline
          />
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </Text>
          </TouchableOpacity>
          {sentimentScore !== null && (
            <View style={styles.sentimentContainer}>
              <Text style={styles.sentimentText}>
                Detected sentiment: {sentimentScore > 0.6 ? 'Positive' : sentimentScore < 0.4 ? 'Negative' : 'Neutral'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          {vehicle.comments && vehicle.comments.length > 0 ? (
            vehicle.comments.map((item) => (
              <View key={item.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUser}>{item.user}</Text>
                  <View style={styles.ratingContainer}>
                    {renderStars(item.rating, 16)}
                  </View>
                </View>
                <Text style={styles.commentText}>{item.comment}</Text>
                <View style={[
                  styles.sentimentBadge,
                  { backgroundColor: `${getSentimentColor(item.sentiment)}20` }
                ]}>
                  <Text style={[
                    styles.sentimentBadgeText,
                    { color: getSentimentColor(item.sentiment) }
                  ]}>
                    {item.sentiment}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noComments}>No reviews yet. Be the first to review!</Text>
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
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  vehicleName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  vehicleType: {
    fontSize: 16,
    color: Colors.textLight,
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  statusBadge: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  completedBadge: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  nextLineBadge: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  waitingBadge: {
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  nearbyBadge: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
  },
  statusBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: Colors.text,
  },
  statusDetail: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  routeContainer: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  routeText: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statsContainer: {
    marginTop: 8,
  },
  statItem: {
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  statBarContainer: {
    height: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  statBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 10,
  },
  statBarHigh: {
    backgroundColor: Colors.success,
  },
  statBarMedium: {
    backgroundColor: Colors.warning,
  },
  statBarLow: {
    backgroundColor: Colors.danger,
  },
  statValue: {
    fontSize: 14,
    color: Colors.text,
    marginTop: 4,
    textAlign: 'right',
  },
  ratingInputContainer: {
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
  },
  starInput: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  starButton: {
    padding: 8,
  },
  commentInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
    fontSize: 16,
    color: Colors.text,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    opacity: 1,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sentimentContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  sentimentText: {
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  commentCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentUser: {
    fontWeight: '600',
    color: Colors.text,
  },
  commentText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  sentimentBadge: {
    padding: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  sentimentBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  noComments: {
    textAlign: 'center',
    color: Colors.textLight,
    marginTop: 16,
    fontStyle: 'italic',
  },
});

const styles2 = StyleSheet.create({
  header: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    margin: 16,
  },
  vehicleName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  vehicleType: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  starContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 16,
    color: Colors.textLight,
    marginLeft: 8,
  },
  section: {
    margin: 16,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  statsContainer: {
    marginTop: 8,
  },
  statItem: {
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  statBarContainer: {
    height: 20,
    backgroundColor: Colors.border,
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 8,
    justifyContent: 'space-between',
  },
  statBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
  },
  statValue: {
    color: Colors.text,
    fontWeight: 'bold',
    fontSize: 12,
  },
  ratingInputContainer: {
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
  },
  starInput: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  starButton: {
    marginRight: 8,
  },
  commentInput: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 8,
    padding: 12,
    color: Colors.text,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlign: 'left',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textLight,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sentimentContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  sentimentText: {
    fontSize: 14,
    color: Colors.text,
  },
  commentCard: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentUser: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  commentText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  noComments: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    padding: 16,
  },
  sentimentBadge: {
    alignSelf: 'flex-start',
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 4,
    paddingBottom: 4,
    borderRadius: 10,
  },
  sentimentBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statBarHigh: {
    backgroundColor: Colors.success,
  },
  statBarMedium: {
    backgroundColor: Colors.warning,
  },
  statBarLow: {
    backgroundColor: Colors.danger,
  },
});
