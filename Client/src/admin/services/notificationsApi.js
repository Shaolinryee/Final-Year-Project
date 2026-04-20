import adminApi from './adminApi';

export const notificationsApi = {
  // Get admin notifications with filtering and pagination
  getNotifications: (params = {}) => {
    return adminApi.get('/notifications', { params });
  },

  // Get notification statistics
  getStats: () => {
    return adminApi.get('/notifications/stats');
  },

  // Get notification categories with counts
  getCategories: () => {
    return adminApi.get('/notifications/categories');
  },

  // Get admin notification preferences
  getPreferences: () => {
    return adminApi.get('/notifications/preferences');
  },

  // Update notification preferences
  updatePreferences: (data) => {
    return adminApi.put('/notifications/preferences', data);
  },

  // Send global notification
  sendGlobal: (data) => {
    return adminApi.post('/notifications/global', data);
  },

  // Mark notification as read
  markAsRead: (id) => {
    return adminApi.put(`/notifications/${id}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: (params = {}) => {
    return adminApi.put('/notifications/read-all', {}, { params });
  },

  // Delete notification
  delete: (id) => {
    return adminApi.delete(`/notifications/${id}`);
  },

  // Get notification templates
  getTemplates: (params = {}) => {
    return adminApi.get('/notifications/templates', { params });
  },

  // Get delivery statistics
  getDeliveryStats: (params = {}) => {
    return adminApi.get('/notifications/delivery-stats', { params });
  }
};
