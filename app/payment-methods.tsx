import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  Plus, 
  CreditCard, 
  Trash2, 
  ChevronRight, 
  Smartphone,
  SmartphoneCharging,
  SmartphoneNfc,
  WalletCards,
  Wallet
} from 'lucide-react-native';
import Colors from '@/constants/colors';

type PaymentMethod = {
  id: string;
  type: 'telebirr' | 'cbe_birr' | 'amole' | 'hello_cash' | 'visa' | 'mastercard';
  last4: string;
  phoneNumber?: string;
  isDefault: boolean;
  balance?: number;
};

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const [walletBalance, setWalletBalance] = useState<number>(1250.50);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'telebirr',
      last4: '0912',
      phoneNumber: '0912 34 5678',
      isDefault: true,
      balance: 1250.50
    },
    {
      id: '2',
      type: 'cbe_birr',
      last4: '0977',
      phoneNumber: '0977 12 3456',
      isDefault: false,
      balance: 3500.00
    },
    {
      id: '3',
      type: 'mastercard',
      last4: '5678',
      isDefault: false,
    },
  ]);

  const handleAddPayment = () => {
    // Navigate to add payment method screen
    router.push('/add-payment-method');
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id,
    })));
  };

  const handleDelete = (id: string) => {
    setPaymentMethods(paymentMethods.filter(method => method.id !== id));
  };

  const renderPaymentIcon = (type: string, size = 24, color = Colors.primary) => {
    const iconProps = { size, color };
    
    switch (type) {
      case 'telebirr':
        return <SmartphoneCharging {...iconProps} />;
      case 'cbe_birr':
        return <Wallet {...iconProps} />;
      case 'amole':
        return <SmartphoneNfc {...iconProps} />;
      case 'hello_cash':
        return <WalletCards {...iconProps} />;
      default:
        return <CreditCard {...iconProps} />;
    }
  };

  const getPaymentName = (type: string) => {
    switch (type) {
      case 'telebirr': return 'Telebirr';
      case 'cbe_birr': return 'CBE Birr';
      case 'amole': return 'Amole';
      case 'hello_cash': return 'HelloCash';
      default: return 'Payment Method';
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Payment Methods',
          headerShown: true,
          headerTitleStyle: {
            color: Colors.text,
            fontFamily: 'outfit-semibold',
          },
          headerStyle: {
            backgroundColor: Colors.background,
          },
        }}
      />

      <ScrollView style={styles.scrollView}>
        {/* Wallet Balance Card */}
        <View style={[styles.card, styles.walletCard]}>
          <View style={styles.walletHeader}>
            <View style={styles.walletIcon}>
              <CreditCard size={24} color={Colors.primary} />
            </View>
            <Text style={styles.walletTitle}>Wallet Balance</Text>
          </View>
          <Text style={styles.walletAmount}>ETB {walletBalance.toFixed(2)}</Text>
          <View style={styles.walletActions}>
            <TouchableOpacity style={[styles.walletButton, {marginRight: 8}]}>
              <Text style={styles.walletButtonText}>Add Money</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.walletButton}>
              <Text style={styles.walletButtonText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          
          {paymentMethods.map((method) => (
            <View key={method.id} style={styles.paymentMethod}>
              <View style={styles.methodLeft}>
                <View style={styles.iconContainer}>
                  {renderPaymentIcon(method.type, 24, Colors.primary)}
                </View>
                <View>
                  <Text style={styles.cardType}>
                    {getPaymentName(method.type)} •••• {method.last4}
                  </Text>
                  {method.phoneNumber && (
                    <Text style={styles.cardExpiry}>{method.phoneNumber}</Text>
                  )}
                  {method.balance !== undefined && (
                    <Text style={styles.balanceText}>ETB {method.balance.toFixed(2)}</Text>
                  )}
                </View>
              </View>
              
              <View style={styles.methodRight}>
                {method.isDefault ? (
                  <Text style={styles.defaultBadge}>Default</Text>
                ) : (
                  <TouchableOpacity 
                    onPress={() => handleSetDefault(method.id)}
                    style={styles.setDefaultButton}
                  >
                    <Text style={styles.setDefaultText}>Set as default</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  onPress={() => handleDelete(method.id)}
                  style={styles.deleteButton}
                >
                  <Trash2 size={18} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddPayment}
          >
            <View style={styles.addButtonIcon}>
              <Plus size={20} color={Colors.primary} />
            </View>
            <Text style={styles.addButtonText}>Add payment method</Text>
            <ChevronRight size={20} color={Colors.textLight} style={styles.chevron} />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.card, styles.helpCard]}>
          <Text style={styles.helpTitle}>Need help with payments?</Text>
          <Text style={styles.helpText}>
            Contact our support team for assistance with payment methods or transaction issues.
          </Text>
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>Contact Support</Text>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'outfit-medium',
    color: Colors.text,
    marginBottom: 16,
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardType: {
    fontSize: 14,
    fontFamily: 'outfit-medium',
    color: Colors.text,
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: 12,
    color: Colors.textLight,
    fontFamily: 'outfit-regular',
    marginTop: 2,
  },
  balanceText: {
    fontSize: 14,
    color: Colors.success,
    fontFamily: 'outfit-medium',
    marginTop: 2,
  },
  methodRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  defaultBadge: {
    fontSize: 12,
    color: Colors.success,
    fontFamily: 'outfit-medium',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 12,
  },
  setDefaultButton: {
    marginRight: 12,
  },
  setDefaultText: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: 'outfit-medium',
  },
  deleteButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  addButtonIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addButtonText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'outfit-medium',
    color: Colors.primary,
  },
  chevron: {
    marginLeft: 8,
  },
  // Wallet Card
  walletCard: {
    backgroundColor: Colors.primaryLight,
    padding: 20,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  walletTitle: {
    fontSize: 16,
    color: Colors.background,
    fontFamily: 'outfit-medium',
  },
  walletAmount: {
    fontSize: 28,
    fontFamily: 'outfit-bold',
    color: Colors.background,
    marginBottom: 16,
  },
  walletActions: {
    flexDirection: 'row',
  },
  walletButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  walletButtonText: {
    color: Colors.background,
    fontFamily: 'outfit-medium',
    fontSize: 14,
  },
  // Help Card
  helpCard: {
    backgroundColor: '#F8FAFC',
  },
  helpTitle: {
    fontSize: 16,
    fontFamily: 'outfit-medium',
    color: Colors.text,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    color: Colors.textLight,
    fontFamily: 'outfit-regular',
    marginBottom: 16,
    lineHeight: 20,
  },
  helpButton: {
    alignSelf: 'flex-start',
  },
  helpButtonText: {
    color: Colors.primary,
    fontFamily: 'outfit-medium',
    fontSize: 14,
  },
});
