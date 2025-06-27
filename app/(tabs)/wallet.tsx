import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';
import { walletService } from '@/services/walletService';
import { formatCurrency } from '@/utils/formatters';

type WalletScreenParams = {
  refresh?: string; // Optional refresh param to trigger data refresh
};

const WalletScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { refresh } = useLocalSearchParams<WalletScreenParams>();
  
  const [balance, setBalance] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const fetchWalletData = async () => {
    if (!user) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    
    try {
      setError(null);
      const [walletData, transactions] = await Promise.all([
        walletService.getWalletBalance(user.id),
        walletService.getTransactionHistory(user.id, 5)
      ]);
      
      setBalance(walletData.availableBalance);
      setPoints(walletData.points || 0);
      setRecentTransactions(transactions);
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError('Failed to load wallet data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [refresh]); // Refetch when refresh param changes

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWalletData();
  };

  const handleTopUp = (amount: number) => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to add funds');
      return;
    }
    
    // Navigate to payment screen with query params
    const params = new URLSearchParams({
      amount: amount.toString(),
      rideId: `topup-${Date.now()}`,
      type: 'wallet-topup'
    });
    
    // Use router.push with string path for now
    router.push(`/payment?${params.toString()}` as any);
  };

  const handleViewAllTransactions = () => {
    router.push('/transaction-history');
  };

  const navigateToSendMoney = () => {
    router.push('/send-money');
  };
  
  const navigateToPaymentMethods = () => {
    router.push('/payment-methods');
  };

  const navigateToTransactionHistory = () => {
    router.push('/transaction-history');
  };

  const handleAddPaymentMethod = () => {
    router.push('/add-payment-method');
  };

  const handleSendMoney = () => {
    router.push('/send-money');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
        
        <View style={styles.pointsContainer}>
          <MaterialIcons name="star" size={20} color="#FFC107" />
          <Text style={styles.pointsText}>{points} points</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleTopUp(100)}
          >
            <View style={styles.actionIcon}>
              <MaterialIcons name="add" size={24} color="#2196F3" />
            </View>
            <Text style={styles.actionText}>Top Up</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={navigateToSendMoney}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
              <MaterialIcons name="send" size={24} color="#2196F3" />
            </View>
            <Text style={styles.actionText}>Send Money</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={navigateToPaymentMethods}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
              <MaterialIcons name="payment" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.actionText}>Payment</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={navigateToTransactionHistory}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {recentTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="receipt" size={48} color="#E0E0E0" />
            <Text style={styles.emptyStateText}>No recent transactions</Text>
          </View>
        ) : (
          recentTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))
        )}
      </View>
      
      {/* Quick Top Up */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Top Up</Text>
        <View style={styles.topUpOptions}>
          {[50, 100, 200, 500].map((amount) => (
            <TouchableOpacity
              key={amount}
              style={styles.topUpButton}
              onPress={() => handleTopUp(amount)}
            >
              <Text style={styles.topUpAmount}>{formatCurrency(amount)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const TransactionItem = ({ transaction }: { transaction: any }) => {
  const isCredit = transaction.type === 'credit' || transaction.amount > 0;
  const amountColor = isCredit ? '#4CAF50' : '#F44336';
  const amountPrefix = isCredit ? '+' : '-';
  
  return (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <MaterialIcons 
          name={isCredit ? 'arrow-downward' : 'arrow-upward'} 
          size={20} 
          color={isCredit ? '#4CAF50' : '#F44336'} 
        />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle} numberOfLines={1}>
          {transaction.description || 'Transaction'}
        </Text>
        <Text style={styles.transactionDate}>
          {new Date(transaction.timestamp).toLocaleDateString()}
        </Text>
      </View>
      <Text style={[styles.transactionAmount, { color: amountColor }]}>
        {amountPrefix}{formatCurrency(Math.abs(transaction.amount))}
      </Text>
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
    color: 'rgba(255, 255, 255, 0.9)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  pointsText: {
    color: 'white',
    marginLeft: 4,
    fontWeight: '500',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  seeAllText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    alignItems: 'center',
    width: '30%',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#424242',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    color: '#9E9E9E',
    marginTop: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
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
    marginRight: 8,
  },
  transactionTitle: {
    fontSize: 14,
    color: '#212121',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  topUpOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  topUpButton: {
    width: '48%',
    margin: '1%',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  topUpAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
});

export default WalletScreen;
