import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { formatCurrency } from '@/utils/formatters';

interface PaymentConfirmationProps {
  amount: number;
  transactionId: string;
  paymentMethod: string;
  onDone: () => void;
  receiptUrl?: string;
}

const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  amount,
  transactionId,
  paymentMethod,
  onDone,
  receiptUrl,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="check-circle" size={80} color="#4CAF50" />
        </View>
        
        <Text style={styles.title}>Payment Successful!</Text>
        
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>{formatCurrency(amount)}</Text>
          <Text style={styles.currency}>ETB</Text>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID:</Text>
            <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="middle">
              {transactionId}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method:</Text>
            <Text style={styles.detailValue}>
              {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>
              {new Date().toLocaleDateString('en-ET', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
        
        {receiptUrl && (
          <TouchableOpacity 
            style={styles.receiptButton}
            onPress={() => {
              // Implement receipt download or view functionality
              console.log('View receipt:', receiptUrl);
            }}
          >
            <MaterialIcons name="receipt" size={20} color="#4CAF50" />
            <Text style={styles.receiptButtonText}>View Receipt</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity style={styles.doneButton} onPress={onDone}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 32,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333333',
  },
  currency: {
    fontSize: 20,
    color: '#666666',
    marginLeft: 4,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
    maxWidth: '60%',
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    alignSelf: 'center',
  },
  receiptButtonText: {
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 8,
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PaymentConfirmation;
