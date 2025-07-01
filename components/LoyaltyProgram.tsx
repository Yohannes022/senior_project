import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useFeatures } from '@/hooks/useFeatures';
import { MaterialIcons } from '@expo/vector-icons';

export const LoyaltyProgram = ({ userId }: { userId: string }) => {
  const { 
    userLoyalty, 
    loyaltyTiers, 
    referralProgram, 
    loading, 
    error, 
    processReferral 
  } = useFeatures(userId);

  const currentTier = loyaltyTiers.find(tier => tier.name === userLoyalty?.currentTier) || {
    name: 'Bronze',
    discountPercentage: 0,
    benefits: []
  };

  const handleShareReferral = async () => {
    if (!userId) return;
    
    const message = `Join me on Sheger Transit! Use my referral code ${userId} to get ${referralProgram?.refereeBonus} bonus points on your first ride!`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback for devices without WhatsApp
        await Clipboard.setStringAsync(message);
        Alert.alert('Success', 'Referral link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing referral:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading loyalty program...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tierCard}>
        <Text style={styles.tierName}>{currentTier.name} Tier</Text>
        <Text style={styles.discount}>{currentTier.discountPercentage}% OFF all rides</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${userLoyalty ? (userLoyalty.points / (userLoyalty.pointsToNextTier || 100) * 100) : 0}%` 
                }
              ]} 
            />
          </View>
          <Text style={styles.pointsText}>
            {userLoyalty?.points || 0} / {userLoyalty?.pointsToNextTier || 100} points
          </Text>
        </View>

        <View style={styles.benefitsContainer}>
          <Text style={styles.sectionTitle}>Your Benefits:</Text>
          {currentTier.benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>
      </View>

      {referralProgram?.isActive && (
        <View style={styles.referralCard}>
          <Text style={styles.sectionTitle}>Invite Friends & Earn</Text>
          <Text style={styles.referralText}>
            Share your referral code and earn {referralProgram.referrerBonus} points 
            for every friend who completes {referralProgram.minRidesForReferee} ride(s).
          </Text>
          
          <TouchableOpacity 
            style={styles.referralButton}
            onPress={handleShareReferral}
          >
            <MaterialIcons name="share" size={20} color="white" />
            <Text style={styles.referralButtonText}>Share Your Referral Code</Text>
          </TouchableOpacity>
          
          <Text style={styles.referralCode}>{userId}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  tierCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tierName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  discount: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  pointsText: {
    textAlign: 'right',
    color: '#666',
    fontSize: 12,
  },
  benefitsContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    marginLeft: 8,
    color: '#555',
  },
  referralCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  referralText: {
    color: '#555',
    marginBottom: 16,
    lineHeight: 20,
  },
  referralButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  referralButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  referralCode: {
    textAlign: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    fontFamily: 'monospace',
    fontSize: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});
