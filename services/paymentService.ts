import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';

// Base URL for your API
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'https://api.shegertransit.com';

type PaymentProvider = 'chapa' | 'flutterwave';

interface PaymentRequest {
  amount: number;
  currency: string;
  email: string;
  phoneNumber?: string;
  txRef: string;
  metadata?: Record<string, any>;
}

interface PaymentVerification {
  txRef: string;
  status: 'success' | 'failed' | 'pending';
  transactionId?: string;
  amount: number;
  currency: string;
  timestamp: Date;
  provider: PaymentProvider;
}

interface PaymentReceipt {
  id: string;
  amount: number;
  currency: string;
  fee: number;
  status: string;
  transactionId: string;
  txRef: string;
  customer: {
    email: string;
    phoneNumber?: string;
  };
  metadata?: Record<string, any>;
  timestamp: Date;
  receiptUrl?: string;
}

class PaymentService {
  private static instance: PaymentService;
  private baseUrl = `${API_BASE_URL}/payments`;
  private chapaPublicKey = 'CHAPA_PUBLIC_KEY';
  private flutterwavePublicKey = 'FLW_PUBLIC_KEY';

  private constructor() {}

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  private async generateTransactionReference(): Promise<string> {
    const timestamp = Date.now();
    const randomString = await Crypto.getRandomBytesAsync(8).then(bytes => 
      Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    );
    return `TX-${timestamp}-${randomString}`.toUpperCase();
  }

  async initializePayment(
    provider: PaymentProvider,
    request: Omit<PaymentRequest, 'txRef'>
  ): Promise<{ checkoutUrl: string; txRef: string }> {
    const txRef = await this.generateTransactionReference();
    const paymentRequest = { ...request, txRef };

    try {
      const response = await fetch(`${this.baseUrl}/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider === 'chapa' ? this.chapaPublicKey : this.flutterwavePublicKey}`,
          'X-Payment-Provider': provider
        },
        body: JSON.stringify(paymentRequest)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to initialize payment');
      }

      const data = await response.json();
      return {
        checkoutUrl: data.checkoutUrl,
        txRef
      };
    } catch (error) {
      console.error('Payment initialization failed:', error);
      throw error instanceof Error ? error : new Error('Failed to initialize payment');
    }
  }

  async verifyPayment(
    provider: PaymentProvider,
    txRef: string
  ): Promise<PaymentVerification> {
    try {
      const response = await fetch(
        `${this.baseUrl}/verify?txRef=${encodeURIComponent(txRef)}&provider=${provider}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${provider === 'chapa' ? this.chapaPublicKey : this.flutterwavePublicKey}`,
            'X-Payment-Provider': provider
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to verify payment');
      }

      const data = await response.json();
      return {
        ...data,
        timestamp: new Date(),
        provider
      };
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw error instanceof Error ? error : new Error('Failed to verify payment');
    }
  }

  async generateReceipt(verification: PaymentVerification): Promise<PaymentReceipt> {
    const receipt: PaymentReceipt = {
      id: verification.transactionId || verification.txRef,
      amount: verification.amount,
      currency: verification.currency,
      fee: this.calculateFee(verification.amount, verification.provider),
      status: verification.status,
      transactionId: verification.transactionId || verification.txRef,
      txRef: verification.txRef,
      customer: {
        email: '', // Will be populated from metadata
        phoneNumber: ''
      },
      timestamp: new Date(),
      receiptUrl: `${this.baseUrl}/receipts/${verification.txRef}`
    };

    // Store receipt in secure storage
    await this.storeReceipt(receipt);
    
    return receipt;
  }

  private calculateFee(amount: number, provider: PaymentProvider): number {
    // Example fee calculation - adjust based on provider's fee structure
    const baseFee = 2.5; // 2.5% + fixed fee
    const fixedFee = provider === 'chapa' ? 3 : 2.9;
    return (amount * (baseFee / 100)) + fixedFee;
  }

  private async storeReceipt(receipt: PaymentReceipt): Promise<void> {
    try {
      const receipts = await this.getStoredReceipts();
      receipts.unshift(receipt);
      await SecureStore.setItemAsync(
        'payment_receipts',
        JSON.stringify(receipts)
      );
    } catch (error) {
      console.error('Failed to store receipt:', error);
    }
  }

  async getReceipts(): Promise<PaymentReceipt[]> {
    return this.getStoredReceipts();
  }

  private async getStoredReceipts(): Promise<PaymentReceipt[]> {
    try {
      const receipts = await SecureStore.getItemAsync('payment_receipts');
      return receipts ? JSON.parse(receipts) : [];
    } catch (error) {
      console.error('Failed to retrieve receipts:', error);
      return [];
    }
  }

  async processRefund(
    transactionId: string,
    amount: number,
    reason: string = ''
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.chapaPublicKey}` // Using Chapa as default for refunds
        },
        body: JSON.stringify({ transactionId, amount, reason })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to process refund');
      }

      const data = await response.json();
      return {
        success: data.success,
        message: data.message || 'Refund processed successfully'
      };
    } catch (error) {
      console.error('Refund processing failed:', error);
      throw error instanceof Error ? error : new Error('Failed to process refund');
    }
  }
}

export const paymentService = PaymentService.getInstance();
