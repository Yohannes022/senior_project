export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  duration: number; // in days
  price: number;
  discount: number; // percentage
  isActive: boolean;
  features: string[];
};

export type UserSubscription = {
  id: string;
  userId: string;
  planId: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  qrCode: string; // Base64 encoded QR code
  tripsRemaining?: number; // For limited plans
  lastUsed?: Date;
};

export type SubscriptionUsage = {
  id: string;
  subscriptionId: string;
  timestamp: Date;
  routeId: string;
  vehicleId: string;
  startStopId: string;
  endStopId: string;
  fare: number;
  status: 'completed' | 'in_progress' | 'cancelled';
};
