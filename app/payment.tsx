import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';
import { walletService } from '@/services/walletService';

const PaymentScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    amount: string;
    rideId?: string;
    type?: 'ride' | 'wallet-topup';
  }>();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  
  const amount = parseFloat(params.amount || '0');
  const isWalletTopup = params.type === 'wallet-topup';

  // Update payment methods to use the correct payment method types
  const paymentMethods = [
    { id: 'sheger_wallet', name: 'Sheger Wallet', icon: 'wallet', paymentMethod: 'chapa' as const },
    { id: 'telebirr', name: 'Telebirr', icon: 'phone-portrait', paymentMethod: 'telebirr' as const },
    { id: 'cbe_birr', name: 'CBE Birr', icon: 'card', paymentMethod: 'bank_transfer' as const },
    { id: 'visa', name: 'Visa/Mastercard', icon: 'card', paymentMethod: 'chapa' as const },
  ];

  useEffect(() => {
    // Auto-select the first payment method
    if (paymentMethods.length > 0) {
      setSelectedMethod(paymentMethods[0].id);
    }
    setLoading(false);
  }, []);

  const handlePayment = async () => {
    if (!selectedMethod || !user) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setProcessing(true);
    
    try {
      if (isWalletTopup) {
        // Get the selected payment method
        const method = paymentMethods.find(m => m.id === selectedMethod);
        if (!method) {
          Alert.alert('Error', 'Invalid payment method selected');
          setProcessing(false);
          return;
        }
        
        // Handle wallet top-up with the correct payment method type
        await walletService.topUpWallet(user.id, {
          amount,
          paymentMethod: method.paymentMethod,
          reference: `topup-${Date.now()}`,
        });
        
        Alert.alert('Success', `Successfully added ${amount} ETB to your wallet`, [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        // Handle ride payment
        // This would be implemented based on your ride booking flow
        console.log('Processing ride payment...');
      }
    } catch (error) {
      console.error('Payment error:', error);
      let errorMessage = 'Failed to process payment. Please try again.';
      
      // Provide more specific error messages based on the error type
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        
        if (error.message.includes('Invalid user ID')) {
          errorMessage = 'Invalid user account. Please sign in again.';
        } else if (error.message.includes('payment method')) {
          errorMessage = 'Invalid payment method selected.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection.';
        }
      }
      
      Alert.alert('Payment Error', errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: isWalletTopup ? 'Top Up Wallet' : 'Payment',
          headerBackTitle: 'Back',
        }}
      />
      
      <ScrollView style={styles.content}>
        {/* Payment Amount */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>
            {isWalletTopup ? 'Top-up Amount' : 'Amount to Pay'}
          </Text>
          <Text style={styles.amount}>{amount} ETB</Text>
        </View>
        
        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          <View style={styles.paymentMethods}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethod,
                  selectedMethod === method.id && styles.paymentMethodSelected,
                ]}
                onPress={() => setSelectedMethod(method.id)}
                disabled={processing}
              >
                <Ionicons 
                  name={method.icon as any} 
                  size={24} 
                  color={selectedMethod === method.id ? Colors.primary : '#666'} 
                />
                <Text style={[
                  styles.paymentMethodText,
                  selectedMethod === method.id && styles.paymentMethodTextSelected,
                ]}>
                  {method.name}
                </Text>
                {selectedMethod === method.id && (
                  <Ionicons 
                    name="checkmark-circle" 
                    size={20} 
                    color={Colors.primary} 
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Payment Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, processing && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>
              {isWalletTopup ? 'Top Up' : 'Pay'} {amount} ETB
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  amountContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  amountLabel: {
    fontSize: 16,
    color: Colors.secondary,
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.secondary,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  paymentMethods: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  paymentMethodSelected: {
    backgroundColor: '#f8f9ff',
  },
  paymentMethodText: {
    fontSize: 16,
    marginLeft: 12,
    color: Colors.secondary,
    flex: 1,
  },
  paymentMethodTextSelected: {
    color: Colors.primary,
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 'auto',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  payButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentScreen;
