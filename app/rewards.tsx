import React from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft, Award, Gift, ChevronRight, Ticket, Coffee, ShoppingBag } from "lucide-react-native";
import Colors from "@/constants/colors";
import { userProfile } from "@/constants/mockData";

const RewardCard = ({ icon, title, points, description, onPress }: any) => (
  <TouchableOpacity style={styles.rewardCard} onPress={onPress}>
    <View style={styles.rewardHeader}>
      <View style={styles.rewardIconContainer}>
        {icon}
      </View>
      <View style={styles.rewardInfo}>
        <Text style={styles.rewardTitle}>{title}</Text>
        <Text style={styles.rewardDescription}>{description}</Text>
      </View>
      <ChevronRight size={20} color={Colors.textLight} />
    </View>
    
    <View style={styles.rewardFooter}>
      <Text style={styles.pointsRequired}>{points} points</Text>
      <TouchableOpacity style={styles.redeemButton}>
        <Text style={styles.redeemButtonText}>Redeem</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

export default function RewardsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen 
        options={{
          title: "Rewards & Points",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.pointsCard}>
          <View style={styles.pointsHeader}>
            <Award size={28} color={Colors.primary} />
            <Text style={styles.pointsTitle}>Sheger Points</Text>
          </View>
          
          <Text style={styles.pointsValue}>{userProfile.points}</Text>
          
          <View style={styles.levelInfo}>
            <Text style={styles.levelText}>Current Level: {userProfile.level}</Text>
            <Text style={styles.nextLevelText}>150 more points to Gold</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "70%" }]} />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>Silver</Text>
              <Text style={styles.progressLabel}>Gold</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.earnSection}>
          <Text style={styles.sectionTitle}>Ways to Earn</Text>
          
          <View style={styles.earnCard}>
            <View style={styles.earnItem}>
              <View style={[styles.earnIcon, { backgroundColor: Colors.primary + "20" }]}>
                <Award size={20} color={Colors.primary} />
              </View>
              <View style={styles.earnInfo}>
                <Text style={styles.earnTitle}>Complete a Trip</Text>
                <Text style={styles.earnPoints}>+10 points</Text>
              </View>
            </View>
            
            <View style={styles.earnItem}>
              <View style={[styles.earnIcon, { backgroundColor: Colors.secondary + "20" }]}>
                <Gift size={20} color={Colors.secondary} />
              </View>
              <View style={styles.earnInfo}>
                <Text style={styles.earnTitle}>Refer a Friend</Text>
                <Text style={styles.earnPoints}>+50 points</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All Ways to Earn</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.rewardsSection}>
          <Text style={styles.sectionTitle}>Available Rewards</Text>
          
          <RewardCard
            icon={<Ticket size={24} color={Colors.primary} />}
            title="Free Ride"
            points="200"
            description="Get a free ride up to 50 ETB"
            onPress={() => {}}
          />
          
          <RewardCard
            icon={<Coffee size={24} color={Colors.primary} />}
            title="Coffee Voucher"
            points="100"
            description="Free coffee at Tomoca Coffee"
            onPress={() => {}}
          />
          
          <RewardCard
            icon={<ShoppingBag size={24} color={Colors.primary} />}
            title="Shopping Discount"
            points="300"
            description="15% off at Edna Mall shops"
            onPress={() => {}}
          />
        </View>
        
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Points History</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.historyCard}>
            <View style={styles.historyItem}>
              <View style={styles.historyInfo}>
                <Text style={styles.historyTitle}>Completed Trip</Text>
                <Text style={styles.historyDate}>Today, 10:30 AM</Text>
              </View>
              <Text style={styles.historyPoints}>+10</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.historyItem}>
              <View style={styles.historyInfo}>
                <Text style={styles.historyTitle}>Redeemed Free Ride</Text>
                <Text style={styles.historyDate}>Yesterday, 2:15 PM</Text>
              </View>
              <Text style={[styles.historyPoints, styles.negativePoints]}>-200</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.historyItem}>
              <View style={styles.historyInfo}>
                <Text style={styles.historyTitle}>Referred Kebede T.</Text>
                <Text style={styles.historyDate}>May 20, 2025</Text>
              </View>
              <Text style={styles.historyPoints}>+50</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  pointsCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pointsHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  pointsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginLeft: 8,
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 12,
  },
  levelInfo: {
    marginTop: 8,
  },
  levelText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
  },
  nextLevelText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  earnSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  earnCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  earnItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  earnIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  earnInfo: {
    flex: 1,
    marginLeft: 12,
  },
  earnTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
  },
  earnPoints: {
    fontSize: 14,
    color: Colors.success,
    marginTop: 2,
  },
  viewAllButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  rewardsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  rewardCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rewardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  rewardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  rewardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  rewardDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  rewardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  pointsRequired: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  redeemButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  redeemButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  historySection: {
    marginTop: 24,
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  historyCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.text,
  },
  historyDate: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 2,
  },
  historyPoints: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.success,
  },
  negativePoints: {
    color: Colors.danger,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
});
