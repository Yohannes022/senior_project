import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { PaymentReceipt } from '@/types/payment';
import { format } from 'date-fns';

interface ReceiptProps {
  receipt: PaymentReceipt;
  onPrint?: () => void;
  onShare?: () => void;
}

export const Receipt: React.FC<ReceiptProps> = ({ receipt, onPrint, onShare }) => {
  const formattedDate = format(
    typeof receipt.timestamp === 'number' || typeof receipt.timestamp === 'string' 
      ? new Date(receipt.timestamp) 
      : receipt.timestamp, 
    'PPpp'
  );
  
  const handleViewReceipt = () => {
    if (receipt.receiptUrl) {
      Linking.openURL(receipt.receiptUrl);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Receipt</Text>
        <Text style={styles.status}>
          Status: <Text style={styles.statusText}>{receipt.status}</Text>
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Transaction ID:</Text>
          <Text style={styles.detailValue} selectable>{receipt.transactionId}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Reference:</Text>
          <Text style={styles.detailValue} selectable>{receipt.txRef}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date & Time:</Text>
          <Text style={styles.detailValue}>{formattedDate}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Summary</Text>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Amount Paid:</Text>
          <Text style={styles.amountValue}>
            {receipt.currency} {receipt.amount.toFixed(2)}
          </Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Fee:</Text>
          <Text style={styles.amountValue}>
            {receipt.currency} {receipt.fee.toFixed(2)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={[styles.amountRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>
            {receipt.currency} {(receipt.amount + receipt.fee).toFixed(2)}
          </Text>
        </View>
      </View>

      {receipt.customer && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Details</Text>
          <Text style={styles.detailText}>
            {receipt.customer.email}
          </Text>
          {receipt.customer.phoneNumber && (
            <Text style={styles.detailText}>
              {receipt.customer.phoneNumber}
            </Text>
          )}
        </View>
      )}

      <View style={styles.actions}>
        {receipt.receiptUrl && (
          <TouchableOpacity
            style={[styles.button, styles.viewButton]}
            onPress={handleViewReceipt}
          >
            <Text style={styles.buttonText}>View Receipt</Text>
          </TouchableOpacity>
        )}
        {onPrint && (
          <TouchableOpacity
            style={[styles.button, styles.printButton]}
            onPress={onPrint}
          >
            <Text style={styles.buttonText}>Print</Text>
          </TouchableOpacity>
        )}
        {onShare && (
          <TouchableOpacity
            style={[styles.button, styles.shareButton]}
            onPress={onShare}
          >
            <Text style={styles.buttonText}>Share</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    maxWidth: 500,
    width: '100%',
    marginTop: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  status: {
    fontSize: 14,
    color: '#666666',
  },
  statusText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444444',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  detailText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666666',
  },
  amountValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
  },
  totalRow: {
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2196F3',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
    flexWrap: 'wrap',
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButton: {
    backgroundColor: '#2196F3',
  },
  printButton: {
    backgroundColor: '#4CAF50',
  },
  shareButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
