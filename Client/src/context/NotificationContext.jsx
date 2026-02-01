/**
 * NotificationContext
 * Manages notification state across the application
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationsApi } from '../services/api';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch notifications for current user
   */
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await notificationsApi.getMyNotifications();
      
      if (fetchError) {
        setError(fetchError);
        return;
      }
      
      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.isRead).length || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Mark a single notification as read
   */
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const { data, error: markError } = await notificationsApi.markAsRead(notificationId);
      
      if (markError) {
        console.error('Failed to mark notification as read:', markError);
        return false;
      }
      
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      const { data, error: markError } = await notificationsApi.markAllAsRead();
      
      if (markError) {
        console.error('Failed to mark all notifications as read:', markError);
        return false;
      }
      
      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      
      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      return false;
    }
  }, []);

  /**
   * Delete a notification
   */
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const { success, error: deleteError } = await notificationsApi.delete(notificationId);
      
      if (deleteError || !success) {
        console.error('Failed to delete notification:', deleteError);
        return false;
      }
      
      // Update local state
      const notification = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting notification:', err);
      return false;
    }
  }, [notifications]);

  /**
   * Refresh notifications (can be called after actions that trigger notifications)
   */
  const refresh = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
