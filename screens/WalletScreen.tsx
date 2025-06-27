import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { walletService } from '@/services/walletService';
import { WalletBalance, WalletTransaction } from '@/types/wallet';
import { formatCurrency } from '@/utils/formatters';

const WalletScreen = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWalletData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [walletBalance, walletTransactions] = await Promise.all([
        walletService.getWalletBalance(user.id),
        walletService.getTransactionHistory(user.id, 10)
      ]);
      
      setBalance(walletBalance);
      setTransactions(walletTransactions);
    } catch (err) {
      console.error('Error loading wallet data:', err);
      setError('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, [user]);

  const handleTopUp = async (amount: number) => {
    if (!user) return;
    
    try {
      setLoading(true);
      // In a real app, you would open a payment modal/flow here
      const updatedBalance = await walletService.topUpWallet(user.id, {
        amount,
        paymentMethod: 'telebirr', // Default payment method
        phoneNumber: user.phoneNumber
      });
      
      setBalance(updatedBalance);
      await loadWalletData(); // Refresh transactions
    } catch (err) {
      console.error('Error topping up:', err);
      setError('Failed to process top-up');
    } finally {
      setLoading(false);
    }
  };

  const renderTransactionIcon = (type: string) => {
    switch (type) {
      case 'topup':
        return <MaterialIcons name="add-circle" size={24} color="#4CAF50" />;
      case 'ride_payment':
        return <MaterialIcons name="directions-bus" size={24} color="#2196F3" />;
      case 'points_earned':
        return <MaterialIcons name="star" size={24} color="#FFC107" />;
      default:
        return <MaterialIcons name="receipt" size={24} color="#9E9E9E" />;
    }
  };

  const renderTransactionAmount = (transaction: WalletTransaction) => {
    const isNegative = transaction.amount < 0;
    const amount = Math.abs(transaction.amount);
    
    return (
      <Text style={[styles.amount, isNegative ? styles.negativeAmount : styles.positiveAmount]}>
        {isNegative ? '-' : '+'} {formatCurrency(amount)}
      </Text>
    );
  };

  if (loading && !balance) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={loadWalletData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(balance?.availableBalance || 0)}</Text>
        
        <View style={styles.pointsContainer}>
          <MaterialIcons name="star" size={20} color="#FFC107" />
          <Text style={styles.pointsText}>{balance?.points || 0} points</Text>
        </View>
        
        <View style={styles.topUpContainer}>
          <Text style={styles.topUpLabel}>Quick Top-Up</Text>
          <View style={styles.topUpButtons}>
            {[50, 100, 200].map((amount) => (
              <TouchableOpacity 
                key={amount}
                style={styles.topUpButton}
                onPress={() => handleTopUp(amount)}
                disabled={loading}
              >
                <Text style={styles.topUpButtonText}>+{amount} ETB</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        
        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="receipt" size={48} color="#E0E0E0" />
            <Text style={styles.emptyStateText}>No transactions yet</Text>
          </View>
        ) : (
          transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionIcon}>
                {renderTransactionIcon(transaction.type)}
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>
                  {transaction.description}
                </Text>
                <Text style={styles.transactionDate}>
                  {new Date(transaction.timestamp).toLocaleDateString()}
                </Text>
              </View>
              {renderTransactionAmount(transaction)}
            </View>
          ))
        )}
        
        {transactions.length > 0 && (
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllButtonText}>View All Transactions</Text>
            <MaterialIcons name="chevron-right" size={20} color="#2196F3" />
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#F44336',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    padding: 12,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  balanceCard: {
    backgroundColor: '#2196F3',
    padding: 24,
    margin: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginBottom: 8,
  },
  balanceAmount: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  pointsText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
  },
  topUpContainer: {
    marginTop: 16,
  },
  topUpLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  topUpButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topUpButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  topUpButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    color: '#9E9E9E',
    marginTop: 16,
    textAlign: 'center',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  amount: {
    fontWeight: '600',
    fontSize: 16,
  },
  positiveAmount: {
    color: '#4CAF50',
  },
  negativeAmount: {
    color: '#F44336',
  },
  viewAllButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    marginTop: 8,
  },
  viewAllButtonText: {
    color: '#2196F3',
    fontWeight: '600',
    marginRight: 4,
  },
});

export default WalletScreen;
