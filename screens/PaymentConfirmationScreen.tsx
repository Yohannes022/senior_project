import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { formatCurrency } from '@/utils/formatters';

interface PaymentConfirmationScreenProps {
  route: {
    params: {
      amount: number;
      transactionId: string;
      paymentMethod: string;
      rideId: string;
    };
  };
}

const PaymentConfirmationScreen: React.FC<PaymentConfirmationScreenProps> = ({ route }) => {
  const { amount, transactionId, paymentMethod, rideId } = route.params;
  const router = useRouter();
  
  const handleDone = () => {
    // Navigate to the home screen (root path)
    router.replace('/(tabs)');
  };
  
  const handleViewReceipt = () => {
    // In a real app, you would navigate to a receipt screen or open a PDF
    alert('Receipt will be available in your email');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="check-circle" size={64} color="#4CAF50" />
          </View>
        </View>
        
        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.amount}>{formatCurrency(amount)}</Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method:</Text>
            <Text style={styles.detailValue}>
              {paymentMethod === 'wallet' ? 'Sheger Wallet' : 
               paymentMethod === 'telebirr' ? 'Telebirr' : 'Chapa'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID:</Text>
            <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="middle">
              {transactionId}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time:</Text>
            <Text style={styles.detailValue}>
              {new Date().toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ride ID:</Text>
            <Text style={styles.detailValue}>
              {rideId}
            </Text>
          </View>
        </View>
        
        <View style={styles.pointsEarned}>
          <MaterialIcons name="star" size={20} color="#FFC107" />
          <Text style={styles.pointsText}>
            You've earned {Math.floor(amount * 0.1)} points
          </Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.receiptButton}
          onPress={handleViewReceipt}
        >
          <MaterialIcons name="receipt" size={20} color="#2196F3" />
          <Text style={styles.receiptButtonText}>View Receipt</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.doneButton}
          onPress={handleDone}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginTop: 40,
    marginBottom: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 32,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#757575',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '500',
    flex: 1.5,
    textAlign: 'right',
  },
  pointsEarned: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  pointsText: {
    marginLeft: 8,
    color: '#FF8F00',
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  receiptButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 8,
  },
  receiptButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  doneButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentConfirmationScreen;
