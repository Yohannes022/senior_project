import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';

// Mock data for payment methods
const mockPaymentMethods = [
  {
    id: '1',
    type: 'card',
    last4: '4242',
    brand: 'visa',
    expiry: '12/25',
    isDefault: true,
  },
  {
    id: '2',
    type: 'telebirr',
    phone: '+251911223344',
    isDefault: false,
  },
  {
    id: '3',
    type: 'chapa',
    email: 'user@example.com',
    isDefault: false,
  },
];

const PaymentMethodsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch payment methods from your API
    const fetchPaymentMethods = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setPaymentMethods(mockPaymentMethods);
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        Alert.alert('Error', 'Failed to load payment methods');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  const handleSetDefault = async (methodId: string) => {
    try {
      // In a real app, you would update the default payment method via API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPaymentMethods(prev => 
        prev.map(method => ({
          ...method,
          isDefault: method.id === methodId,
        }))
      );
    } catch (error) {
      console.error('Error setting default payment method:', error);
      Alert.alert('Error', 'Failed to set default payment method');
    }
  };

  const handleRemoveMethod = (methodId: string) => {
    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // In a real app, you would remove the payment method via API
              await new Promise(resolve => setTimeout(resolve, 500));
              
              setPaymentMethods(prev => 
                prev.filter(method => method.id !== methodId)
              );
              
              Alert.alert('Success', 'Payment method removed');
            } catch (error) {
              console.error('Error removing payment method:', error);
              Alert.alert('Error', 'Failed to remove payment method');
            }
          },
        },
      ]
    );
  };

  const renderPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <MaterialIcons name="credit-card" size={24} color="#757575" />;
      case 'telebirr':
        return <MaterialIcons name="smartphone" size={24} color="#4CAF50" />;
      case 'chapa':
        return <MaterialIcons name="payment" size={24} color="#2196F3" />;
      case 'bank':
        return <MaterialIcons name="account-balance" size={24} color="#9C27B0" />;
      default:
        return <MaterialIcons name="payment" size={24} color="#757575" />;
    }
  };

  const renderPaymentMethodDetails = (method: any) => {
    switch (method.type) {
      case 'card':
        return (
          <View style={styles.methodDetails}>
            <Text style={styles.methodTitle}>
              {method.brand ? `${method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} ` : ''}
              •••• {method.last4 || '****'}
            </Text>
            <Text style={styles.methodSubtitle}>Expires {method.expiry || '••/••'}</Text>
          </View>
        );
      case 'telebirr':
        return (
          <View style={styles.methodDetails}>
            <Text style={styles.methodTitle}>Telebirr</Text>
            <Text style={styles.methodSubtitle}>{method.phone || '•••• •••• ••••'}</Text>
          </View>
        );
      case 'chapa':
        return (
          <View style={styles.methodDetails}>
            <Text style={styles.methodTitle}>Chapa</Text>
            <Text style={styles.methodSubtitle}>{method.email || '••••@•••••.com'}</Text>
          </View>
        );
      case 'bank':
        return (
          <View style={styles.methodDetails}>
            <Text style={styles.methodTitle}>Bank Account</Text>
            <Text style={styles.methodSubtitle}>{method.accountNumber ? `•••• ${method.accountNumber.slice(-4)}` : '•••• •••• ••••'}</Text>
          </View>
        );
      default:
        return (
          <View style={styles.methodDetails}>
            <Text style={styles.methodTitle}>Payment Method</Text>
            <Text style={styles.methodSubtitle}>•••• •••• ••••</Text>
          </View>
        );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Payment Methods</Text>
          <Text style={styles.subtitle}>
            {paymentMethods.length > 0 
              ? 'Manage your saved payment methods' 
              : 'No payment methods saved'}
          </Text>
        </View>

        {paymentMethods.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="payment" size={64} color="#E0E0E0" />
            <Text style={styles.emptyStateTitle}>No Payment Methods</Text>
            <Text style={styles.emptyStateText}>
              You haven't added any payment methods yet
            </Text>
          </View>
        ) : (
          <View style={styles.methodsList}>
            {paymentMethods.map((method) => (
              <View key={method.id} style={styles.methodCard}>
                <View style={styles.methodHeader}>
                  <View style={styles.methodIcon}>
                    {renderPaymentMethodIcon(method.type)}
                  </View>
                  {renderPaymentMethodDetails(method)}
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.methodActions}>
                  {!method.isDefault && (
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleSetDefault(method.id)}
                    >
                      <MaterialIcons name="star-outline" size={20} color="#2196F3" />
                      <Text style={styles.actionText}>Set as default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleRemoveMethod(method.id)}
                  >
                    <MaterialIcons name="delete-outline" size={20} color="#F44336" />
                    <Text style={[styles.actionText, { color: '#F44336' }]}>
                      Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('add-payment-method')}
        >
          <MaterialIcons name="add" size={24} color="#2196F3" />
          <Text style={styles.addButtonText}>Add Payment Method</Text>
        </TouchableOpacity>
        
        <View style={styles.infoBox}>
          <MaterialIcons name="info-outline" size={20} color="#2196F3" />
          <Text style={styles.infoText}>
            Your payment information is encrypted and processed securely.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#757575',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#BDBDBD',
    textAlign: 'center',
  },
  methodsList: {
    marginBottom: 16,
  },
  methodCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodIcon: {
    marginRight: 12,
  },
  methodDetails: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 2,
  },
  methodSubtitle: {
    fontSize: 14,
    color: '#757575',
  },
  defaultBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultBadgeText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: '500',
  },
  methodActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 12,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  actionText: {
    marginLeft: 4,
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: '#0D47A1',
    lineHeight: 16,
  },
});

export default PaymentMethodsScreen;
