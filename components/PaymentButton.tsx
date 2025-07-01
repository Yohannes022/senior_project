import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { usePayment } from '@/hooks/usePayment';
import { PaymentVerification } from '@/types/payment';

type PaymentProvider = 'chapa' | 'flutterwave';

interface PaymentButtonProps {
  amount: number;
  email: string;
  provider: PaymentProvider;
  label?: string;
  disabled?: boolean;
  onSuccess?: (receipt: any) => void;
  onError?: (error: Error) => void;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  email,
  provider,
  label = 'Pay Now',
  disabled = false,
  onSuccess,
  onError,
}) => {
  const { status, error, receipt, initializePayment, verifyPayment, reset } = usePayment();
  
  const getStatusMessage = useCallback(() => {
    if (status === 'success' || receipt) {
      return 'Payment successful! Your receipt has been sent to your email.';
    }
    if (status === 'error' && error) {
      // Since error is typed as string | null, we can directly return it
      return error;
    }
    return '';
  }, [status, error, receipt]);

  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    try {
      const result = await initializePayment(provider, amount, email);
      if (result.status === 'failed') {
        onError?.(new Error(result.message || 'Payment initialization failed'));
      }
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error('Payment failed'));
    }
  };

  // Check for payment success when component mounts
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (typeof window === 'undefined') return;
      
      const url = new URL(window.location.href);
      const txRef = url.searchParams.get('tx_ref');
      const status = url.searchParams.get('status');

      if (txRef && status === 'successful') {
        try {
          const verification = await verifyPayment(provider, txRef);
          if (verification.status === 'success') {
            setShowSuccess(true);
            onSuccess?.(verification);
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (err) {
          onError?.(err instanceof Error ? err : new Error('Payment verification failed'));
        }
      }
    };

    checkPaymentStatus();
  }, [provider, onSuccess, onError]);

  const getButtonText = useCallback(() => {
    if (status === 'processing') return 'Processing...';
    if (status === 'verifying') return 'Verifying...';
    if (status === 'success' || showSuccess) return 'Payment Successful!';
    return label;
  }, [status, showSuccess, label]);

  // Button style is now handled inline with conditional styles

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          (status === 'success' || showSuccess) && styles.buttonSuccess,
          status === 'error' && styles.buttonError,
          (status === 'processing' || status === 'verifying') && styles.buttonDisabled,
        ]}
        onPress={handlePayment}
        disabled={status === 'processing' || status === 'verifying' || showSuccess}
      >
        <Text style={styles.buttonText}>{getButtonText()}</Text>
        
        {(status === 'processing' || status === 'verifying') && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="white" />
          </View>
        )}
      </TouchableOpacity>
      
      {getStatusMessage() && (
        <View style={styles.statusContainer}>
          <Text style={[
            styles.statusText,
            (status === 'success' || showSuccess) && styles.successText,
            status === 'error' && styles.errorText,
          ]}>
            {getStatusMessage()}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    opacity: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonSuccess: {
    backgroundColor: '#34C759',
  },
  buttonError: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    position: 'absolute',
    right: 16,
  },
  statusContainer: {
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  successText: {
    color: '#34C759',
  },
  errorText: {
    color: '#FF3B30',
  },
});
