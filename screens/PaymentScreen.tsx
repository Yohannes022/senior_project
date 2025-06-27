import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { walletService } from '@/services/walletService';
import { formatCurrency } from '@/utils/formatters';

interface PaymentScreenProps {
  route: {
    params: {
      amount: number;
      rideId: string;
      onPaymentSuccess: (paymentResult: any) => void;
    };
  };
  navigation: any;
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({ route, navigation }) => {
  const { amount, rideId, onPaymentSuccess } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'telebirr' | 'chapa'>('wallet');

  useEffect(() => {
    const loadBalance = async () => {
      if (!user) return;
      
      try {
        const walletBalance = await walletService.getWalletBalance(user.id);
        setBalance(walletBalance.availableBalance);
      } catch (error) {
        console.error('Error loading wallet balance:', error);
        Alert.alert('Error', 'Failed to load wallet balance');
      }
    };

    loadBalance();
  }, [user]);

  const handlePayment = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      if (paymentMethod === 'wallet') {
        // Pay with wallet
        if (balance !== null && balance < amount) {
          Alert.alert(
            'Insufficient Balance',
            'You don\'t have enough balance in your wallet. Please top up or choose another payment method.',
            [
              {
                text: 'Top Up',
                onPress: () => navigation.navigate('Wallet')
              },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
          return;
        }
        
        // Process wallet payment
        const result = await walletService.makePayment(user.id, {
          amount,
          rideId,
          userId: user.id,
          description: `Ride payment - ${rideId}`
        });
        
        if (result.success) {
          onPaymentSuccess({
            success: true,
            paymentMethod: 'wallet',
            transactionId: result.transactionId,
            amount
          });
          navigation.goBack();
        } else {
          Alert.alert('Payment Failed', result.message || 'Failed to process payment');
        }
      } else {
        // For other payment methods, generate a QR code
        const qrData = await walletService.generatePaymentQR(user.id, rideId, amount);
        setQrCode(qrData);
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentMethod = (method: 'wallet' | 'telebirr' | 'chapa', icon: string, label: string) => {
    const isSelected = paymentMethod === method;
    
    return (
      <TouchableOpacity
        style={[styles.paymentMethod, isSelected && styles.selectedPaymentMethod]}
        onPress={() => setPaymentMethod(method)}
        disabled={loading}
      >
        <View style={styles.paymentMethodContent}>
          <MaterialIcons 
            name={icon as any} 
            size={24} 
            color={isSelected ? '#2196F3' : '#757575'} 
          />
          <Text style={[styles.paymentMethodText, isSelected && styles.selectedPaymentMethodText]}>
            {label}
          </Text>
        </View>
        {isSelected && (
          <MaterialIcons name="check-circle" size={24} color="#2196F3" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Amount to Pay</Text>
        <Text style={styles.amount}>{formatCurrency(amount)}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Payment Method</Text>
        
        {renderPaymentMethod('wallet', 'account-balance-wallet', 'Sheger Wallet')}
        {renderPaymentMethod('telebirr', 'smartphone', 'Telebirr')}
        {renderPaymentMethod('chapa', 'payment', 'Chapa')}
        
        {paymentMethod === 'wallet' && balance !== null && (
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Available Balance:</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
            {balance < amount && (
              <Text style={styles.insufficientBalance}>
                Insufficient balance for this transaction
              </Text>
            )}
          </View>
        )}
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.payButton,
            (loading || (paymentMethod === 'wallet' && balance !== null && balance < amount)) && 
            styles.payButtonDisabled
          ]}
          onPress={handlePayment}
          disabled={loading || (paymentMethod === 'wallet' && balance !== null && balance < amount)}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.payButtonText}>
              {paymentMethod === 'wallet' ? 'Pay with Wallet' : 'Generate Payment QR'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      
      {qrCode ? (
        <View style={styles.qrContainer}>
          <Text style={styles.qrTitle}>Show this to the driver</Text>
          {/* In a real app, you would render the QR code here */}
          <View style={styles.qrPlaceholder}>
            <MaterialIcons name="qr-code" size={150} color="#2196F3" />
            <Text style={styles.qrText}>Payment QR Code</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  amountContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  amountLabel: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#424242',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedPaymentMethod: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#424242',
  },
  selectedPaymentMethodText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  balanceContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 8,
  },
  insufficientBalance: {
    color: '#F44336',
    fontSize: 14,
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 'auto',
    padding: 16,
  },
  payButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#BBDEFB',
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  qrContainer: {
    marginTop: 24,
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#424242',
  },
  qrPlaceholder: {
    alignItems: 'center',
    padding: 24,
  },
  qrText: {
    marginTop: 12,
    color: '#757575',
  },
});

export default PaymentScreen;
