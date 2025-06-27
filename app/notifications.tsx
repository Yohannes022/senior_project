import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, Bell, BellOff, Clock, Check, X, AlertTriangle, Info, ShoppingBag, Tag, CreditCard, MapPin } from "lucide-react-native";
import Colors from "@/constants/colors";


type NotificationItem = {
  id: string;
  type: 'success' | 'info' | 'warning' | 'promo' | 'payment' | 'trip';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: React.ReactNode;
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationItems, setNotificationItems] = useState<NotificationItem[]>([
    {
      id: '1',
      type: 'trip',
      title: 'Trip Completed',
      message: 'Your trip to Bole Road has been completed. Rate your experience!',
      time: '10 min ago',
      read: false,
      icon: <MapPin size={20} color={Colors.primary} />,
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment Received',
      message: 'Your payment of 150 ETB for your recent trip has been processed.',
      time: '1 hour ago',
      read: false,
      icon: <CreditCard size={20} color={Colors.success} />,
    },
    {
      id: '3',
      type: 'promo',
      title: 'Special Offer',
      message: 'Get 20% off your next ride with code: SHEGER20',
      time: '3 hours ago',
      read: true,
      icon: <Tag size={20} color={Colors.warning} />,
    },
    {
      id: '4',
      type: 'info',
      title: 'App Update',
      message: 'A new version of Sheger Transit+ is available. Update now for the latest features!',
      time: '1 day ago',
      read: true,
      icon: <Info size={20} color={Colors.info} />,
    },
    {
      id: '5',
      type: 'warning',
      title: 'Service Alert',
      message: 'Heavy traffic reported on your usual route. Consider alternative routes.',
      time: '2 days ago',
      read: true,
      icon: <AlertTriangle size={20} color={Colors.warning} />,
    },
  ]);

  const toggleNotification = (id: string) => {
    setNotificationItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, read: !item.read } : item
      )
    );
  };

  const markAllAsRead = () => {
    setNotificationItems(prevItems =>
      prevItems.map(item => ({
        ...item,
        read: true,
      }))
    );
  };

  const unreadCount = notificationItems.filter(item => !item.read).length;

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'success':
        return styles.successNotification;
      case 'warning':
        return styles.warningNotification;
      case 'error':
        return styles.errorNotification;
      case 'info':
        return styles.infoNotification;
      case 'promo':
        return styles.promoNotification;
      case 'payment':
        return styles.paymentNotification;
      case 'trip':
        return styles.tripNotification;
      default:
        return styles.defaultNotification;
    }
  };

  const NotificationItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification,
        getNotificationStyle(item.type),
      ]}
      onPress={() => toggleNotification(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.notificationIconContainer}>
        {item.icon}
      </View>
      
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.notificationTime}>{item.time}</Text>
        </View>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
      </View>
      
      {!item.read && (
        <View style={styles.unreadIndicator} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen 
        options={{
          title: "Notifications",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={markAllAsRead}>
              <Text style={styles.markAllReadText}>
                {unreadCount > 0 ? 'Mark all as read' : ''}
              </Text>
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.header}>
        <View style={styles.toggleContainer}>
          {notificationsEnabled ? (
            <Bell size={24} color={Colors.primary} />
          ) : (
            <BellOff size={24} color={Colors.textLight} />
          )}
          <Text style={styles.toggleLabel}>
            {notificationsEnabled ? 'Notifications are on' : 'Notifications are off'}
          </Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor="#fff"
            style={styles.toggleSwitch}
          />
        </View>
        
        <Text style={styles.sectionTitle}>
          {unreadCount > 0 ? `${unreadCount} Unread Notifications` : 'No unread notifications'}
        </Text>
      </View>
      
      {notificationsEnabled ? (
        <ScrollView style={styles.scrollView}>
          {notificationItems.length > 0 ? (
            <View style={styles.notificationsList}>
              {notificationItems.map((item) => (
                <NotificationItem key={item.id} item={item} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Bell size={64} color={Colors.textLight} style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptyText}>
                When you get notifications, they'll appear here
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.disabledState}>
          <BellOff size={80} color={Colors.textLight} style={styles.disabledIcon} />
          <Text style={styles.disabledTitle}>Notifications are turned off</Text>
          <Text style={styles.disabledText}>
            Turn on notifications to get important updates about your trips and account
          </Text>
          <TouchableOpacity 
            style={styles.enableButton}
            onPress={() => setNotificationsEnabled(true)}
          >
            <Text style={styles.enableButtonText}>Turn On Notifications</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Notification Settings Button */}
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={() => router.push('/notification-settings')}
      >
        <Text style={styles.settingsButtonText}>Notification Settings</Text>
        <ChevronRight size={20} color={Colors.primary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  markAllReadText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 16,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginLeft: 12,
  },
  toggleSwitch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  sectionTitle: {
    fontSize: 14,
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    opacity: 0.5,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  disabledState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  disabledIcon: {
    opacity: 0.3,
    marginBottom: 24,
  },
  disabledTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  disabledText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    maxWidth: 300,
  },
  enableButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  enableButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  notificationsList: {
    padding: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: Colors.card,
    position: 'relative',
    overflow: 'hidden',
  },
  unreadNotification: {
    backgroundColor: 'rgba(41, 98, 255, 0.05)',
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    paddingLeft: 13, // 16 - 3 to account for border
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(41, 98, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    alignSelf: 'center',
  },
  notificationContent: {
    flex: 1,
    marginRight: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: Colors.textLight,
  },
  notificationMessage: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 18,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  // Notification type styles
  successNotification: {},
  warningNotification: {},
  errorNotification: {},
  infoNotification: {},
  promoNotification: {},
  paymentNotification: {},
  tripNotification: {},
  defaultNotification: {},
  // Settings button at bottom
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.card,
  },
  settingsButtonText: {
    color: Colors.primary,
    fontWeight: '500',
    fontSize: 16,
  },
});
