import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { subscriptionService } from '@/services/subscriptionService';
import { useAuth } from '@/contexts/AuthContext';
import { SubscriptionPlan } from '@/types/subscription';

const SubscriptionScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setIsLoading(true);
      const [subscriptionPlans, userSubscription] = await Promise.all([
        subscriptionService.getSubscriptionPlans(),
        user ? subscriptionService.getUserSubscription(user.id) : Promise.resolve(null),
      ]);

      setPlans(subscriptionPlans);
      setCurrentPlan(userSubscription);
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      // Show login modal or redirect to login
      return;
    }

    try {
      setSelectedPlan(planId);
      // In a real app, you would integrate with a payment gateway here
      // For demo purposes, we'll simulate a successful payment
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const subscription = await subscriptionService.subscribeUser(user.id, planId);
      if (subscription) {
        setCurrentPlan(subscription);
        // Show success message
        alert('Subscription successful! Your pass is now active.');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setSelectedPlan(null);
    }
  };

  const renderPlanCard = (plan: SubscriptionPlan) => {
    const isCurrentPlan = currentPlan?.planId === plan.id && currentPlan?.isActive;
    const isPopular = plan.id === 'monthly';
    const isProcessing = selectedPlan === plan.id;
    
    return (
      <View 
        key={plan.id}
        style={[
          styles.planCard,
          { 
            backgroundColor: colors.card,
            borderColor: isPopular ? colors.primary : 'transparent',
            borderWidth: isPopular ? 1 : 0,
            shadowColor: isPopular ? colors.primary : '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isPopular ? 0.25 : 0.1,
            shadowRadius: isPopular ? 10 : 5,
            elevation: isPopular ? 5 : 2,
          },
        ]}
      >
        {isPopular && (
          <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.popularBadgeText}>POPULAR</Text>
          </View>
        )}
        
        <View style={styles.planHeader}>
          <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: colors.primary }]}>
              ETB {plan.price}
            </Text>
            <Text style={[styles.duration, { color: colors.text }]}>
              /{plan.duration} days
            </Text>
          </View>
          {plan.discount > 0 && (
            <Text style={[styles.discount, { color: colors.primary }]}>
              Save {plan.discount}%
            </Text>
          )}
        </View>
        
        <Text style={[styles.planDescription, { color: colors.text }]}>
          {plan.description}
        </Text>
        
        <View style={styles.featuresContainer}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <MaterialIcons 
                name="check-circle" 
                size={18} 
                color={colors.primary} 
                style={styles.featureIcon} 
              />
              <Text style={[styles.featureText, { color: colors.text }]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>
        
        {isCurrentPlan ? (
          <View style={[styles.subscribedButton, { backgroundColor: colors.background }]}>
            <Text style={[styles.subscribedButtonText, { color: colors.primary }]}>
              Current Plan
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.subscribeButton, { backgroundColor: colors.primary }]}
            onPress={() => handleSubscribe(plan.id)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.subscribeButtonText}>
                {currentPlan ? 'Switch Plan' : 'Subscribe Now'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading subscription plans...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Subscription Plans</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Choose the best plan that fits your travel needs
        </Text>
      </View>
      
      {currentPlan && (
        <View style={[styles.currentPlanBanner, { backgroundColor: colors.card }]}>
          <MaterialIcons 
            name="check-circle" 
            size={24} 
            color="#4CAF50" 
            style={styles.currentPlanIcon} 
          />
          <View style={styles.currentPlanInfo}>
            <Text style={[styles.currentPlanTitle, { color: colors.text }]}>
              {plans.find(p => p.id === currentPlan.planId)?.name || 'Current Plan'}
            </Text>
            <Text style={[styles.currentPlanExpiry, { color: colors.text }]}>
              Expires on {new Date(currentPlan.endDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
      )}
      
      <View style={styles.plansContainer}>
        {plans.map(plan => renderPlanCard(plan))}
      </View>
      
      <View style={[styles.faqSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.faqTitle, { color: colors.text }]}>
          Frequently Asked Questions
        </Text>
        
        <View style={styles.faqItem}>
          <Text style={[styles.faqQuestion, { color: colors.primary }]}>
            How do I use my subscription?
          </Text>
          <Text style={[styles.faqAnswer, { color: colors.text }]}>
            After subscribing, you'll receive a QR code in the app. Just show this code to the bus driver when boarding.
          </Text>
        </View>
        
        <View style={styles.faqItem}>
          <Text style={[styles.faqQuestion, { color: colors.primary }]}>
            Can I cancel my subscription?
          </Text>
          <Text style={[styles.faqAnswer, { color: colors.text }]}>
            Yes, you can cancel your subscription at any time. Your pass will remain active until the end of the current billing period.
          </Text>
        </View>
        
        <View style={styles.faqItem}>
          <Text style={[styles.faqQuestion, { color: colors.primary }]}>
            Is there a family plan available?
          </Text>
          <Text style={[styles.faqAnswer, { color: colors.text }]}>
            Currently, we only offer individual subscriptions. Each family member will need their own subscription.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  currentPlanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currentPlanIcon: {
    marginRight: 12,
  },
  currentPlanInfo: {
    flex: 1,
  },
  currentPlanTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  currentPlanExpiry: {
    fontSize: 14,
    opacity: 0.8,
  },
  plansContainer: {
    marginBottom: 32,
  },
  planCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 12,
  },
  popularBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 8,
  },
  duration: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  discount: {
    fontSize: 14,
    fontWeight: '600',
  },
  planDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 20,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  subscribeButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  subscribedButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  subscribedButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  faqSection: {
    borderRadius: 16,
    padding: 20,
  },
  faqTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 20,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
});

export default SubscriptionScreen;
