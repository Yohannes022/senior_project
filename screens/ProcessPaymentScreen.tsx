import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { usePayment, type PaymentStatus } from '@/hooks/usePayment';
import { formatCurrency } from '@/utils/formatters';

type PaymentProvider = 'chapa' | 'flutterwave';

interface ProcessPaymentScreenProps {
  route: {
    params: {
      amount: number;
      description?: string;
      metadata?: Record<string, any>;
      onSuccess?: (result: any) => void;
      onFailure?: (error: any) => void;
    };
  };
  navigation: any;
}

const ProcessPaymentScreen: React.FC<ProcessPaymentScreenProps> = ({ route, navigation }) => {
  const { amount, description, metadata = {}, onSuccess, onFailure } = route.params;
  const { user } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider>('chapa');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  
  const { initializePayment, verifyPayment, status, error, receipt, reset } = usePayment();

  useEffect(() => {
    // Update local state based on payment hook status
    setPaymentStatus(status);
    
    if (status === 'success' && receipt) {
      handlePaymentSuccess(receipt);
    } else if (status === 'error' && error) {
      handlePaymentError(error);
    }
  }, [status, error, receipt]);

  const handlePayment = async () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please sign in to make a payment');
      return;
    }

    try {
      setIsProcessing(true);
      setPaymentStatus('processing');
      
      const paymentData = {
        amount,
        email: user.email,
        phoneNumber: user.phoneNumber,
        metadata: {
          userId: user.id,
          ...metadata,
        },
      };

      const response = await initializePayment(selectedProvider, amount, user.email);
      
      // The payment initialization was successful, but we'll handle the actual payment in the effect hook
      console.log('Payment initialized:', response);
      
    } catch (err) {
      console.error('Payment error:', err);
      handlePaymentError(err instanceof Error ? err.message : 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = (paymentReceipt: any) => {
    console.log('Payment successful:', paymentReceipt);
    Alert.alert('Success', 'Your payment was processed successfully!');
    
    if (onSuccess) {
      onSuccess(paymentReceipt);
    } else {
      // Default navigation behavior if no success handler provided
      navigation.goBack();
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    console.error('Payment error:', errorMessage);
    setPaymentStatus('error');
    
    if (onFailure) {
      onFailure(errorMessage);
    } else {
      Alert.alert('Payment Failed', errorMessage || 'An error occurred while processing your payment');
    }
  };

  const handleRetry = () => {
    reset();
    setPaymentStatus('idle');
  };

  const renderPaymentForm = () => {
    if (paymentStatus === 'success') {
      return (
        <View style={styles.successContainer}>
          <MaterialIcons name="check-circle" size={64} color="#4CAF50" />
          <Text style={styles.successText}>Payment Successful!</Text>
          <Text style={styles.amountText}>{formatCurrency(amount)}</Text>
          <Text style={styles.receiptText}>Transaction ID: {receipt?.transactionId || 'N/A'}</Text>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (paymentStatus === 'error') {
      return (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color="#F44336" />
          <Text style={styles.errorText}>Payment Failed</Text>
          <Text style={styles.errorDescription}>
            {error || 'An error occurred while processing your payment'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.retryButtonText}>Try Again</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.paymentForm}>
        <Text style={styles.amount}>{formatCurrency(amount)}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
        
        <View style={styles.providerSelector}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          
          <TouchableOpacity
            style={[
              styles.providerOption,
              selectedProvider === 'chapa' && styles.selectedProvider,
            ]}
            onPress={() => setSelectedProvider('chapa')}
            disabled={isProcessing}
          >
            <Text style={styles.providerText}>Chapa</Text>
            {selectedProvider === 'chapa' && (
              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.providerOption,
              selectedProvider === 'flutterwave' && styles.selectedProvider,
            ]}
            onPress={() => setSelectedProvider('flutterwave')}
            disabled={isProcessing}
          >
            <Text style={styles.providerText}>Flutterwave</Text>
            {selectedProvider === 'flutterwave' && (
              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
            )}
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.payButtonText}>
              Pay {formatCurrency(amount)} with {selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)}
            </Text>
          )}
        </TouchableOpacity>
        
        <Text style={styles.securityNote}>
          <MaterialIcons name="security" size={16} color="#4CAF50" />
          {' '}Your payment is secure and encrypted
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {renderPaymentForm()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
  },
  paymentForm: {
    flex: 1,
    justifyContent: 'center',
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666666',
    marginBottom: 32,
  },
  providerSelector: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  providerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedProvider: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  providerText: {
    fontSize: 16,
    color: '#333333',
  },
  payButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  payButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  securityNote: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
    marginTop: 16,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 16,
    marginBottom: 8,
  },
  amountText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  receiptText: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 32,
  },
  doneButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F44336',
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 160,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProcessPaymentScreen;
