import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { NotificationData, NotificationType } from '../components/Notification';

interface NotificationContextType {
  notification: NotificationData | null;
  showNotification: (message: string, type?: NotificationType, duration?: number) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationData | null>(null);

  const showNotification = (
    message: string,
    type: NotificationType = 'info',
    duration: number = 3000
  ) => {
    setNotification({ message, type, duration });

    if (duration > 0) {
      setTimeout(() => {
        setNotification(null);
      }, duration);
    }
  };

  const hideNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ notification, showNotification, hideNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};