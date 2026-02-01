import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { X, CheckCheck, Loader2, Bell, Eye, ExternalLink } from 'lucide-react';
import { notificationsApi } from '../../services/api';
import { NOTIFICATION_TABS } from '../../services/mock/notifications.mock';
import { useNotifications } from '../../context/NotificationContext';
import NotificationItem from './NotificationItem';
import { groupNotificationsByDate } from './groupByDate';

const ITEMS_PER_PAGE = 20;

/**
 * Date group header component (Jira-style)
 */
const DateGroupHeader = ({ label }) => (
  <div className="sticky top-0 z-10 px-4 py-2 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
      {label}
    </span>
  </div>
);

/**
 * Skeleton loader for initial loading state
 */
const NotificationSkeleton = () => (
  <div className="px-4 py-3 flex items-start gap-3 animate-pulse">
    <div className="w-9 h-9 rounded-lg bg-slate-800" />
    <div className="flex-1 space-y-2">
      <div className="h-3 w-20 bg-slate-800 rounded" />
      <div className="h-4 w-full bg-slate-800 rounded" />
      <div className="h-4 w-3/4 bg-slate-800 rounded" />
    </div>
    <div className="w-6 h-3 bg-slate-800 rounded" />
  </div>
);

/**
 * NotificationsDrawer - Jira-style flyout panel
 * Features: Tabs, unread filter, date grouping, infinite scroll pagination
 */
const NotificationsDrawer = ({ isOpen, onClose }) => {
  const { refreshUnreadCount } = useNotifications();
  
  // State
  const [activeTab, setActiveTab] = useState(NOTIFICATION_TABS.DIRECT);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  
  // Refs
  const scrollContainerRef = useRef(null);
  const sentinelRef = useRef(null);
  
  /**
   * Fetch notifications with pagination
   */
  const fetchNotifications = useCallback(async (reset = false) => {
    if (loading) return;
    
    const currentOffset = reset ? 0 : offset;
    
    if (!reset && !hasMore) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await notificationsApi.getNotificationsPaginated({
        limit: ITEMS_PER_PAGE,
        offset: currentOffset,
        unreadOnly,
        tab: activeTab,
      });
      
      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }
      
      if (reset) {
        setNotifications(data.data);
      } else {
        setNotifications(prev => [...prev, ...data.data]);
      }
      
      setTotal(data.total);
      setHasMore(data.hasMore);
      setOffset(data.nextOffset);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [offset, hasMore, loading, unreadOnly, activeTab]);
  
  /**
   * Reset and fetch when filters change
   */
  useEffect(() => {
    if (isOpen) {
      setNotifications([]);
      setOffset(0);
      setHasMore(true);
      setInitialLoading(true);
      // Small delay to ensure state is reset
      setTimeout(() => fetchNotifications(true), 0);
    }
  }, [isOpen, activeTab, unreadOnly]);
  
  /**
   * IntersectionObserver for infinite scroll
   */
  useEffect(() => {
    if (!isOpen || initialLoading) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchNotifications(false);
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '100px',
        threshold: 0.1,
      }
    );
    
    const sentinel = sentinelRef.current;
    if (sentinel) {
      observer.observe(sentinel);
    }
    
    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [isOpen, hasMore, loading, initialLoading, fetchNotifications]);
  
  /**
   * Mark notification as read
   */
  const handleMarkAsRead = async (notificationId) => {
    const { error } = await notificationsApi.markAsRead(notificationId);
    
    if (!error) {
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      refreshUnreadCount();
    }
  };
  
  /**
   * Mark all as read
   */
  const handleMarkAllAsRead = async () => {
    const { error } = await notificationsApi.markAllAsRead();
    
    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      refreshUnreadCount();
      
      // If filtering by unread, clear the list
      if (unreadOnly) {
        setNotifications([]);
        setTotal(0);
      }
    }
  };
  
  /**
   * Handle backdrop click
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  /**
   * Handle escape key
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    return groupNotificationsByDate(notifications);
  }, [notifications]);
  
  if (!isOpen) return null;
  
  const unreadCount = notifications.filter(n => !n.read && !n.isRead).length;
  
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      onClick={handleBackdropClick}
    >
      {/* Dark overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />
      
      {/* Drawer panel */}
      <div
        className="relative w-full max-w-[460px] h-full bg-slate-900 shadow-2xl flex flex-col border-l border-slate-800"
        style={{ animation: 'slideInRight 0.25s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-slate-800">
          {/* Title row */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Bell className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">
                  Notifications
                </h2>
                {total > 0 && (
                  <p className="text-xs text-slate-500">
                    {total} total{unreadCount > 0 && ` · ${unreadCount} unread`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => window.open('/notifications', '_blank')}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                aria-label="Open in new tab"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                aria-label="Close notifications"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex px-4 gap-1">
            <button
              onClick={() => setActiveTab(NOTIFICATION_TABS.DIRECT)}
              className={`
                px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
                ${activeTab === NOTIFICATION_TABS.DIRECT
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
                }
              `}
            >
              Direct
            </button>
            <button
              onClick={() => setActiveTab(NOTIFICATION_TABS.WATCHING)}
              className={`
                px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
                ${activeTab === NOTIFICATION_TABS.WATCHING
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
                }
              `}
            >
              Watching
            </button>
          </div>
        </div>
        
        {/* Toolbar */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 bg-slate-800/50 border-b border-slate-800">
          {/* Unread toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <div className="relative">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 rounded-full bg-slate-700 peer-checked:bg-blue-600 transition-colors" />
              <div 
                className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4"
              />
            </div>
            <span className="text-sm text-slate-400 group-hover:text-slate-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              Only show unread
            </span>
          </label>
          
          {/* Mark all as read button */}
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
              ${unreadCount > 0
                ? 'text-blue-400 hover:bg-blue-500/10'
                : 'text-slate-600 cursor-not-allowed'
              }
            `}
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        </div>
        
        {/* Notifications list with scroll */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
        >
          {initialLoading ? (
            // Skeleton loading state
            <div className="divide-y divide-slate-800">
              {[...Array(5)].map((_, i) => (
                <NotificationSkeleton key={i} />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center h-64 text-center px-6">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-base font-medium text-slate-300 mb-1">
                {unreadOnly ? 'No unread notifications' : 'You\'re all caught up! 🎉'}
              </p>
              <p className="text-sm text-slate-500">
                {unreadOnly 
                  ? 'Try turning off the unread filter to see all notifications' 
                  : 'When you get notifications, they\'ll show up here'
                }
              </p>
            </div>
          ) : (
            // Grouped notification items
            <div>
              {/* TODAY */}
              {groupedNotifications.today.length > 0 && (
                <div>
                  <DateGroupHeader label="Today" />
                  <div className="divide-y divide-slate-800/50">
                    {groupedNotifications.today.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onClose={onClose}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* YESTERDAY */}
              {groupedNotifications.yesterday.length > 0 && (
                <div>
                  <DateGroupHeader label="Yesterday" />
                  <div className="divide-y divide-slate-800/50">
                    {groupedNotifications.yesterday.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onClose={onClose}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* OLDER */}
              {groupedNotifications.older.length > 0 && (
                <div>
                  <DateGroupHeader label="Older" />
                  <div className="divide-y divide-slate-800/50">
                    {groupedNotifications.older.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onClose={onClose}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Sentinel for infinite scroll */}
              <div ref={sentinelRef} className="h-1" />
              
              {/* Loading more indicator */}
              {loading && !initialLoading && (
                <div className="flex items-center justify-center py-4 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span className="text-sm text-slate-500">Loading more...</span>
                </div>
              )}
              
              {/* End of list indicator */}
              {!hasMore && notifications.length > 0 && (
                <div className="text-center py-6 border-t border-slate-800">
                  <p className="text-xs text-slate-500">You've reached the end</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default NotificationsDrawer;
