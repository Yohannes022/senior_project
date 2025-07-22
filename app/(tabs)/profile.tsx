import React from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, type RelativePathString } from 'expo-router';
import { MapPin, CreditCard, Award, Settings, Bell, HelpCircle, LogOut } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useAuth } from '@/contexts/AuthContext'; // Fix the syntax error by removing the curly brackets

type RouteWithGroups = 
  | `/(auth)/${string}`
  | `/(tabs)/${string}`
  | `/${string}`;

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
  | '/saved-places'
  | `saved-location/${string}`
  | `/(auth)/login`
  | `/(auth)/register`
  | `/(auth)/forgot-password`
  | `/(tabs)/profile`
  | `/(tabs)/map`
  | `/(tabs)/schedule`
  | `/(tabs)/profile/edit`
  | `/(tabs)/profile/settings`
  | `/(tabs)/profile/help`
  | `/(tabs)/profile/notifications`
  | `/(tabs)/profile/payment-methods`
  | `/(tabs)/profile/saved-places`
  | `/(tabs)/profile/trip-history`
  | `/(tabs)/profile/help`
  | `/(tabs)/profile/about`
  | `/(tabs)/profile/terms`
  | `/(tabs)/profile/privacy`
  | `/(tabs)/profile/contact`
  | `/(tabs)/profile/feedback`
  | `/(tabs)/profile/rate-app`
  | `/(tabs)/profile/share-app`
  | `/(tabs)/profile/invite-friends`
  | `/(tabs)/profile/support`
  | `/(tabs)/profile/faq`
  | `/(tabs)/profile/contact-support`
  | `/(tabs)/profile/report-issue`
  | `saved-location/${string}`;

interface ProfileMenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress: () => void;
}

const ProfileMenuItem = ({ icon, title, subtitle, rightElement, onPress }: ProfileMenuItemProps) => (
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
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  
  if (!user) {
    // Handle case where user is not logged in
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Please log in to view your profile</Text>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => {
            router.push('/(auth)/login' as RelativePathString);
          }}
        >
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleNavigation = (route: AppRoute) => {
    router.push(route as RelativePathString);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login' as RelativePathString);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  const handleEditProfile = () => {
    router.push('/edit-profile' as RelativePathString);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        
        <View style={styles.profileCard}>
          <Image
            source={{ 
              uri: user?.profilePicture || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
              cache: 'force-cache'
            }}
            style={styles.profileImage}
          />
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
            <Text style={styles.profilePhone}>{user?.phone || 'No phone number'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'No email'}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.pointsCard}
          onPress={() => handleNavigation('/rewards')}
        >
          <View style={styles.pointsInfo}>
            <Text style={styles.pointsValue}>0</Text>
            <Text style={styles.pointsLabel}>Sheger Points</Text>
          </View>
          
          <View style={styles.levelContainer}>
            <Text style={styles.levelLabel}>Current Level</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>1</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <View style={styles.menuSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saved Places</Text>
            <TouchableOpacity onPress={() => handleNavigation('/saved-places')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {/* Temporarily showing empty state for saved locations */}
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No saved locations yet</Text>
          </View>
          {/* Display saved locations if they exist */}
          {user?.savedLocations?.slice(0, 2).map((location) => (
            <ProfileMenuItem
              key={location.id}
              icon={<MapPin size={20} color={Colors.primary} />}
              title={location.name}
              subtitle={location.address}
              onPress={() => handleNavigation(`saved-location/${location.id}`)}
            />
          ))}
          
          {/* Show 'more places' if there are more than 2 saved locations */}
          {user?.savedLocations && user.savedLocations.length > 2 && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => handleNavigation('/saved-places')}
            >
              <Text style={styles.viewAllButtonText}>+{user.savedLocations.length - 2} more places</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <ProfileMenuItem
            icon={<CreditCard size={20} color={Colors.primary} />}
            title="Payment Methods"
            onPress={() => handleNavigation('/payment-methods')}
          />
          
          <ProfileMenuItem
            icon={<Award size={20} color={Colors.primary} />}
            title="Rewards"
            subtitle="Earn points on every ride"
            onPress={() => handleNavigation('/rewards')}
          />
          
          <ProfileMenuItem
            icon={<Bell size={20} color={Colors.primary} />}
            title="Notifications"
            onPress={() => handleNavigation('/notifications')}
          />
          
          <ProfileMenuItem
            icon={<Settings size={20} color={Colors.primary} />}
            title="Settings"
            onPress={() => handleNavigation('/settings')}
          />
          
          <ProfileMenuItem
            icon={<HelpCircle size={20} color={Colors.primary} />}
            title="Help & Support"
            onPress={() => handleNavigation('/help')}
          />
          
          <ProfileMenuItem
            icon={<LogOut size={20} color={Colors.danger} />}
            title="Logout"
            onPress={handleLogout}
          />
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Sheger Transit+ v1.0.0</Text>
          <Text style={styles.footerText}> 2025 Sheger Transit Authority</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  errorText: {
    color: Colors.text,
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyStateContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    color: Colors.textLight,
    fontSize: 14,
    textAlign: 'center',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    color: Colors.primary,
    fontSize: 14,
    fontFamily: 'outfit-medium',
  },
  viewAllButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 4,
  },
  viewAllButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontFamily: 'outfit-medium',
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
