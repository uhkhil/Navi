import VIForegroundService from '@voximplant/react-native-foreground-service';
import {Colors} from '../themes/Colors';

const createNotificationChannel = async () => {
  try {
    const channelConfig = {
      id: 'navigation',
      name: 'Navigation',
      description:
        'Shows direction to the user, keeps the location services on.',
      enableVibration: true,
    };
    await VIForegroundService.createNotificationChannel(channelConfig);
    sendNotification();
  } catch (error) {
    console.warn(error);
  }
};

const sendNotification = async (
  title = 'You are navigating!',
  message = 'Please do not close this notification',
  icon = 'ic-launcher',
) => {
  try {
    const notificationConfig = {
      channelId: 'navigation',
      id: 3456,
      title: title,
      text: message,
      icon,
      iconLarge: icon,
      color: Colors.secondary,
      colorized: true,
    };
    await VIForegroundService.startService(notificationConfig);
  } catch (e) {
    console.warn(e);
  }
};

const stopNotifications = async () => {
  try {
    await VIForegroundService.stopService();
  } catch (error) {
    console.warn(error);
  }
};

export const NotificationService = {
  createNotificationChannel,
  sendNotification,
  stopNotifications,
};
