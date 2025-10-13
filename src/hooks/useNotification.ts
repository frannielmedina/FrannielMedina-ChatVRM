import { useState, useCallback } from 'react';
import { NotificationType } from '@/components/NotificationToast';

type Notification = {
  id: string;
  message: string;
  type: NotificationType;
};

let notificationCallback: ((notification: Notification) => void) | null = null;

export const useNotification = () => {
  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const notification: Notification = {
      id: Date.now().toString(),
      message,
      type
    };

    if (notificationCallback) {
      notificationCallback(notification);
    }
  }, []);

  return { showNotification };
};

export const useNotificationContainer = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [...prev, notification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Set the global callback
  notificationCallback = addNotification;

  return { notifications, removeNotification };
};
