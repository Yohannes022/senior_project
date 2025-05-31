import React from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MapPin, CreditCard, Award, Settings, Bell, HelpCircle, LogOut } from "lucide-react-native";
import Colors from "@/constants/colors";
import { userProfile } from "@/constants/mockData";

const ProfileMenuItem = ({ icon, title, subtitle, rightElement, onPress }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconContainer}>
      {icon}
    </View>
    
    <View style={styles.menuTextContainer}>
      <Text style={styles.menuTitle}>{title}</Text>
      {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
    </View>
    
    {rightElement}
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();

  // Define valid route names as a type
  type AppRoute = 
    | '/all-trips'
    | '/booking'
    | '/destination'
    | '/directions'
    | '/rewards'
    | '/search'
    | '/trip-details'
    | '/(tabs)/profile'
    | '/(tabs)/map'
    | '/(tabs)/schedule'
    | '/edit-profile'
    | '/payment-methods'
    | '/notifications'
    | '/settings'
    | '/help'
    | `/saved-location?id=${string}`;

  const handleNavigation = (route: AppRoute) => {
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        
        <View style={styles.profileCard}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop" }}
            style={styles.profileImage}
          />
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userProfile.name}</Text>
            <Text style={styles.profilePhone}>{userProfile.phone}</Text>
            <Text style={styles.profileEmail}>{userProfile.email}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleNavigation("/edit-profile")}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.pointsCard}
          onPress={() => handleNavigation("/rewards")}
        >
          <View style={styles.pointsInfo}>
            <Text style={styles.pointsValue}>{userProfile.points}</Text>
            <Text style={styles.pointsLabel}>Sheger Points</Text>
          </View>
          
          <View style={styles.levelContainer}>
            <Text style={styles.levelLabel}>Current Level</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{userProfile.level}</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Saved Places</Text>
          
          {userProfile.savedLocations.map((location) => (
            <ProfileMenuItem
              key={location.id}
              icon={<MapPin size={20} color={Colors.primary} />}
              title={location.name}
              subtitle={location.address}
              onPress={() => handleNavigation(`/saved-location?id=${location.id}`)}
            />
          ))}
        </View>
        
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <ProfileMenuItem
            icon={<CreditCard size={20} color={Colors.primary} />}
            title="Payment Methods"
            subtitle="Add or manage payment options"
            onPress={() => handleNavigation("/payment-methods")}
          />
          
          <ProfileMenuItem
            icon={<Award size={20} color={Colors.primary} />}
            title="Rewards & Points"
            subtitle="View your rewards history"
            rightElement={
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsBadgeText}>{userProfile.points}</Text>
              </View>
            }
            onPress={() => handleNavigation("/rewards")}
          />
          
          <ProfileMenuItem
            icon={<Bell size={20} color={Colors.primary} />}
            title="Notifications"
            subtitle="Manage your notification preferences"
            onPress={() => handleNavigation("/notifications")}
          />
          
          <ProfileMenuItem
            icon={<Settings size={20} color={Colors.primary} />}
            title="Settings"
            subtitle="App preferences and account settings"
            onPress={() => handleNavigation("/settings")}
          />
        </View>
        
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <ProfileMenuItem
            icon={<HelpCircle size={20} color={Colors.primary} />}
            title="Help Center"
            subtitle="Get help with your account or trips"
            onPress={() => handleNavigation("/help")}
          />
          
          <ProfileMenuItem
            icon={<LogOut size={20} color={Colors.danger} />}
            title="Sign Out"
            subtitle="Log out from your account"
            onPress={() => console.log("Sign out")}
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Sheger Transit+ v1.0.0</Text>
          <Text style={styles.footerText}>© 2025 Sheger Transit Authority</Text>
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  profilePhone: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary,
    borderRadius: 16,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  pointsCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pointsInfo: {
    alignItems: "center",
  },
  pointsValue: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
  },
  pointsLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  levelContainer: {
    alignItems: "center",
  },
  levelLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  levelBadge: {
    backgroundColor: Colors.secondaryLight + "40",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.secondary,
  },
  menuSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
  },
  menuSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  pointsBadge: {
    backgroundColor: Colors.primaryLight + "30",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  footer: {
    marginTop: 24,
    marginBottom: 40,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
});
