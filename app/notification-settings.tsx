import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft, Bell, BellOff, BellRing, Tag, CreditCard, MapPin } from "lucide-react-native";
import Colors from "@/constants/colors";

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [promoNotifications, setPromoNotifications] = useState(true);
  const [tripUpdates, setTripUpdates] = useState(true);
  const [paymentReminders, setPaymentReminders] = useState(true);
  const [serviceAlerts, setServiceAlerts] = useState(true);

  const toggleSwitch = (setter: React.Dispatch<React.SetStateAction<boolean>>, value: boolean) => {
    setter(!value);
  };

  const NotificationToggle = ({
    title,
    description,
    value,
    onValueChange,
    icon,
  }: {
    title: string;
    description: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    icon: React.ReactNode;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <View style={[styles.iconContainer, { backgroundColor: Colors.primaryLight }]}>
          {icon}
        </View>
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.inactive, true: Colors.primary }}
        thumbColor={Colors.card}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: "Notification Settings",
          headerTitleStyle: { color: Colors.primary },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
              <ChevronLeft size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          
          <NotificationToggle
            title="Push Notifications"
            description="Receive push notifications on your device"
            value={notificationsEnabled}
            onValueChange={(value) => setNotificationsEnabled(value)}
            icon={<Bell size={20} color={Colors.primary} />}
          />

          <NotificationToggle
            title="Email Notifications"
            description="Receive notifications via email"
            value={emailNotifications}
            onValueChange={(value) => setEmailNotifications(value)}
            icon={<BellRing size={20} color={Colors.primary} />}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          
          <NotificationToggle
            title="Promotions & Offers"
            description="Get updates on special offers and promotions"
            value={promoNotifications}
            onValueChange={(value) => setPromoNotifications(value)}
            icon={<Tag size={20} color={Colors.primary} />}
          />

          <NotificationToggle
            title="Trip Updates"
            description="Real-time updates about your trips"
            value={tripUpdates}
            onValueChange={(value) => setTripUpdates(value)}
            icon={<BellRing size={20} color={Colors.primary} />}
          />

          <NotificationToggle
            title="Payment Reminders"
            description="Reminders for upcoming payments"
            value={paymentReminders}
            onValueChange={(value) => setPaymentReminders(value)}
            icon={<CreditCard size={20} color={Colors.primary} />}
          />

          <NotificationToggle
            title="Service Alerts"
            description="Important service updates and alerts"
            value={serviceAlerts}
            onValueChange={(value) => setServiceAlerts(value)}
            icon={<MapPin size={20} color={Colors.primary} />}
          />
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.textLight,
  },
});
