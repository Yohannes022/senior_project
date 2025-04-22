import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  User, 
  CreditCard, 
  MapPin, 
  Clock, 
  Settings, 
  Moon, 
  Bell, 
  HelpCircle, 
  LogOut,
  ChevronRight
} from 'lucide-react-native';
import theme from '@/constants/theme';
import useAppStore from '@/store/useAppStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function ProfileScreen() {
  const router = useRouter();
  const { 
    user, 
    isLoggedIn, 
    logout,
    isDarkMode,
    toggleDarkMode,
    rideHistory
  } = useAppStore();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          onPress: () => logout(),
          style: "destructive"
        }
      ]
    );
  };

  const renderProfileHeader = () => {
    if (isLoggedIn && user) {
      return (
        <View style={styles.profileHeader}>
          {user.profilePicture ? (
            <Image 
              source={{ uri: user.profilePicture }} 
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <User size={40} color="#FFFFFF" />
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.loginPrompt}>
        <Text style={styles.loginTitle}>Sign in to your account</Text>
        <Text style={styles.loginSubtitle}>
          Sign in to access your tickets, payment methods, and more.
        </Text>
        <Button 
          title="Sign In" 
          onPress={handleLogin}
          style={styles.loginButton}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Profile</Text>
        
        <Card style={styles.profileCard}>
          {renderProfileHeader()}
        </Card>

        {isLoggedIn && (
          <>
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Payment Methods</Text>
              {user?.paymentMethods && user.paymentMethods.length > 0 ? (
                user.paymentMethods.map((method, index) => (
                  <TouchableOpacity 
                    key={method.id}
                    style={[
                      styles.menuItem, 
                      index === user.paymentMethods.length - 1 && styles.lastMenuItem
                    ]}
                  >
                    <CreditCard size={20} color={theme.colors.primary} />
                    <View style={styles.menuItemTextContainer}>
                      <Text style={styles.menuItemText}>
                        {method.type === 'card' ? `•••• ${method.lastFour}` : method.type}
                      </Text>
                      {method.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <ChevronRight size={18} color={theme.colors.subtext} />
                  </TouchableOpacity>
                ))
              ) : (
                <TouchableOpacity style={styles.addPaymentButton}>
                  <Text style={styles.addPaymentText}>Add Payment Method</Text>
                </TouchableOpacity>
              )}
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Recent Trips</Text>
              {rideHistory.length > 0 ? (
                rideHistory.slice(0, 3).map((ride, index) => (
                  <TouchableOpacity 
                    key={ride.id}
                    style={[
                      styles.tripItem, 
                      index === Math.min(rideHistory.length, 3) - 1 && styles.lastMenuItem
                    ]}
                  >
                    <View style={styles.tripIconContainer}>
                      <Clock size={20} color="#FFFFFF" />
                    </View>
                    <View style={styles.tripTextContainer}>
                      <Text style={styles.tripDestination}>
                        {ride.route.segments[ride.route.segments.length - 1].to.name || 'Destination'}
                      </Text>
                      <Text style={styles.tripDate}>
                        {new Date(ride.date).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.tripPrice}>${ride.fare.toFixed(2)}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noTripsText}>No recent trips</Text>
              )}
              {rideHistory.length > 3 && (
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>View All Trips</Text>
                </TouchableOpacity>
              )}
            </Card>
          </>
        )}

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Settings size={20} color={theme.colors.primary} />
            <Text style={styles.menuItemText}>App Settings</Text>
            <ChevronRight size={18} color={theme.colors.subtext} />
          </TouchableOpacity>
          
          <View style={styles.menuItem}>
            <Moon size={20} color={theme.colors.primary} />
            <Text style={styles.menuItemText}>Dark Mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <TouchableOpacity style={styles.menuItem}>
            <Bell size={20} color={theme.colors.primary} />
            <Text style={styles.menuItemText}>Notifications</Text>
            <ChevronRight size={18} color={theme.colors.subtext} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.lastMenuItem}>
            <HelpCircle size={20} color={theme.colors.primary} />
            <Text style={styles.menuItemText}>Help & Support</Text>
            <ChevronRight size={18} color={theme.colors.subtext} />
          </TouchableOpacity>
        </Card>

        {isLoggedIn && (
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LogOut size={20} color={theme.colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  profileCard: {
    marginBottom: theme.spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  profileName: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  profileEmail: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.subtext,
    marginTop: 2,
  },
  editButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.highlight,
    borderRadius: theme.borderRadius.sm,
  },
  editButtonText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  loginPrompt: {
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  loginTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  loginSubtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.subtext,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  loginButton: {
    minWidth: 150,
  },
  sectionCard: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: theme.spacing.md,
  },
  menuItemText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  defaultBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  },
  defaultBadgeText: {
    fontSize: theme.fontSizes.xs,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  addPaymentButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  addPaymentText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  tripItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tripIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripTextContainer: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  tripDestination: {
    fontSize: theme.fontSizes.md,
    fontWeight: '500',
    color: theme.colors.text,
  },
  tripDate: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.subtext,
    marginTop: 2,
  },
  tripPrice: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  noTripsText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.subtext,
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
  },
  viewAllButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  logoutText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.error,
    fontWeight: '500',
    marginLeft: theme.spacing.sm,
  },
});