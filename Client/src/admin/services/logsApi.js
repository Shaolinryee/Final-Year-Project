import api from '../../services/axiosInstance';

const logsApi = {
  // Get activity logs with filtering and pagination
  getLogs: async (params = {}) => {
    try {
      const response = await api.get('/admin/logs', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  },

  // Get specific log details
  getLogDetails: async (logId) => {
    try {
      const response = await api.get(`/admin/logs/${logId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching log details:', error);
      throw error;
    }
  },

  // Get analytics data for logs
  getAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/admin/logs/analytics', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  // Get list of users for filtering
  getLogUsers: async () => {
    try {
      const response = await api.get('/admin/logs/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching log users:', error);
      throw error;
    }
  },

  // Get list of actions for filtering
  getLogActions: async () => {
    try {
      const response = await api.get('/admin/logs/actions');
      return response.data;
    } catch (error) {
      console.error('Error fetching log actions:', error);
      throw error;
    }
  },

  // Get list of resources for filtering
  getLogResources: async () => {
    try {
      const response = await api.get('/admin/logs/resources');
      return response.data;
    } catch (error) {
      console.error('Error fetching log resources:', error);
      throw error;
    }
  },

  // Get list of categories for filtering
  getLogCategories: async () => {
    try {
      const response = await api.get('/admin/logs/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching log categories:', error);
      throw error;
    }
  },

  // Export logs data
  exportLogs: async (params = {}) => {
    try {
      const response = await api.get('/admin/logs/export', { 
        params,
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('Error exporting logs:', error);
      throw error;
    }
  },

  // Archive old logs
  archiveLogs: async (params = {}) => {
    try {
      const response = await api.post('/admin/logs/archive', params);
      return response.data;
    } catch (error) {
      console.error('Error archiving logs:', error);
      throw error;
    }
  },

  // Delete logs (bulk delete)
  deleteLogs: async (params = {}) => {
    try {
      const response = await api.delete('/admin/logs', { params });
      return response.data;
    } catch (error) {
      console.error('Error deleting logs:', error);
      throw error;
    }
  },

  // Update retention policy
  updateRetentionPolicy: async (policy) => {
    try {
      const response = await api.post('/admin/logs/retention-policy', policy);
      return response.data;
    } catch (error) {
      console.error('Error updating retention policy:', error);
      throw error;
    }
  },

  // Get retention policy
  getRetentionPolicy: async () => {
    try {
      const response = await api.get('/admin/logs/retention-policy');
      return response.data;
    } catch (error) {
      console.error('Error fetching retention policy:', error);
      throw error;
    }
  }
};

export default logsApi;
