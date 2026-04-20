import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellRing, CheckCircle, X, ExternalLink } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { notificationsApi } from '../services/notificationsApi';
import { toast } from 'react-toastify';
import './NavbarNotifications.css';

const NavbarNotifications = () => {
  const { socket } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [animateBell, setAnimateBell] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch initial notification stats
  const fetchNotificationStats = async () => {
    try {
      const response = await notificationsApi.getStats();
      if (response.data?.data) {
        setUnreadCount(response.data.data.unread || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notification stats:', error);
    }
  };

  // Fetch recent notifications for dropdown
  const fetchRecentNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getNotifications({
        page: 1,
        limit: 5,
        unreadOnly: false
      });
      
      if (response.data?.data?.notifications) {
        setRecentNotifications(response.data.data.notifications);
      }
    } catch (error) {
      console.error('Failed to fetch recent notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle new notification from socket
  const handleNewNotification = (notification) => {
    // Only increase count if notification is unread
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
    
    setRecentNotifications(prev => [notification, ...prev.slice(0, 4)]);
    setAnimateBell(true);
    
    // Remove animation after 1 second
    setTimeout(() => setAnimateBell(false), 1000);
    
    // Show toast for high priority notifications
    if (notification.priority === 'CRITICAL' || notification.priority === 'HIGH') {
      toast.error(`${notification.title}: ${notification.message}`, {
        position: 'top-right',
        autoClose: 5000,
      });
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      // Find the notification to check if it was unread
      const notification = recentNotifications.find(n => n.id === notificationId);
      const wasUnread = !notification?.isRead;
      
      await notificationsApi.markAsRead(notificationId);
      setRecentNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      
      // Only decrease count if the notification was actually unread
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead({});
      setRecentNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MEDIUM': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'LOW': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Socket listener for new notifications
  useEffect(() => {
    if (socket) {
      console.log('NavbarNotifications: Socket connected, listening for admin_notification');
      socket.on('admin_notification', handleNewNotification);
      
      // Test connection
      socket.on('connect', () => {
        console.log('NavbarNotifications: Socket connected with ID:', socket.id);
      });
      
      socket.on('disconnect', () => {
        console.log('NavbarNotifications: Socket disconnected');
      });
      
      return () => {
        socket.off('admin_notification', handleNewNotification);
        socket.off('connect');
        socket.off('disconnect');
      };
    } else {
      console.log('NavbarNotifications: No socket available');
    }
  }, [socket]);

  // Initial data fetch and periodic refresh
  useEffect(() => {
    fetchNotificationStats();
    
    // Refresh unread count every 30 seconds
    const interval = setInterval(() => {
      fetchNotificationStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch recent notifications when dropdown opens
  useEffect(() => {
    if (dropdownOpen) {
      fetchRecentNotifications();
    }
  }, [dropdownOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
      >
        <Bell 
          className={`w-5 h-5 ${animateBell ? 'animate-bell' : ''}`} 
        />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className={`absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 ${
            animateBell ? 'animate-pulse' : ''
          }`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
              </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Priority Indicator */}
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.priority === 'CRITICAL' ? 'bg-red-500' :
                        notification.priority === 'HIGH' ? 'bg-orange-500' :
                        notification.priority === 'MEDIUM' ? 'bg-blue-500' :
                        'bg-green-500'
                      }`} />
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {notification.title}
                            </h4>
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(notification.priority)}`}>
                                {notification.priority}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatTime(notification.createdAt)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Mark as read"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {notification.actionLink && (
                              <a
                                href={notification.actionLink}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="View details"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <a
              href="/admin/notifications"
              className="block w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavbarNotifications;
