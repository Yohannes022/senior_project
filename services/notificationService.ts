import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { schedulePushNotification, registerForPushNotificationsAsync } from '@/utils/notifications';
import { userPreferenceService } from './userPreferenceService';

// Define the trigger type for date-based notifications
interface DateTrigger {
  type: 'date';
  date: number;
}

type NotificationTrigger = DateTrigger | Notifications.NotificationTriggerInput;

const NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';

interface TripNotification {
  tripId: string;
  routeId: string;
  stopId: string;
  scheduledTime: Date;
  notificationTime: Date;
  title: string;
  body: string;
  data?: Record<string, any>;
}

class NotificationService {
  private scheduledNotifications: Map<string, TripNotification> = new Map();
  private isInitialized = false;

  /**
   * Initialize the notification service
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return false;
      }

      // Register background task for iOS
      if (Platform.OS === 'ios') {
        await this.registerBackgroundTask();
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      return false;
    }
  }

  /**
   * Schedule a notification for a trip
   */
  async scheduleTripNotification(trip: {
    tripId: string;
    routeId: string;
    routeName: string;
    stopId: string;
    stopName: string;
    scheduledTime: Date;
    minutesBefore: number;
  }): Promise<void> {
    const notificationTime = new Date(trip.scheduledTime.getTime() - trip.minutesBefore * 60 * 1000);
    const now = new Date();
    
    // Don't schedule if the notification time is in the past
    if (notificationTime <= now) return;

    const notificationId = `trip-${trip.tripId}-${trip.stopId}-${trip.minutesBefore}`;
    
    const notification: TripNotification = {
      tripId: trip.tripId,
      routeId: trip.routeId,
      stopId: trip.stopId,
      scheduledTime: trip.scheduledTime,
      notificationTime,
      title: `🚌 ${trip.routeName} arriving soon`,
      body: `Your bus to ${trip.stopName} is arriving in ${trip.minutesBefore} minutes`,
      data: {
        type: 'trip-arrival',
        tripId: trip.tripId,
        routeId: trip.routeId,
        stopId: trip.stopId,
      },
    };

    // Cancel any existing notification for this trip and stop
    await this.cancelTripNotification(trip.tripId, trip.stopId);

    // Schedule the notification
    const notificationContent = {
      title: notification.title,
      body: notification.body,
      data: notification.data,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    };

    const trigger: DateTrigger = {
      type: 'date',
      date: notificationTime.getTime()
    };

    await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger: trigger as unknown as Notifications.NotificationTriggerInput,
    });

    // Store the notification
    this.scheduledNotifications.set(notificationId, notification);
    await this.saveScheduledNotifications();
  }

  /**
   * Schedule a delay notification
   */
  async scheduleDelayNotification(trip: {
    tripId: string;
    routeId: string;
    routeName: string;
    stopId: string;
    stopName: string;
    originalTime: Date;
    delayedTime: Date;
    delayMinutes: number;
  }): Promise<void> {
    const notificationId = `delay-${trip.tripId}-${trip.stopId}`;
    
    const notification: TripNotification = {
      tripId: trip.tripId,
      routeId: trip.routeId,
      stopId: trip.stopId,
      scheduledTime: trip.delayedTime,
      notificationTime: new Date(),
      title: `⚠️ ${trip.routeName} Delayed`,
      body: `Your bus to ${trip.stopName} is delayed by ${trip.delayMinutes} minutes`,
      data: {
        type: 'trip-delay',
        tripId: trip.tripId,
        routeId: trip.routeId,
        stopId: trip.stopId,
        delayMinutes: trip.delayMinutes,
      },
    };

    // Cancel any existing delay notification for this trip
    await this.cancelNotification(notificationId);

    // Schedule the notification
    await schedulePushNotification({
      title: notification.title,
      body: notification.body,
      data: notification.data,
    });

    // Store the notification
    this.scheduledNotifications.set(notificationId, notification);
    await this.saveScheduledNotifications();
  }

  /**
   * Cancel a specific notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    this.scheduledNotifications.delete(notificationId);
    await this.saveScheduledNotifications();
  }

  /**
   * Cancel all notifications for a trip
   */
  async cancelTripNotifications(tripId: string): Promise<void> {
    const toCancel = Array.from(this.scheduledNotifications.entries())
      .filter(([id]) => id.startsWith(`trip-${tripId}-`));
    
    await Promise.all(
      toCancel.map(async ([id]) => {
        await this.cancelNotification(id);
      })
    );
  }

  /**
   * Cancel a specific trip notification
   */
  async cancelTripNotification(tripId: string, stopId: string): Promise<void> {
    const notificationId = `trip-${tripId}-${stopId}`;
    const toCancel = Array.from(this.scheduledNotifications.keys())
      .filter(id => id.startsWith(notificationId));
    
    await Promise.all(
      toCancel.map(id => this.cancelNotification(id))
    );
  }

  /**
   * Get all scheduled notifications
   */
  getScheduledNotifications(): TripNotification[] {
    return Array.from(this.scheduledNotifications.values());
  }

  /**
   * Clear all scheduled notifications
   */
  async clearAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    this.scheduledNotifications.clear();
    await this.saveScheduledNotifications();
  }

  /**
   * Register background task for iOS
   */
  private async registerBackgroundTask(): Promise<void> {
    try {
      await Location.startLocationUpdatesAsync(NOTIFICATION_TASK, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 300, // 5 minutes
        distanceInterval: 100, // 100 meters
        showsBackgroundLocationIndicator: true,
      });
    } catch (error) {
      console.error('Error registering background task:', error);
    }
  }

  /**
   * Save scheduled notifications to storage
   */
  private async saveScheduledNotifications(): Promise<void> {
    try {
      const notifications = Array.from(this.scheduledNotifications.entries()).map(([id, notif]) => ({
        ...notif,
        scheduledTime: notif.scheduledTime.toISOString(),
        notificationTime: notif.notificationTime.toISOString(),
      }));
      
      await AsyncStorage.setItem('@scheduled_notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save scheduled notifications:', error);
    }
  }

  /**
   * Load scheduled notifications from storage
   */
  private async loadScheduledNotifications(): Promise<void> {
    try {
      const jsonValue = await AsyncStorage.getItem('@scheduled_notifications');
      if (!jsonValue) return;

      const notifications = JSON.parse(jsonValue) as Array<{
        id: string;
        tripId: string;
        routeId: string;
        stopId: string;
        scheduledTime: string;
        notificationTime: string;
        title: string;
        body: string;
        data?: Record<string, any>;
      }>;

      notifications.forEach(notif => {
        this.scheduledNotifications.set(notif.id, {
          ...notif,
          scheduledTime: new Date(notif.scheduledTime),
          notificationTime: new Date(notif.notificationTime),
        });
      });
    } catch (error) {
      console.error('Failed to load scheduled notifications:', error);
    }
  }
}

export const notificationService = new NotificationService();
