export type TransactionType = 'topup' | 'ride_payment' | 'refund' | 'points_earned' | 'points_redeemed';

export interface WalletTransaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  description: string;
  timestamp: Date;
  referenceId?: string; // For linking to rides or other entities
  status: 'pending' | 'completed' | 'failed' | 'refunded';
}

export interface WalletBalance {
  userId: string;
  availableBalance: number;
  points: number;
  lastUpdated: Date;
}

export interface TopUpRequest {
  amount: number;
  paymentMethod: 'chapa' | 'telebirr' | 'bank_transfer';
  phoneNumber?: string; // For mobile money
  bankAccount?: string; // For bank transfers
  reference?: string;   // For transaction tracking
}

export interface PaymentRequest {
  amount: number;
  rideId: string;
  userId: string;
  description: string;
}

export interface QRPaymentData {
  paymentId: string;
  amount: number;
  rideId: string;
  userId: string;
  timestamp: number;
  signature: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  message: string;
  transactionId?: string;
  newBalance?: number;
}