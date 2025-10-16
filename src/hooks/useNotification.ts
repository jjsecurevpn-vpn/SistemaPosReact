import { useState, useCallback } from "react";
import type {
  NotificationData,
  NotificationType,
} from "../components/Notification";

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationData | null>(
    null
  );

  const showNotification = useCallback(
    (
      message: string,
      type: NotificationType = "info",
      duration: number = 3000
    ) => {
      setNotification({ message, type, duration });

      // Auto-hide after specified duration
      if (duration > 0) {
        setTimeout(() => {
          setNotification(null);
        }, duration);
      }
    },
    []
  );

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      showNotification(message, "success", duration);
    },
    [showNotification]
  );

  const showError = useCallback(
    (message: string, duration?: number) => {
      showNotification(message, "error", duration);
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      showNotification(message, "warning", duration);
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      showNotification(message, "info", duration);
    },
    [showNotification]
  );

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
