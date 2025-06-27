import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { walletService } from '@/services/walletService';

type PaymentMethodType = 'telebirr' | 'chapa' | 'card' | 'bank';

interface PaymentMethodOption {
  id: PaymentMethodType;
  name: string;
  icon: string;
  description: string;
}

const paymentMethods: PaymentMethodOption[] = [
  {
    id: 'telebirr',
    name: 'Telebirr',
    icon: 'smartphone',
    description: 'Pay with your Telebirr account',
  },
  {
    id: 'chapa',
    name: 'Chapa',
    icon: 'payment',
    description: 'Pay with Chapa',
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: 'credit-card',
    description: 'Pay with Visa, Mastercard, etc.',
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    icon: 'account-balance',
    description: 'Make a bank transfer',
  },
];

const AddPaymentMethodScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSelectMethod = (method: PaymentMethodType) => {
    setSelectedMethod(method);
  };

  const handleAddPaymentMethod = async () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setLoading(true);
    
    try {
      // In a real app, you would validate the payment method details
      // and save them to your backend
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll just show a success message
      Alert.alert(
        'Success', 
        `${paymentMethods.find(m => m.id === selectedMethod)?.name} has been added successfully`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding payment method:', error);
      Alert.alert('Error', 'Failed to add payment method. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    if (!selectedMethod) return null;
    
    switch (selectedMethod) {
      case 'telebirr':
      case 'chapa':
        return (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>
        );
        
      case 'card':
        return (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Card Number</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="number-pad"
                maxLength={19}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Cardholder Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={cardName}
                onChangeText={setCardName}
                autoCapitalize="words"
              />
            </View>
            
            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
              
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>
          </>
        );
        
      case 'bank':
        return (
          <View style={styles.bankInfo}>
            <Text style={styles.bankInfoText}>
              Please make a transfer to the following account:
            </Text>
            <View style={styles.bankDetail}>
              <Text style={styles.bankLabel}>Bank Name:</Text>
              <Text style={styles.bankValue}>Sheger Bank</Text>
            </View>
            <View style={styles.bankDetail}>
              <Text style={styles.bankLabel}>Account Name:</Text>
              <Text style={styles.bankValue}>Sheger Transit PLC</Text>
            </View>
            <View style={styles.bankDetail}>
              <Text style={styles.bankLabel}>Account Number:</Text>
              <Text style={styles.bankValue}>1000200030004000</Text>
            </View>
            <View style={styles.bankDetail}>
              <Text style={styles.bankLabel}>Reference:</Text>
              <Text style={[styles.bankValue, { fontFamily: 'monospace' }]}>
                {user?.id || 'YOUR-USER-ID'}
              </Text>
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>Select Payment Method</Text>
        
        <View style={styles.methodsContainer}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodButton,
                selectedMethod === method.id && styles.selectedMethod,
              ]}
              onPress={() => handleSelectMethod(method.id)}
            >
              <View style={styles.methodIconContainer}>
                <MaterialIcons 
                  name={method.icon as any} 
                  size={24} 
                  color={selectedMethod === method.id ? '#2196F3' : '#757575'} 
                />
              </View>
              <View style={styles.methodInfo}>
                <Text style={[
                  styles.methodName,
                  selectedMethod === method.id && styles.selectedMethodText,
                ]}>
                  {method.name}
                </Text>
                <Text style={styles.methodDescription}>
                  {method.description}
                </Text>
              </View>
              <MaterialIcons 
                name={selectedMethod === method.id ? 'radio-button-checked' : 'radio-button-unchecked'}
                size={24} 
                color={selectedMethod === method.id ? '#2196F3' : '#BDBDBD'} 
              />
            </TouchableOpacity>
          ))}
        </View>
        
        {selectedMethod && (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>
              {`Add ${paymentMethods.find(m => m.id === selectedMethod)?.name} Details`}
            </Text>
            {renderForm()}
          </View>
        )}
      </ScrollView>
      
      {selectedMethod && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.addButton, loading && styles.addButtonDisabled]}
            onPress={handleAddPaymentMethod}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.addButtonText}>
                {selectedMethod === 'bank' ? 'I\'ve Made the Transfer' : 'Add Payment Method'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginTop: 16,
    marginBottom: 12,
  },
  methodsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  selectedMethod: {
    backgroundColor: '#F5F9FF',
  },
  methodIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
    marginRight: 8,
  },
  methodName: {
    fontSize: 16,
    color: '#212121',
    marginBottom: 2,
    fontWeight: '500',
  },
  selectedMethodText: {
    color: '#2196F3',
  },
  methodDescription: {
    fontSize: 12,
    color: '#757575',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212121',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  row: {
    flexDirection: 'row',
  },
  bankInfo: {
    backgroundColor: '#F5F9FF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E3F2FD',
    marginVertical: 8,
  },
  bankInfoText: {
    fontSize: 14,
    color: '#2196F3',
    marginBottom: 12,
    lineHeight: 20,
  },
  bankDetail: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bankLabel: {
    width: 120,
    fontSize: 14,
    color: '#757575',
  },
  bankValue: {
    flex: 1,
    fontSize: 14,
    color: '#212121',
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  addButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#BBDEFB',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddPaymentMethodScreen;
