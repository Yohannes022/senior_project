export interface PaymentReceipt {
  id: string;
  amount: number;
  currency: string;
  fee: number;
  status: 'success' | 'failed' | 'pending';
  transactionId: string;
  txRef: string;
  customer: {
    email: string;
    phoneNumber?: string;
  };
  metadata?: Record<string, any>;
  timestamp: Date | string;
  receiptUrl?: string;
}

export interface PaymentVerification {
  txRef: string;
  status: 'success' | 'failed' | 'pending';
  transactionId?: string;
  amount: number;
  currency: string;
  timestamp: Date | string;
  provider: 'chapa' | 'flutterwave';
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  email: string;
  phoneNumber?: string;
  txRef: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  message?: string;
  data?: {
    checkoutUrl: string;
    txRef: string;
  };
}

export interface RefundRequest {
  transactionId: string;
  amount: number;
  reason?: string;
}

export interface RefundResponse {
  success: boolean;
  message?: string;
  data?: {
    refundId: string;
    status: string;
    amount: number;
    currency: string;
  };
}
