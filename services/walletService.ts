import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { WalletBalance, WalletTransaction, TopUpRequest, PaymentRequest, QRPaymentData, PaymentVerificationResult } from '@/types/wallet';

const POINTS_RATE = 0.1; // 1 point per 10 ETB

export class WalletService {
  private static instance: WalletService;

  private constructor() {}

  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  // Helper to create a valid SecureStore key
  private getWalletKey(userId: string): string {
    // Remove any characters that aren't alphanumeric, ., -, or _
    const safeUserId = userId.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `@wallet_${safeUserId}`;
  }

  // Helper to create a valid SecureStore key for transactions
  private getTransactionsKey(userId: string): string {
    // Remove any characters that aren't alphanumeric, ., -, or _
    const safeUserId = userId.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `@wallet_transactions_${safeUserId}`;
  }

  // Get wallet balance
  async getWalletBalance(userId: string): Promise<WalletBalance> {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      const key = this.getWalletKey(userId);
      const balanceJson = await SecureStore.getItemAsync(key);
      
      if (balanceJson) {
        return JSON.parse(balanceJson);
      }
      
      // Initialize new wallet if doesn't exist
      return this.initializeWallet(userId);
    } catch (error) {
      console.error('Error getting wallet balance:', {
        error,
        userId,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to retrieve wallet balance');
    }
  }

  // Initialize new wallet
  private async initializeWallet(userId: string): Promise<WalletBalance> {
    const newBalance: WalletBalance = {
      userId,
      availableBalance: 0,
      points: 0,
      lastUpdated: new Date()
    };
    
    try {
      const key = this.getWalletKey(userId);
      await SecureStore.setItemAsync(key, JSON.stringify(newBalance));
      return newBalance;
    } catch (error) {
      console.error('Error initializing wallet:', {
        error,
        userId,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to initialize wallet');
    }
  }

  // Add money to wallet
  async topUpWallet(userId: string, request: TopUpRequest): Promise<WalletBalance> {
    try {
      // Validate input
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      if (isNaN(request.amount) || request.amount <= 0) {
        throw new Error(`Invalid amount: ${request.amount}`);
      }
      
      if (!['chapa', 'telebirr', 'bank_transfer'].includes(request.paymentMethod)) {
        throw new Error(`Invalid payment method: ${request.paymentMethod}`);
      }
      
      // Get current balance
      const balance = await this.getWalletBalance(userId);
      
      // Update balance
      const updatedBalance: WalletBalance = {
        ...balance,
        availableBalance: Number((balance.availableBalance + request.amount).toFixed(2)), // Ensure 2 decimal places
        lastUpdated: new Date()
      };
      
      // Save updated balance
      const key = this.getWalletKey(userId);
      await SecureStore.setItemAsync(key, JSON.stringify(updatedBalance));
      
      // Record transaction
      await this.recordTransaction({
        id: `tx_${Crypto.randomUUID()}`,
        userId,
        amount: request.amount,
        type: 'topup',
        description: `Top up via ${request.paymentMethod}${request.reference ? ` (${request.reference})` : ''}`,
        timestamp: new Date(),
        status: 'completed',
        referenceId: request.reference
      });
      
      return updatedBalance;
    } catch (error) {
      console.error('Error in topUpWallet:', {
        error,
        userId,
        request,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error(`Failed to process top-up: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Make a payment
  async makePayment(userId: string, request: PaymentRequest): Promise<PaymentVerificationResult> {
    try {
      const balance = await this.getWalletBalance(userId);
      
      if (balance.availableBalance < request.amount) {
        return {
          success: false,
          message: 'Insufficient balance'
        };
      }
      
      // Update balance
      const updatedBalance: WalletBalance = {
        ...balance,
        availableBalance: balance.availableBalance - request.amount,
        points: balance.points + Math.floor(request.amount * POINTS_RATE),
        lastUpdated: new Date()
      };
      
      const key = this.getWalletKey(userId);
      await SecureStore.setItemAsync(key, JSON.stringify(updatedBalance));
      
      // Record transaction
      const transactionId = `tx_${Crypto.randomUUID()}`;
      await this.recordTransaction({
        id: transactionId,
        userId,
        amount: -request.amount, // Negative amount for payment
        type: 'ride_payment',
        description: request.description,
        timestamp: new Date(),
        referenceId: request.rideId,
        status: 'completed'
      });
      
      // Record points earned
      const pointsEarned = Math.floor(request.amount * POINTS_RATE);
      if (pointsEarned > 0) {
        await this.recordTransaction({
          id: `points_${Crypto.randomUUID()}`,
          userId,
          amount: pointsEarned,
          type: 'points_earned',
          description: `Earned ${pointsEarned} points`,
          timestamp: new Date(),
          referenceId: request.rideId,
          status: 'completed'
        });
      }
      
      return {
        success: true,
        message: 'Payment successful',
        transactionId,
        newBalance: updatedBalance.availableBalance
      };
    } catch (error) {
      console.error('Error making payment:', error);
      return {
        success: false,
        message: 'Payment failed. Please try again.'
      };
    }
  }

  // Generate QR code data for payment
  async generatePaymentQR(userId: string, rideId: string, amount: number): Promise<string> {
    const paymentData = {
      paymentId: `pay_${Crypto.randomUUID()}`,
      amount,
      rideId,
      userId,
      timestamp: Date.now(),
      signature: '' // Will be set after creating the data
    };
    
    // Create signature
    paymentData.signature = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${paymentData.paymentId}:${paymentData.amount}:${paymentData.userId}:${paymentData.timestamp}:YOUR_SECRET_KEY`
    );
    
    return JSON.stringify(paymentData);
  }

  // Verify and process QR payment
  async processQRPayment(qrData: string, driverId: string): Promise<PaymentVerificationResult> {
    try {
      const paymentData: QRPaymentData = JSON.parse(qrData);
      
      // Verify signature
      const expectedSignature = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${paymentData.paymentId}:${paymentData.amount}:${paymentData.userId}:${paymentData.timestamp}:YOUR_SECRET_KEY`
      );
      
      if (paymentData.signature !== expectedSignature) {
        return { success: false, message: 'Invalid payment QR code' };
      }
      
      // Check if QR code is expired (15 minutes)
      const qrAge = Date.now() - paymentData.timestamp;
      if (qrAge > 15 * 60 * 1000) {
        return { success: false, message: 'Payment QR code has expired' };
      }
      
      // Process payment
      const result = await this.makePayment(paymentData.userId, {
        amount: paymentData.amount,
        rideId: paymentData.rideId,
        userId: paymentData.userId,
        description: `Ride payment - Driver: ${driverId}`
      });
      
      return result;
    } catch (error) {
      console.error('Error processing QR payment:', error);
      return { success: false, message: 'Error processing payment' };
    }
  }

  // Get transaction history
  async getTransactionHistory(userId: string, limit: number = 20): Promise<WalletTransaction[]> {
    try {
      const key = this.getTransactionsKey(userId);
      const transactionsJson = await SecureStore.getItemAsync(key);
      if (!transactionsJson) return [];
      
      const transactions: WalletTransaction[] = JSON.parse(transactionsJson);
      return transactions
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }

  // Record a transaction
  private async recordTransaction(transaction: WalletTransaction): Promise<void> {
    try {
      const key = this.getTransactionsKey(transaction.userId);
      const transactions = await this.getTransactionHistory(transaction.userId, 1000); // Get all transactions
      transactions.unshift(transaction);
      
      await SecureStore.setItemAsync(key, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error recording transaction:', error);
    }
  }
}

export const walletService = WalletService.getInstance();
