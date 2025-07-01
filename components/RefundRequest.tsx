import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';

type RefundRequestProps = {
  transactionId: string;
  maxAmount: number;
  currency?: string;
  onSubmit: (amount: number, reason: string) => Promise<void>;
  onCancel: () => void;
};

export const RefundRequest: React.FC<RefundRequestProps> = ({
  transactionId,
  maxAmount,
  currency = 'ETB',
  onSubmit,
  onCancel,
}) => {
  const [amount, setAmount] = useState<string>(maxAmount.toString());
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleAmountChange = (text: string) => {
    // Allow only numbers and one decimal point
    if (/^\d*\.?\d*$/.test(text) || text === '') {
      setAmount(text);
      setError('');
    }
  };

  const handleSubmit = async () => {
    const amountValue = parseFloat(amount);
    
    // Validation
    if (isNaN(amountValue) || amountValue <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (amountValue > maxAmount) {
      setError(`Amount cannot exceed ${maxAmount} ${currency}`);
      return;
    }
    
    if (!reason.trim()) {
      setError('Please provide a reason for the refund');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(amountValue, reason);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process refund');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request Refund</Text>
      
      <View style={styles.transactionInfo}>
        <Text style={styles.label}>Transaction ID:</Text>
        <Text style={styles.value} selectable>{transactionId}</Text>
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={styles.label}>Amount to Refund ({currency})</Text>
        <View style={styles.amountInputContainer}>
          <TextInput
            style={[styles.input, styles.amountInput]}
            value={amount}
            onChangeText={handleAmountChange}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor="#999"
          />
          <Text style={styles.maxAmount} onPress={() => setAmount(maxAmount.toString())}>
            MAX: {maxAmount} {currency}
          </Text>
        </View>
      </View>
      
      <View style={styles.reasonContainer}>
        <Text style={styles.label}>Reason for Refund</Text>
        <TextInput
          style={[styles.input, styles.reasonInput]}
          value={reason}
          onChangeText={setReason}
          placeholder="Please explain why you're requesting a refund"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Text style={styles.submitButtonText}>Processing...</Text>
          ) : (
            <Text style={styles.submitButtonText}>Submit Request</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <Text style={styles.note}>
        Note: Refunds may take 5-10 business days to process and appear in your account.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    maxWidth: 500,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  transactionInfo: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  label: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    color: '#333333',
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 6,
    fontFamily: 'monospace',
  },
  amountContainer: {
    marginBottom: 20,
  },
  amountInputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#FFFFFF',
  },
  amountInput: {
    fontSize: 24,
    fontWeight: '600',
    paddingRight: 100,
  },
  maxAmount: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },
  reasonContainer: {
    marginBottom: 20,
  },
  reasonInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666666',
    fontWeight: '600',
    fontSize: 15,
  },
  submitButton: {
    backgroundColor: '#2196F3',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  note: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 16,
  },
});
