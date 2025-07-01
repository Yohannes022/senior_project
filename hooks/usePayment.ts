import { useState, useCallback, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { paymentProviders } from '@/services/paymentProviders';
import { receiptService } from '@/services/receiptService';
import { PaymentProvider } from '@/types/payment';

// Types
export type PaymentStatus = 'idle' | 'processing' | 'success' | 'error' | 'verifying';

interface PaymentReceipt {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  date: Date;
  customer: {
    email: string;
    name?: string;
  };
  items?: Array<{
    description: string;
    quantity: number;
    amount: number;
  }>;
  metadata?: Record<string, any>;
  receiptUrl?: string;
}

interface PaymentVerification {
  status: 'success' | 'failed' | 'pending';
  transactionId?: string;
  amount: number;
  currency: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface PaymentResponse {
  checkoutUrl: string;
  txRef: string;
  status: 'success' | 'failed';
  message?: string;
}

interface RefundRequest {
  transactionId: string;
  amount: number;
  reason?: string;
}

interface RefundResponse {
  status: 'success' | 'failed';
  message?: string;
  refundId?: string;
}

interface UsePaymentReturn {
  status: PaymentStatus;
  error: string | null;
  receipt: PaymentReceipt | null;
  initializePayment: (provider: 'chapa' | 'flutterwave', amount: number, email: string) => Promise<PaymentResponse>;
  verifyPayment: (provider: 'chapa' | 'flutterwave', txRef: string) => Promise<PaymentVerification>;
  processRefund: (request: RefundRequest) => Promise<RefundResponse>;
  reset: () => void;
}

export function usePayment() {
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [activePayment, setActivePayment] = useState<{
    provider: PaymentProvider;
    txRef: string;
    amount: number;
    email: string;
  } | null>(null);

  // Memoize the verifyPaymentInternal function
  const verifyPaymentInternal = useCallback(async (
    provider: PaymentProvider,
    txRef: string
  ): Promise<PaymentVerification> => {
    return paymentProviders[provider].verifyPayment(txRef);
  }, []);

  // Handle deep linking for payment callbacks
  const handlePaymentCallback = useCallback(async (url: string) => {
    if (!activePayment) return;
    
    try {
      setStatus('verifying');
      
      // Verify the payment with the provider
      const verification = await verifyPaymentInternal(
        activePayment.provider,
        activePayment.txRef
      );
      
      if (verification.status === 'success') {
        // Generate receipt
        const receiptData: PaymentReceipt = {
          id: verification.transactionId || `tx-${Date.now()}`,
          transactionId: verification.transactionId || `tx-${Date.now()}`,
          amount: verification.amount,
          currency: verification.currency,
          status: 'success',
          paymentMethod: activePayment.provider,
          date: new Date(verification.timestamp),
          customer: {
            email: activePayment.email,
          },
          metadata: verification.metadata,
        };
        
        // Generate PDF receipt
        const receiptUrl = await receiptService.generateReceiptPdf(receiptData);
        receiptData.receiptUrl = receiptUrl;
        
        setReceipt(receiptData);
        setStatus('success');
      } else {
        throw new Error(verification.metadata?.message || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      setError(err instanceof Error ? err.message : 'Payment verification failed');
      setStatus('error');
    } finally {
      setActivePayment(null);
    }
  }, [activePayment, verifyPaymentInternal]);
  
  // Set up deep linking listener
  useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => {
      if (url.includes('payment-callback') || url.includes('payment-return')) {
        try {
          await handlePaymentCallback(url);
        } catch (error) {
          console.error('Error handling payment callback:', error);
        }
      }
    };

    // Get initial URL if app was opened from a deep link
    const getInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink({ url: initialUrl });
      }
    };

    getInitialUrl();
    
    // Add event listener for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    // Cleanup function
    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, [handlePaymentCallback]);

  const initializePayment = useCallback(
    async (
      provider: PaymentProvider,
      amount: number,
      email: string,
      metadata: Record<string, unknown> = {}
    ): Promise<PaymentResponse> => {
      setStatus('processing');
      setError(null);

      try {
        // Generate a unique transaction reference
        const txRef = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Initialize payment with the selected provider
        const response = await paymentProviders[provider].initializePayment(
          amount,
          email,
          txRef,
          metadata
        );
        
        // Store active payment details for verification
        setActivePayment({
          provider,
          txRef,
          amount,
          email,
        });
        
        // Open payment URL in browser
        const result = await WebBrowser.openBrowserAsync(response.checkoutUrl, {
          enableBarCollapsing: true,
          showTitle: true,
          toolbarColor: '#2c3e50',
          controlsColor: '#ffffff',
        });
        
        return {
          checkoutUrl: response.checkoutUrl,
          txRef,
          status: 'success' as const,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment';
        setError(errorMessage);
        setStatus('error');
        throw new Error(errorMessage);
      }
    },
    []
  );

  const verifyPayment = useCallback(
    async (provider: PaymentProvider, txRef: string): Promise<PaymentVerification> => {
      if (!provider || !txRef) {
        throw new Error('Provider and transaction reference are required');
      }
      try {
        setStatus('verifying');
        
        // Verify payment with the provider
        const verification = await verifyPaymentInternal(provider, txRef);
        
        if (verification.status === 'success') {
          // Generate receipt for successful payment
          const receiptData: PaymentReceipt = {
            id: verification.transactionId || `tx-${Date.now()}`,
            transactionId: verification.transactionId || `tx-${Date.now()}`,
            amount: verification.amount,
            currency: verification.currency,
            status: 'success',
            paymentMethod: provider,
            date: new Date(verification.timestamp),
            customer: {
              email: activePayment?.email || '',
            },
            metadata: verification.metadata,
          };
          
          // Generate PDF receipt
          const receiptUrl = await receiptService.generateReceiptPdf(receiptData);
          receiptData.receiptUrl = receiptUrl;
          
          setReceipt(receiptData);
          setStatus('success');
        } else {
          setError('Payment verification failed');
          setStatus('error');
        }
        
        return verification;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';
        setError(errorMessage);
        setStatus('error');
        throw new Error(errorMessage);
      }
    },
    [activePayment?.email]
  );

  const processRefund = useCallback(
    async (request: RefundRequest): Promise<RefundResponse> => {
      try {
        setStatus('processing');
        
        // In a real app, you would call your backend API to process the refund
        // This is a simplified example
        const response = await fetch(`${process.env.API_URL}/api/refunds`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Refund processing failed');
        }
        
        const data = await response.json();
        setStatus('success');
        return data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Refund processing failed';
        setError(errorMessage);
        setStatus('error');
        throw new Error(errorMessage);
      }
    },
    []
  );

  const shareReceipt = useCallback(async () => {
    if (!receipt?.receiptUrl) return;
    
    try {
      await receiptService.shareReceipt(receipt.receiptUrl);
    } catch (error) {
      console.error('Failed to share receipt:', error);
      throw new Error('Failed to share receipt');
    }
  }, [receipt]);

  const saveReceipt = useCallback(async (fileName: string) => {
    if (!receipt?.receiptUrl) return;
    
    try {
      return await receiptService.saveReceiptLocally(receipt.receiptUrl, fileName);
    } catch (error) {
      console.error('Failed to save receipt:', error);
      throw new Error('Failed to save receipt');
    }
  }, [receipt]);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setReceipt(null);
    setActivePayment(null);
  }, []);

  return {
    status,
    error,
    receipt,
    initializePayment,
    verifyPayment,
    processRefund,
    shareReceipt,
    saveReceipt,
    reset,
  };
};
