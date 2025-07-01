import { DynamicPricingRule, LoyaltyTier, UserLoyalty, ReferralProgram, GroupTravelOption, GroupBookingRequest } from '@/types/pricing';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PRICING_RULES_KEY = '@sheger_transit_pricing_rules';
const LOYALTY_TIERS_KEY = '@sheger_transit_loyalty_tiers';
const USER_LOYALTY_KEY = (userId: string) => `@sheger_transit_user_loyalty_${userId}`;
const REFERRAL_PROGRAM_KEY = '@sheger_transit_referral_program';
const GROUP_TRAVEL_OPTIONS_KEY = '@sheger_transit_group_options';
const GROUP_BOOKINGS_KEY = '@sheger_transit_group_bookings';

class FeatureService {
  // Dynamic Pricing Methods
  async getPricingRules(): Promise<DynamicPricingRule[]> {
    const rules = await AsyncStorage.getItem(PRICING_RULES_KEY);
    return rules ? JSON.parse(rules) : [];
  }

  async addPricingRule(rule: Omit<DynamicPricingRule, 'id' | 'createdAt' | 'updatedAt'>) {
    const rules = await this.getPricingRules();
    const newRule: DynamicPricingRule = {
      ...rule,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    rules.push(newRule);
    await AsyncStorage.setItem(PRICING_RULES_KEY, JSON.stringify(rules));
    return newRule;
  }

  async calculateDynamicPrice(basePrice: number, routeId: string, travelTime: Date): Promise<number> {
    const rules = await this.getPricingRules();
    const activeRules = rules.filter(rule => rule.isActive);
    
    let finalPrice = basePrice;
    const time = new Date(travelTime);
    const dayOfWeek = time.getDay();
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const currentTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    for (const rule of activeRules) {
      const { conditions, multiplier } = rule;
      let matches = true;

      if (conditions.routeId && conditions.routeId !== routeId) {
        continue;
      }

      if (conditions.timeOfDay) {
        const { start, end } = conditions.timeOfDay;
        if (currentTime < start || currentTime > end) {
          continue;
        }
      }

      if (conditions.dayOfWeek && !conditions.dayOfWeek.includes(dayOfWeek)) {
        continue;
      }

      // If we get here, the rule matches
      finalPrice *= multiplier;
    }

    return parseFloat(finalPrice.toFixed(2));
  }

  // Loyalty Program Methods
  async getLoyaltyTiers(): Promise<LoyaltyTier[]> {
    const tiers = await AsyncStorage.getItem(LOYALTY_TIERS_KEY);
    return tiers ? JSON.parse(tiers) : [];
  }

  async getUserLoyalty(userId: string): Promise<UserLoyalty | null> {
    const loyalty = await AsyncStorage.getItem(USER_LOYALTY_KEY(userId));
    return loyalty ? JSON.parse(loyalty) : null;
  }

  async addLoyaltyPoints(userId: string, points: number): Promise<UserLoyalty> {
    const tiers = await this.getLoyaltyTiers();
    let userLoyalty = await this.getUserLoyalty(userId);
    
    if (!userLoyalty) {
      userLoyalty = {
        userId,
        points: 0,
        currentTier: 'Bronze',
        pointsToNextTier: tiers[0]?.pointsThreshold || 100,
        lastActivity: new Date(),
        lifetimePoints: 0
      };
    }

    userLoyalty.points += points;
    userLoyalty.lifetimePoints += points;
    userLoyalty.lastActivity = new Date();

    // Check for tier upgrades
    const currentTierIndex = tiers.findIndex(t => t.name === userLoyalty.currentTier);
    const nextTier = tiers[currentTierIndex + 1];
    
    if (nextTier && userLoyalty.points >= nextTier.pointsThreshold) {
      userLoyalty.currentTier = nextTier.name;
      userLoyalty.pointsToNextTier = tiers[currentTierIndex + 2]?.pointsThreshold || 0;
    }

    await AsyncStorage.setItem(USER_LOYALTY_KEY(userId), JSON.stringify(userLoyalty));
    return userLoyalty;
  }

  // Referral Program Methods
  async getReferralProgram(): Promise<ReferralProgram> {
    const program = await AsyncStorage.getItem(REFERRAL_PROGRAM_KEY);
    return program 
      ? JSON.parse(program) 
      : {
          referrerBonus: 100,
          refereeBonus: 50,
          isActive: true,
          minRidesForReferrer: 3,
          minRidesForReferee: 1,
          bonusType: 'points',
          expiryDays: 30
        };
  }

  async processReferral(referrerId: string, refereeId: string) {
    const program = await this.getReferralProgram();
    if (!program.isActive) return;

    // In a real app, you would track referrals and apply bonuses after ride completion
    // This is a simplified version
    return {
      referrerBonus: program.referrerBonus,
      refereeBonus: program.refereeBonus,
      message: 'Referral bonuses will be applied after completing the required number of rides.'
    };
  }

  // Group Travel Methods
  async getGroupTravelOptions(): Promise<GroupTravelOption[]> {
    const options = await AsyncStorage.getItem(GROUP_TRAVEL_OPTIONS_KEY);
    return options ? JSON.parse(options) : [];
  }

  async createGroupBooking(booking: Omit<GroupBookingRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
    const bookings = await this.getGroupBookings();
    const options = await this.getGroupTravelOptions();
    const option = options.find(opt => opt.id === booking.routeId);
    
    if (!option) {
      throw new Error('Invalid group travel option');
    }

    if (booking.passengers < option.minPassengers) {
      throw new Error(`Minimum ${option.minPassengers} passengers required for group booking`);
    }

    const discount = option.discountPercentage / 100;
    const discountAmount = booking.totalAmount * discount;
    
    const newBooking: GroupBookingRequest = {
      ...booking,
      id: Date.now().toString(),
      status: 'pending',
      discountApplied: discountAmount,
      totalAmount: booking.totalAmount - discountAmount,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    bookings.push(newBooking);
    await AsyncStorage.setItem(GROUP_BOOKINGS_KEY, JSON.stringify(bookings));
    return newBooking;
  }

  private async getGroupBookings(): Promise<GroupBookingRequest[]> {
    const bookings = await AsyncStorage.getItem(GROUP_BOOKINGS_KEY);
    return bookings ? JSON.parse(bookings) : [];
  }
}

export const featureService = new FeatureService();
