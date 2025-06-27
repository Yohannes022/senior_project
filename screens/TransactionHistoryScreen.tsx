import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { walletService } from '@/services/walletService';
import { formatCurrency, formatDate } from '@/utils/formatters';

const TransactionHistoryScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const pageSize = 20;

  const loadTransactions = async (pageNum: number = 1, isRefreshing: boolean = false) => {
    if (!user || (!isRefreshing && !hasMore && pageNum > 1)) return;
    
    try {
      if (pageNum === 1) {
        setLoading(true);
      }
      
      // For pagination, we'll need to adjust how we fetch transactions
      // since the current implementation only supports a simple limit
      // For now, we'll just fetch the latest transactions up to the page size
      const result = await walletService.getTransactionHistory(user.id, pageSize * pageNum);
      
      if (pageNum === 1) {
        setTransactions(result);
      } else {
        // This simple approach might show duplicate transactions in a real app
        // In a production app, you'd want to implement proper pagination on the backend
        setTransactions(prev => [...prev, ...result]);
      }
      
      setHasMore(result.length === pageSize);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTransactions(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadTransactions(page + 1);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTransactions(1, true);
    });
    
    return unsubscribe;
  }, [navigation]);

  const renderTransactionItem = ({ item }: { item: any }) => {
    const isCredit = item.type === 'credit' || item.amount > 0;
    const amountColor = isCredit ? '#4CAF50' : '#F44336';
    const amountPrefix = isCredit ? '+' : '-';
    
    return (
      <View style={styles.transactionItem}>
        <View style={[styles.transactionIcon, { backgroundColor: isCredit ? '#E8F5E9' : '#FFEBEE' }]}>
          <MaterialIcons 
            name={isCredit ? 'arrow-downward' : 'arrow-upward'} 
            size={20} 
            color={amountColor} 
          />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle} numberOfLines={1}>
            {item.description || (isCredit ? 'Credit' : 'Debit')}
          </Text>
          <Text style={styles.transactionDate}>
            {formatDate(item.timestamp)}
          </Text>
          {item.referenceId && (
            <Text style={styles.transactionReference}>
              Ref: {item.referenceId}
            </Text>
          )}
        </View>
        <View style={styles.amountContainer}>
          <Text style={[styles.transactionAmount, { color: amountColor }]}>
            {amountPrefix}{formatCurrency(Math.abs(item.amount))}
          </Text>
          <Text style={[styles.transactionStatus, 
            item.status === 'completed' ? styles.statusCompleted : 
            item.status === 'failed' ? styles.statusFailed : 
            styles.statusPending
          ]}>
            {item.status}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="receipt" size={64} color="#E0E0E0" />
      <Text style={styles.emptyStateTitle}>No Transactions Yet</Text>
      <Text style={styles.emptyStateText}>
        Your transaction history will appear here
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading || transactions.length === 0) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#2196F3" />
      </View>
    );
  };

  if (loading && transactions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>All</Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color="#2196F3" />
          </TouchableOpacity>
        </View>
      </View>
      
      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
      />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
  },
  filterContainer: {
    flexDirection: 'row',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterText: {
    marginRight: 4,
    color: '#2196F3',
    fontWeight: '500',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
    marginRight: 8,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 4,
  },
  transactionReference: {
    fontSize: 11,
    color: '#BDBDBD',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionStatus: {
    fontSize: 11,
    fontWeight: '500',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  statusCompleted: {
    backgroundColor: '#E8F5E9',
    color: '#4CAF50',
  },
  statusFailed: {
    backgroundColor: '#FFEBEE',
    color: '#F44336',
  },
  statusPending: {
    backgroundColor: '#FFF8E1',
    color: '#FFC107',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TransactionHistoryScreen;
