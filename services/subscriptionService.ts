import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import 'react-native-get-random-values';
import { SubscriptionPlan, UserSubscription, SubscriptionUsage } from '@/types/subscription';

const SUBSCRIPTION_PLANS_KEY = '@subscription_plans';
const USER_SUBSCRIPTION_KEY = '@user_subscription';

class SubscriptionService {
  private static instance: SubscriptionService;
  private subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'weekly',
      name: 'Weekly Pass',
      description: 'Unlimited rides for 7 days',
      duration: 7,
      price: 100, // in ETB
      discount: 10,
      isActive: true,
      features: ['Unlimited rides', 'All routes', 'Priority boarding']
    },
    {
      id: 'monthly',
      name: 'Monthly Pass',
      description: 'Unlimited rides for 30 days',
      duration: 30,
      price: 350, // in ETB
      discount: 20,
      isActive: true,
      features: ['Unlimited rides', 'All routes', 'Priority boarding', 'Free transfers']
    },
    {
      id: 'yearly',
      name: 'Annual Pass',
      description: 'Unlimited rides for 365 days',
      duration: 365,
      price: 3500, // in ETB
      discount: 30,
      isActive: true,
      features: [
        'Unlimited rides',
        'All routes',
        'Priority boarding',
        'Free transfers',
        'Exclusive offers',
        'Free companion pass (2x per month)'
      ]
    }
  ];

  private constructor() {
    this.initialize();
  }

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  private async initialize(): Promise<void> {
    // Initialize with default plans if none exist
    const existingPlans = await this.getSubscriptionPlans();
    if (existingPlans.length === 0) {
      await SecureStore.setItemAsync(SUBSCRIPTION_PLANS_KEY, JSON.stringify(this.subscriptionPlans));
    }
  }

  /**
   * Get all available subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const plansJson = await SecureStore.getItemAsync(SUBSCRIPTION_PLANS_KEY);
      return plansJson ? JSON.parse(plansJson) : [];
    } catch (error) {
      console.error('Error getting subscription plans:', error);
      return [];
    }
  }

  /**
   * Get a specific subscription plan by ID
   */
  async getSubscriptionPlan(planId: string): Promise<SubscriptionPlan | null> {
    const plans = await this.getSubscriptionPlans();
    return plans.find(plan => plan.id === planId) || null;
  }

  /**
   * Subscribe a user to a plan
   */
  async subscribeUser(userId: string, planId: string): Promise<UserSubscription | null> {
    try {
      const plan = await this.getSubscriptionPlan(planId);
      if (!plan) {
        throw new Error('Subscription plan not found');
      }

      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(now.getDate() + plan.duration);

      // Generate a unique QR code for this subscription
      const qrData = await this.generateQRCode(userId, planId);
      
      const subscription: UserSubscription = {
        id: `sub_${Crypto.randomUUID()}`,
        userId,
        planId,
        startDate: now,
        endDate,
        isActive: true,
        qrCode: qrData,
        lastUsed: now,
      };

      await SecureStore.setItemAsync(USER_SUBSCRIPTION_KEY, JSON.stringify(subscription));
      return subscription;
    } catch (error) {
      console.error('Error subscribing user:', error);
      return null;
    }
  }

  /**
   * Get user's current active subscription
   */
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const subJson = await SecureStore.getItemAsync(USER_SUBSCRIPTION_KEY);
      if (!subJson) return null;

      const subscription = JSON.parse(subJson) as UserSubscription;
      
      // Check if subscription is still valid
      const now = new Date();
      if (new Date(subscription.endDate) < now) {
        subscription.isActive = false;
        await SecureStore.setItemAsync(USER_SUBSCRIPTION_KEY, JSON.stringify(subscription));
      }

      return subscription;
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return null;
    }
  }

  /**
   * Validate a QR code
   */
  async validateQRCode(qrData: string, userId: string): Promise<{
    isValid: boolean;
    message?: string;
    subscription?: UserSubscription;
  }> {
    try {
      const data = JSON.parse(qrData);
      
      // Verify the signature (in a real app, verify with your backend)
      const expectedSignature = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${data.userId}:${data.planId}:${data.timestamp}:YOUR_SECRET_KEY`
      );
      
      if (data.signature !== expectedSignature) {
        return { isValid: false, message: 'Invalid QR code signature' };
      }
      
      // Check if the user ID matches
      if (data.userId !== userId) {
        return { isValid: false, message: 'This QR code is not yours' };
      }
      
      // Get the subscription
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) {
        return { isValid: false, message: 'No active subscription found' };
      }
      
          // Check if subscription is active
      if (!subscription.isActive) {
        return { isValid: false, message: 'Your subscription is not active' };
      }
      
      // Check if subscription is expired
      if (new Date() > new Date(subscription.endDate)) {
        return { isValid: false, message: 'Your subscription has expired' };
      }
      
      // Record this trip
      await this.recordTrip(subscription.id, {
        id: Crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        subscriptionId: subscription.id,
        routeId: 'unknown', // Would come from the bus/route context
        vehicleId: 'unknown', // Would come from the bus/route context
      });
      
      return { 
        isValid: true, 
        message: 'Subscription is valid. Welcome aboard!',
        subscription 
      };
      
    } catch (error) {
      console.error('Error validating QR code:', error);
      return { 
        isValid: false, 
        message: 'Error validating QR code. Please try again.' 
      };
    }
  }

  /**
   * Record a trip using the subscription
   */
  async recordTrip(
    subscriptionId: string,
    trip: {
      id: string;
      timestamp: string;
      subscriptionId: string;
      routeId: string;
      vehicleId: string;
    }
  ): Promise<boolean> {
    try {
      const subJson = await SecureStore.getItemAsync(USER_SUBSCRIPTION_KEY);
      if (!subJson) return false;

      const subscription = JSON.parse(subJson) as UserSubscription;
      if (subscription.id !== subscriptionId || !subscription.isActive) {
        return false;
      }

      // Update last used timestamp
      subscription.lastUsed = new Date();
      await SecureStore.setItemAsync(USER_SUBSCRIPTION_KEY, JSON.stringify(subscription));

      // In a real app, you would save this to your backend
      const usage: SubscriptionUsage = {
        id: `usage_${Crypto.randomUUID()}`,
        subscriptionId,
        timestamp: new Date(),
        routeId: trip.routeId,
        vehicleId: trip.vehicleId,
        startStopId: 'unknown', // Would come from the bus/route context
        endStopId: 'unknown', // Would come from the bus/route context
        fare: 0, // Would come from the bus/route context
        status: 'completed'
      };

      return true;
    } catch (error) {
      console.error('Error recording trip:', error);
      return false;
    }
  }

  /**
   * Generate a QR code data for the subscription
   */
  private async generateQRCode(userId: string, planId: string): Promise<string> {
    // In a real app, you would sign this data with a secret key
    const data = {
      userId,
      planId,
      timestamp: Date.now(),
      signature: await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${userId}:${planId}:${Date.now()}:YOUR_SECRET_KEY`
      )
    };

    // Return the data string to be encoded as QR code
    return JSON.stringify(data);
  }
}

export const subscriptionService = SubscriptionService.getInstance();
