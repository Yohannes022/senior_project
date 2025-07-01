import { useState, useEffect, useCallback } from 'react';
import { featureService } from '@/services/featureService';
import { DynamicPricingRule, LoyaltyTier, UserLoyalty, ReferralProgram, GroupTravelOption, GroupBookingRequest } from '@/types/pricing';

export function useFeatures(userId?: string) {
  const [pricingRules, setPricingRules] = useState<DynamicPricingRule[]>([]);
  const [loyaltyTiers, setLoyaltyTiers] = useState<LoyaltyTier[]>([]);
  const [userLoyalty, setUserLoyalty] = useState<UserLoyalty | null>(null);
  const [referralProgram, setReferralProgram] = useState<ReferralProgram | null>(null);
  const [groupOptions, setGroupOptions] = useState<GroupTravelOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all features data
  const loadFeatures = useCallback(async () => {
    try {
      setLoading(true);
      const [
        rules, 
        tiers, 
        program, 
        options
      ] = await Promise.all([
        featureService.getPricingRules(),
        featureService.getLoyaltyTiers(),
        featureService.getReferralProgram(),
        featureService.getGroupTravelOptions(),
      ]);

      setPricingRules(rules);
      setLoyaltyTiers(tiers);
      setReferralProgram(program);
      setGroupOptions(options);

      if (userId) {
        const loyalty = await featureService.getUserLoyalty(userId);
        setUserLoyalty(loyalty);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load features');
      console.error('Error loading features:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Calculate dynamic price
  const calculateDynamicPrice = useCallback(async (basePrice: number, routeId: string, travelTime: Date) => {
    try {
      return await featureService.calculateDynamicPrice(basePrice, routeId, travelTime);
    } catch (err) {
      console.error('Error calculating dynamic price:', err);
      return basePrice; // Fallback to base price on error
    }
  }, []);

  // Add loyalty points
  const addLoyaltyPoints = useCallback(async (points: number) => {
    if (!userId) return null;
    
    try {
      const updatedLoyalty = await featureService.addLoyaltyPoints(userId, points);
      setUserLoyalty(updatedLoyalty);
      return updatedLoyalty;
    } catch (err) {
      console.error('Error adding loyalty points:', err);
      return null;
    }
  }, [userId]);

  // Process referral
  const processReferral = useCallback(async (refereeId: string) => {
    if (!userId) return null;
    
    try {
      return await featureService.processReferral(userId, refereeId);
    } catch (err) {
      console.error('Error processing referral:', err);
      return null;
    }
  }, [userId]);

  // Create group booking
  const createGroupBooking = useCallback(async (booking: Omit<GroupBookingRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    try {
      return await featureService.createGroupBooking(booking);
    } catch (err) {
      console.error('Error creating group booking:', err);
      throw err;
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  return {
    // State
    pricingRules,
    loyaltyTiers,
    userLoyalty,
    referralProgram,
    groupOptions,
    loading,
    error,
    
    // Methods
    calculateDynamicPrice,
    addLoyaltyPoints,
    processReferral,
    createGroupBooking,
    refresh: loadFeatures,
  };
}
