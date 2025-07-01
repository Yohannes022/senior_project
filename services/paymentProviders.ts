import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'https://api.shegertransit.com';

// Types
export type PaymentProvider = 'chapa' | 'flutterwave';

interface PaymentInitResponse {
  checkoutUrl: string;
  txRef: string;
  status: 'success' | 'failed';
  message?: string;
}

interface PaymentVerificationResponse {
  status: 'success' | 'failed' | 'pending';
  transactionId?: string;
  amount: number;
  currency: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Chapa specific implementation
const chapaService = {
  async initializePayment(
    amount: number,
    email: string,
    txRef: string,
    metadata: Record<string, any> = {}
  ): Promise<PaymentInitResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/payments/chapa/initialize`,
        {
          amount,
          currency: 'ETB',
          email,
          tx_ref: txRef,
          callback_url: `${Constants.expoConfig?.scheme || 'shegertransit'}://payment-callback`,
          return_url: `${Constants.expoConfig?.scheme || 'shegertransit'}://payment-return`,
          customization: {
            title: 'Sheger Transit+',
            description: 'Ride Payment',
          },
          meta: metadata,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getApiKey('chapa')}`,
          },
        }
      );

      return {
        checkoutUrl: response.data.data.checkout_url,
        txRef,
        status: 'success',
      };
    } catch (error: any) {
      console.error('Chapa payment error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to initialize Chapa payment');
    }
  },

  async verifyPayment(txRef: string): Promise<PaymentVerificationResponse> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/payments/chapa/verify/${txRef}`,
        {
          headers: {
            'Authorization': `Bearer ${await getApiKey('chapa')}`,
          },
        }
      );

      return {
        status: response.data.status === 'success' ? 'success' : 'failed',
        transactionId: response.data.data.id,
        amount: parseFloat(response.data.data.amount),
        currency: response.data.data.currency,
        timestamp: response.data.data.created_at,
        metadata: response.data.data.meta,
      };
    } catch (error: any) {
      console.error('Chapa verification error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to verify Chapa payment');
    }
  },
};

// Flutterwave specific implementation
const flutterwaveService = {
  async initializePayment(
    amount: number,
    email: string,
    txRef: string,
    metadata: Record<string, any> = {}
  ): Promise<PaymentInitResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/payments/flutterwave/initialize`,
        {
          amount,
          currency: 'ETB',
          email,
          tx_ref: txRef,
          redirect_url: `${Constants.expoConfig?.scheme || 'shegertransit'}://payment-callback`,
          customer: {
            email,
            name: metadata?.customerName || 'Customer',
          },
          customizations: {
            title: 'Sheger Transit+',
            description: 'Ride Payment',
            logo: 'https://shegertransit.com/logo.png',
          },
          meta: metadata,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getApiKey('flutterwave')}`,
          },
        }
      );

      return {
        checkoutUrl: response.data.data.link,
        txRef,
        status: 'success',
      };
    } catch (error: any) {
      console.error('Flutterwave payment error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to initialize Flutterwave payment');
    }
  },

  async verifyPayment(txRef: string): Promise<PaymentVerificationResponse> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/payments/flutterwave/verify/${txRef}`,
        {
          headers: {
            'Authorization': `Bearer ${await getApiKey('flutterwave')}`,
          },
        }
      );

      return {
        status: response.data.status === 'successful' ? 'success' : 'failed',
        transactionId: response.data.data.id.toString(),
        amount: parseFloat(response.data.data.amount),
        currency: response.data.data.currency,
        timestamp: response.data.data.created_at,
        metadata: response.data.data.meta,
      };
    } catch (error: any) {
      console.error('Flutterwave verification error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to verify Flutterwave payment');
    }
  },
};

// Helper function to get API keys from secure storage
async function getApiKey(provider: PaymentProvider): Promise<string> {
  const key = `@${provider}_api_key`;
  const apiKey = await SecureStore.getItemAsync(key);
  
  if (!apiKey) {
    throw new Error(`${provider.toUpperCase()} API key not found`);
  }
  
  return apiKey;
}

export const paymentProviders = {
  chapa: chapaService,
  flutterwave: flutterwaveService,
};

export const setupPaymentProvider = async (provider: PaymentProvider, apiKey: string): Promise<void> => {
  await SecureStore.setItemAsync(`@${provider}_api_key`, apiKey);
};

export const isPaymentProviderConfigured = async (provider: PaymentProvider): Promise<boolean> => {
  try {
    const key = await SecureStore.getItemAsync(`@${provider}_api_key`);
    return !!key;
  } catch (error) {
    console.error(`Error checking ${provider} configuration:`, error);
    return false;
  }
};
