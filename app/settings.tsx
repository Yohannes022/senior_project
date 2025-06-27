import React from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { ChevronRight, Bell, BellOff, Moon, Sun, Globe, Shield, HelpCircle, FileText, User, LogOut, ChevronLeft } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import Colors from "@/constants/colors";

// Define route paths as constants for better type safety
const ROUTES = {
  LANGUAGE: '/settings/language',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  LOGIN: '/login',
  NOTIFICATION_SETTINGS: '/notification-settings',
  EDIT_PROFILE: '/edit-profile',
  HELP: '/help',
  ABOUT: '/about',
  ADD_PAYMENT_METHOD: '/add-payment-method',
  SETTINGS: '/settings',
  HOME: '/',
} as const;

type AppRoute = typeof ROUTES[keyof typeof ROUTES];

type SettingsItem = {
  icon: React.ReactNode;
  title: string;
  type: 'toggle' | 'navigate' | 'button';
  value?: boolean;
  onPress?: () => void;
  onValueChange?: (value: boolean) => void;
  showChevron?: boolean;
  danger?: boolean;
};

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  // Type-safe navigation function
  const navigate = (path: AppRoute) => {
    // Use type assertion to any to bypass strict type checking
    // This is safe because we've defined all possible routes in ROUTES
    router.push(path as any);
  };
  
  // Navigation handlers with explicit types
  const goToEditProfile = () => navigate(ROUTES.EDIT_PROFILE);
  const goToHelp = () => navigate(ROUTES.HELP);
  const goToLanguageSettings = () => navigate(ROUTES.LANGUAGE);
  const goToPrivacy = () => navigate(ROUTES.PRIVACY);
  const goToTerms = () => navigate(ROUTES.TERMS);
  const goToNotificationSettings = () => navigate(ROUTES.NOTIFICATION_SETTINGS);
  const goToAbout = () => navigate(ROUTES.ABOUT);
  const goToAddPaymentMethod = () => navigate(ROUTES.ADD_PAYMENT_METHOD);
  const goToSettings = () => navigate(ROUTES.SETTINGS);
  const goToLogin = () => navigate(ROUTES.LOGIN);
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);
  const [locationServices, setLocationServices] = React.useState(true);

  const handleLogout = () => {
    // Show confirmation dialog before logging out
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Log Out", 
          onPress: () => {
            logout();
            router.replace("/login" as unknown as any);
          },
          style: "destructive"
        }
      ]
    );
  };

  // Remove redundant handlers since we're using direct navigation functions

  const settingsSections: { title?: string; data: SettingsItem[] }[] = [
    {
      title: "Preferences",
      data: [
        {
          icon: <Moon size={20} color={Colors.primary} />,
          title: "Dark Mode",
          type: 'toggle',
          value: darkMode,
          onValueChange: setDarkMode,
        },
        {
          icon: notifications ? 
            <Bell size={20} color={Colors.primary} /> : 
            <BellOff size={20} color={Colors.textLight} />,
          title: "Notifications",
          type: 'toggle',
          value: notifications,
          onValueChange: setNotifications,
        },
        {
          icon: <Globe size={20} color={Colors.primary} />,
          title: "Language",
          type: 'navigate',
          onPress: goToLanguageSettings,
          showChevron: true,
        },
      ],
    },
    {
      title: "Account",
      data: [
        {
          icon: <User size={20} color={Colors.primary} />,
          title: "Edit Profile",
          type: 'navigate',
          onPress: goToEditProfile,
          showChevron: true,
        },
        {
          icon: <Shield size={20} color={Colors.primary} />,
          title: "Privacy & Security",
          type: 'navigate',
          onPress: goToPrivacy,
          showChevron: true,
        },
      ],
    },
    {
      title: "About",
      data: [
        {
          icon: <HelpCircle size={20} color={Colors.primary} />,
          title: "Help & Support",
          type: 'navigate',
          onPress: goToHelp,
          showChevron: true,
        },
        {
          icon: <FileText size={20} color={Colors.primary} />,
          title: "Terms & Policies",
          type: 'navigate',
          onPress: goToTerms,
          showChevron: true,
        },
      ],
    },
    {
      data: [
        {
          icon: <LogOut size={20} color={Colors.danger} />,
          title: "Log Out",
          type: 'button',
          onPress: handleLogout,
          danger: true,
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingsItem, index: number) => {
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.settingItem,
          index === 0 && { borderTopWidth: 0 },
        ]}
        onPress={item.type === 'toggle' ? undefined : item.onPress}
        activeOpacity={item.type === 'toggle' ? 1 : 0.7}
      >
        <View style={styles.settingIconContainer}>
          {item.icon}
        </View>
        
        <Text style={[
          styles.settingTitle,
          item.danger && styles.dangerText,
        ]}>
          {item.title}
        </Text>
        
        <View style={styles.settingRightContent}>
          {item.type === 'toggle' && (
            <Switch
              value={item.value}
              onValueChange={item.onValueChange}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor="#fff"
            />
          )}
          
          {item.showChevron && (
            <ChevronRight size={20} color={Colors.textLight} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen 
        options={{
          title: "Settings",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: user?.avatar || "https://via.placeholder.com/100" }}
              style={styles.avatarImage}
            />
          </View>
          
          <View style={styles.userInfoContainer}>
            <Text style={styles.userNameText} numberOfLines={1}>
              {user?.name || 'User'}
            </Text>
            {user?.email ? (
              <Text style={styles.userEmailText} numberOfLines={1}>
                {user.email}
              </Text>
            ) : null}
          </View>
          
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={goToEditProfile}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
        
        {/* Settings Sections */}
        <View style={styles.settingsContainer}>
          {settingsSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              {section.title && (
                <Text style={styles.sectionTitle}>{section.title}</Text>
              )}
              
              <View style={styles.sectionContent}>
                {section.data.map((item, itemIndex) => (
                  <React.Fragment key={itemIndex}>
                    {renderSettingItem(item, itemIndex)}
                  </React.Fragment>
                ))}
              </View>
            </View>
          ))}
        </View>
        
        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Sheger Transit+ v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfoContainer: {
    flex: 1,
    marginLeft: 16,
  },
  userNameText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  userEmailText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 16,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  editProfileButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  editButtonText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(41, 98, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingTitle: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  settingRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dangerText: {
    color: Colors.danger,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  settingsContainer: {
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
});
