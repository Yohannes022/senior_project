import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,  // Show notifications as banners when app is in foreground
    shouldShowList: true,    // Show notifications in the notification center
  } as Notifications.NotificationBehavior),
});

/**
 * Register for push notifications
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.warn('Failed to get push token for push notification!');
    return null;
  }

  try {
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } catch (error) {
    console.error('Error getting push token:', error);
  }

  return token;
}

/**
 * Schedule a local notification
 */
export async function schedulePushNotification({
  title,
  body,
  data,
  seconds = 0,
}: {
  title: string;
  body: string;
  data?: Record<string, any>;
  seconds?: number;
}): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { ...data, date: new Date().toISOString() },
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: seconds > 0 
      ? { 
          type: 'timeInterval',
          seconds,
          repeats: false
        } 
      : null,
  } as Notifications.NotificationRequestInput);

  return notificationId;
}

/**
 * Cancel a scheduled notification
 */
export async function cancelScheduledNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Format time remaining in a human-readable format
 */
export function formatTimeRemaining(seconds: number): string {
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 1) return 'less than a minute';
  if (minutes === 1) return '1 minute';
  if (minutes < 60) return `${minutes} minutes`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 1) {
    return remainingMinutes > 0 
      ? `1 hour and ${remainingMinutes} minutes` 
      : '1 hour';
  }
  
  return remainingMinutes > 0
    ? `${hours} hours and ${remainingMinutes} minutes`
    : `${hours} hours`;
}

/**
 * Format arrival time message
 */
export function formatArrivalMessage(
  routeName: string,
  minutesUntilArrival: number,
  isDelayed: boolean = false
): { title: string; body: string } {
  if (minutesUntilArrival <= 0) {
    return {
      title: `🚌 ${routeName} is here!`,
      body: 'Your bus has arrived at the stop.',
    };
  }

  const timeStr = formatTimeRemaining(minutesUntilArrival * 60);
  
  if (isDelayed) {
    return {
      title: `⚠️ ${routeName} Delayed`,
      body: `Your bus is now arriving in ${timeStr} (delayed).`,
    };
  }

  return {
    title: `🚌 ${routeName} arriving soon`,
    body: `Your bus will arrive in ${timeStr}.`,
  };
}

/**
 * Handle notification response
 */
export function handleNotificationResponse(
  response: Notifications.NotificationResponse
): void {
  const { notification } = response;
  const { data } = notification.request.content;
  
  // Handle different notification types
  switch (data?.type) {
    case 'trip-arrival':
      // Handle trip arrival
      console.log('Trip arrival notification tapped', data);
      break;
      
    case 'trip-delay':
      // Handle trip delay
      console.log('Trip delay notification tapped', data);
      break;
      
    default:
      console.log('Notification tapped', data);
  }
}
