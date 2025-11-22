
import { Notification, NotificationType } from '../types';

type NotificationListener = (notification: Notification) => void;

class NotificationService {
  private listeners: NotificationListener[] = [];

  subscribe(listener: NotificationListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(message: string, type: NotificationType = 'info') {
    const notification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
    };
    this.listeners.forEach(listener => listener(notification));
  }
}

export const notificationService = new NotificationService();
