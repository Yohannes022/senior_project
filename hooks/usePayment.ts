import { useState, useCallback } from 'react';
import { paymentService } from '@/services/paymentService';
import { 
  PaymentReceipt, 
  PaymentVerification, 
  PaymentRequest,
  PaymentResponse,
  RefundRequest,
  RefundResponse
} from '@/types/payment';

type PaymentStatus = 'idle' | 'processing' | 'success' | 'error' | 'verifying';

interface UsePaymentReturn {
  status: PaymentStatus;
  error: string | null;
  receipt: PaymentReceipt | null;
  initializePayment: (provider: 'chapa' | 'flutterwave', amount: number, email: string) => Promise<PaymentResponse>;
  verifyPayment: (provider: 'chapa' | 'flutterwave', txRef: string) => Promise<PaymentVerification>;
  processRefund: (request: RefundRequest) => Promise<RefundResponse>;
  reset: () => void;
}

export function usePayment(): UsePaymentReturn {
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

  // Helper function to ensure the receipt has the correct type
  const createValidReceipt = (data: any): PaymentReceipt => ({
    id: data.id || '',
    amount: data.amount || 0,
    currency: data.currency || 'ETB',
    fee: data.fee || 0,
    status: (data.status === 'success' || data.status === 'failed' || data.status === 'pending') 
      ? data.status 
      : 'pending',
    transactionId: data.transactionId || '',
    txRef: data.txRef || '',
    customer: {
      email: data.customer?.email || '',
      phoneNumber: data.customer?.phoneNumber || '',
    },
    metadata: data.metadata || {},
    timestamp: data.timestamp || new Date(),
    receiptUrl: data.receiptUrl,
  });

  const initializePayment = useCallback(
    async (provider: 'chapa' | 'flutterwave', amount: number, email: string): Promise<PaymentResponse> => {
      setStatus('processing');
      setError(null);

      try {
        const paymentData: Omit<PaymentRequest, 'txRef'> = {
          amount,
          currency: 'ETB',
          email,
          metadata: {
            app: 'ShegerTransit',
            userId: 'current-user-id' // Replace with actual user ID from auth context
          }
        };

        const result = await paymentService.initializePayment(provider, paymentData);
        
        // In a React Native app, you would use Linking to open the URL
        // For web, you can use window.location.href
        if (typeof window !== 'undefined') {
          window.location.href = result.checkoutUrl;
        }
        
        setStatus('success');
        return {
          success: true,
          data: result
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Payment initialization failed';
        setStatus('error');
        setError(errorMessage);
        return {
          success: false,
          message: errorMessage
        };
      }
    },
    []
  );

  const verifyPayment = useCallback(
    async (provider: 'chapa' | 'flutterwave', txRef: string): Promise<PaymentVerification> => {
      setStatus('verifying');
      setError(null);

      try {
        const verification = await paymentService.verifyPayment(provider, txRef);
        const receiptData = await paymentService.generateReceipt(verification);
        const validReceipt = createValidReceipt(receiptData);
        setReceipt(validReceipt);
        setStatus('success');
        return verification;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Payment verification failed';
        setStatus('error');
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const processRefund = useCallback(
    async (request: RefundRequest): Promise<RefundResponse> => {
      setStatus('processing');
      setError(null);

      try {
        const result = await paymentService.processRefund(
          request.transactionId,
          request.amount,
          request.reason
        );

        if (result.success) {
          setStatus('success');
        } else {
          setStatus('error');
          setError(result.message || 'Refund processing failed');
        }
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Refund processing failed';
        setStatus('error');
        setError(errorMessage);
        return {
          success: false,
          message: errorMessage
        };
      }
    },
    []
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setReceipt(null);
  }, []);

  return {
    status,
    error,
    receipt,
    initializePayment,
    verifyPayment,
    processRefund,
    reset
  };
}
