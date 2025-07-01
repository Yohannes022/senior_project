export interface DynamicPricingRule {
  id: string;
  name: string;
  description: string;
  conditions: {
    timeOfDay?: { start: string; end: string };
    dayOfWeek?: number[];
    demandMultiplier?: number;
    routeId?: string;
  };
  multiplier: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoyaltyTier {
  id: string;
  name: string;
  pointsThreshold: number;
  benefits: string[];
  discountPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserLoyalty {
  userId: string;
  points: number;
  currentTier: string;
  nextTier?: string;
  pointsToNextTier: number;
  lastActivity: Date;
  lifetimePoints: number;
}

export interface ReferralProgram {
  referrerBonus: number;
  refereeBonus: number;
  isActive: boolean;
  minRidesForReferrer: number;
  minRidesForReferee: number;
  bonusType: 'points' | 'discount' | 'credit';
  expiryDays: number;
}

export interface GroupTravelOption {
  id: string;
  name: string;
  description: string;
  minPassengers: number;
  discountPercentage: number;
  maxPassengers: number;
  availableRoutes: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupBookingRequest {
  id: string;
  organizerId: string;
  routeId: string;
  travelDate: Date;
  passengers: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  discountApplied: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}
