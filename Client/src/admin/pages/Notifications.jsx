import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  BellRing, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Settings,
  Send,
  Trash2,
  Check,
  Filter,
  Calendar,
  User,
  Shield,
  Activity,
  HardDrive,
  ChevronDown,
  ChevronUp,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import { notificationsApi } from '../services/notificationsApi';
import NotificationPreferencesModal from '../components/NotificationPreferencesModal';
import GlobalNotificationComposer from '../components/GlobalNotificationComposer';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    type: '',
    dateRange: '30days',
    unreadOnly: false
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showGlobalComposer, setShowGlobalComposer] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      };
      
      const response = await notificationsApi.getNotifications(params);
      
      if (!response.data) {
        toast.error('Failed to load notifications');
        return;
      }
      
      const data = response.data.data;
      
      setNotifications(data.notifications || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0
      }));
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  // Fetch stats and categories
  const fetchStatsAndCategories = useCallback(async () => {
    try {
      const [statsResponse, categoriesResponse] = await Promise.all([
        notificationsApi.getStats(),
        notificationsApi.getCategories()
      ]);

      if (statsResponse.data?.data) {
        setStats(statsResponse.data.data);
      }
      
      if (categoriesResponse.data?.data) {
        setCategories(categoriesResponse.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats and categories:', error);
    }
  }, []);

  // Handle successful global notification
  const handleGlobalNotificationSuccess = () => {
    fetchNotifications();
    fetchStatsAndCategories();
  };

  // Initial data fetch
  useEffect(() => {
    fetchNotifications();
    fetchStatsAndCategories();
  }, [fetchNotifications, fetchStatsAndCategories]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Mark as read
  const markAsRead = async (id) => {
    try {
      const response = await notificationsApi.markAsRead(id);
      
      if (!response.data) {
        toast.error('Failed to mark as read');
        return;
      }
      
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, readBy: [...(n.readBy || []), 'current-admin'] } : n
      ));
      
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await notificationsApi.markAllAsRead(filters);
      
      if (!response.data) {
        toast.error('Failed to mark all as read');
        return;
      }
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ 
        ...n, 
        readBy: [...(n.readBy || []), 'current-admin'] 
      })));
      
      toast.success(`Marked ${response.data?.updatedCount || 'all'} notifications as read`);
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    if (!confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      const response = await notificationsApi.delete(id);
      
      if (!response.data) {
        toast.error('Failed to delete notification');
        return;
      }
      
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  // Toggle selection
  const toggleSelection = (id) => {
    const newSelection = new Set(selectedNotifications);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedNotifications(newSelection);
  };

  // Select all visible
  const selectAllVisible = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.map(n => n.id)));
    }
  };

  // Get priority icon and color
  const getPriorityInfo = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' };
      case 'HIGH':
        return { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' };
      case 'MEDIUM':
        return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' };
      case 'LOW':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' };
      default:
        return { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'system_alerts':
        return AlertTriangle;
      case 'user_management':
        return User;
      case 'security_events':
        return Shield;
      case 'admin_actions':
        return Settings;
      case 'system_health':
        return Activity;
      case 'global':
        return BellRing;
      default:
        return Bell;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-1">Manage and monitor system notifications</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowGlobalComposer(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
                Send Global
              </button>
              <button
                onClick={() => setShowPreferences(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors shadow-sm"
              >
                <Settings className="w-4 h-4" />
                Preferences
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Notifications</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">All time records</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Unread</p>
                  <p className="text-3xl font-bold text-orange-600">{stats?.unread || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Requires attention</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Recent Activity</p>
                  <p className="text-3xl font-bold text-green-600">{stats?.recentActivity || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Categories</p>
                  <p className="text-3xl font-bold text-purple-600">{categories?.length || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Active categories</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Filter className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Filter Notifications</h2>
            <p className="text-sm text-gray-500">Refine your notification search with specific criteria</p>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {selectedNotifications.size > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg">
                  <span className="text-sm font-medium">{selectedNotifications.size} selected</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {selectedNotifications.size > 0 && (
                <>
                  <button
                    onClick={() => {
                      selectedNotifications.forEach(id => markAsRead(id));
                      setSelectedNotifications(new Set());
                    }}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Mark Selected as Read
                  </button>
                  <button
                    onClick={() => {
                      selectedNotifications.forEach(id => deleteNotification(id));
                      setSelectedNotifications(new Set());
                    }}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                  >
                    Delete Selected
                  </button>
                </>
              )}
              <button
                onClick={markAllAsRead}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Mark All as Read
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.category} value={cat.category}>
                    {cat.category.replace('_', ' ').charAt(0).toUpperCase() + cat.category.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.unreadOnly}
                  onChange={(e) => handleFilterChange('unreadOnly', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Unread only</span>
              </label>
              <button
                onClick={() => setFilters({
                  category: '',
                  priority: '',
                  type: '',
                  dateRange: '30days',
                  unreadOnly: false
                })}
                className="mt-2 w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{notifications.length}</span> of <span className="font-medium text-gray-900">{pagination.total}</span> notifications
            </div>
            <div className="text-sm text-gray-500">
              Page <span className="font-medium text-gray-900">{pagination.page}</span> of <span className="font-medium text-gray-900">{pagination.totalPages}</span>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {Object.values(filters).some(v => (typeof v === 'boolean' ? v : v !== '')) 
                ? 'Try adjusting your filters to find the notifications you\'re looking for.' 
                : 'No notifications have been created yet. Check back later for system activity.'}
            </p>
          </div>
        ) : (
          <>
            {/* Header with select all */}
            <div className="bg-white rounded-xl border border-gray-200 mb-4">
              <div className="px-6 py-4 border-b border-gray-200">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.size === notifications.length}
                    onChange={selectAllVisible}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Select all ({notifications.length})</span>
                </label>
              </div>

              {/* Notifications */}
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const PriorityIcon = getPriorityInfo(notification.priority).icon;
                  const CategoryIcon = getCategoryIcon(notification.category);
                  const priorityInfo = getPriorityInfo(notification.priority);
                  const isSelected = selectedNotifications.has(notification.id);
                  const isRead = notification.readBy && notification.readBy.length > 0;

                  return (
                    <div
                      key={notification.id}
                      className={`px-6 py-4 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''} ${!isRead ? 'border-l-4 border-blue-500' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelection(notification.id)}
                          className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-lg ${priorityInfo.bg} ${priorityInfo.border} flex items-center justify-center`}>
                            <PriorityIcon className={`w-5 h-5 ${priorityInfo.color}`} />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <CategoryIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              {notification.category.replace('_', ' ')}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${priorityInfo.bg} ${priorityInfo.color}`}>
                              {notification.priority}
                            </span>
                            {isRead && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {notification.title}
                          </h3>
                          
                          <p className="text-gray-600 mb-3 leading-relaxed">
                            {notification.message}
                          </p>

                          {notification.details && Object.keys(notification.details).length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                              <div className="text-sm text-gray-600">
                                {Object.entries(notification.details).slice(0, 2).map(([key, value]) => (
                                  <span key={key} className="mr-4">
                                    <strong className="text-gray-700">{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="font-medium">{formatDate(notification.createdAt)}</span>
                              {notification.creator && (
                                <span>by <span className="font-medium text-gray-700">{notification.creator.name}</span></span>
                              )}
                              <span className="capitalize font-medium">{notification.source}</span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {notification.actionLink && (
                                <a
                                  href={notification.actionLink}
                                  className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                                >
                                  View Details
                                </a>
                              )}
                              {!isRead && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                                >
                                  Mark as Read
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="inline-flex items-center text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pagination */}
            {pagination?.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </button>
                  
                  {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                    const pageNum = index + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 border text-sm font-medium transition-colors ${
                          pagination.page === pageNum
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <NotificationPreferencesModal
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />
      
      <GlobalNotificationComposer
        isOpen={showGlobalComposer}
        onClose={() => setShowGlobalComposer(false)}
        onSuccess={handleGlobalNotificationSuccess}
      />
    </div>
  );
};

export default Notifications;
