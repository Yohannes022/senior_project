import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { walletService } from '@/services/walletService';
import Colors from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { TransactionType } from '@/types/wallet';

type TransactionItem = 
  | {
      type: 'wallet';
      id: string;
      userId: string;
      amount: number;
      transactionType: TransactionType;
      description: string;
      timestamp: Date;
      referenceId?: string;
      status: 'pending' | 'completed' | 'failed' | 'refunded';
      onPress?: () => void;
    }
  | {
      type: 'trip';
      id: string;
      userId: string;
      amount: number;
      description: string;
      timestamp: Date;
      onPress?: () => void;
    };

export default function TransactionHistoryScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);

  const loadTransactions = async () => {
    if (!user) return;
    
    try {
      setRefreshing(true);
      // In a real app, you would fetch trips from your backend
      // const trips = await tripService.getUserTrips(user.id);
      const walletTransactions = await walletService.getTransactionHistory(user.id);
      
      // Combine and sort transactions by date
      const allTransactions: TransactionItem[] = [
        // Map trips to transaction items
        // ...(trips?.map(trip => ({
        //   type: 'trip' as const,
        //   id: trip.id,
        //   userId: trip.userId,
        //   amount: trip.amount,
        //   description: `Trip to ${trip.destination}`,
        //   timestamp: trip.date,
        //   onPress: () => router.push(`/trip-details/${trip.id}`)
        // })) || []),
        // Map wallet transactions
        ...walletTransactions.map(tx => ({
          type: 'wallet' as const,
          id: tx.id,
          userId: tx.userId,
          amount: tx.amount,
          transactionType: tx.type,
          description: tx.description,
          timestamp: tx.timestamp,
          referenceId: tx.referenceId,
          status: tx.status,
          onPress: undefined
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      Alert.alert('Error', 'Failed to load transaction history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [user]);

  const renderTransaction = ({ item }: { item: TransactionItem }) => {
    const isTrip = item.type === 'trip';
    const isWallet = item.type === 'wallet';
    
    return (
      <TouchableOpacity 
        style={styles.transactionItem}
        onPress={item.onPress}
        disabled={!item.onPress}
      >
        <View style={styles.transactionIcon}>
          <Ionicons 
            name={isTrip ? 'car' : 'wallet'} 
            size={24} 
            color={Colors.primary} 
          />
        </View>
        
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>
            {isTrip ? 'Trip Booking' : item.description}
          </Text>
          {isWallet && (
            <View style={styles.transactionMeta}>
              <Text style={styles.transactionType}>
                {item.transactionType}
              </Text>
              <Text style={styles.transactionStatus}>
                {item.status}
              </Text>
            </View>
          )}
          <Text style={styles.transactionDate}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
        </View>
        
        <Text 
          style={[
            styles.transactionAmount, 
            item.amount < 0 ? styles.amountNegative : styles.amountPositive
          ]}
        >
          {item.amount > 0 ? '+' : ''}{item.amount.toFixed(2)} ETB
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Transaction History',
          headerBackTitle: 'Back',
        }} 
      />
      
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={loadTransactions}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    marginBottom: 4,
    gap: 8,
  },
  transactionType: {
    fontSize: 12,
    color: Colors.primary,
    backgroundColor: `${Colors.primary}20`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  transactionStatus: {
    fontSize: 12,
    color: Colors.textLight,
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.textLight,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  amountPositive: {
    color: Colors.success,
  },
  amountNegative: {
    color: Colors.error,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
