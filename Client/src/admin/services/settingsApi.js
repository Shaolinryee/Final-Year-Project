import api from '../../services/axiosInstance';

const settingsApi = {
  // Get all system settings
  getSystemSettings: async (category = null) => {
    try {
      const params = category ? { category } : {};
      const response = await api.get('/admin/settings', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching system settings:', error);
      throw error;
    }
  },

  // Get system settings schema
  getSettingsSchema: async () => {
    try {
      const response = await api.get('/admin/settings/schema');
      return response.data;
    } catch (error) {
      console.error('Error fetching settings schema:', error);
      throw error;
    }
  },

  // Update a single system setting
  updateSystemSetting: async (key, value, type) => {
    try {
      const response = await api.put('/admin/settings', {
        key,
        value,
        type
      });
      return response.data;
    } catch (error) {
      console.error('Error updating system setting:', error);
      throw error;
    }
  },

  // Update multiple system settings
  updateMultipleSettings: async (settings) => {
    try {
      const response = await api.post('/admin/settings/bulk', { settings });
      return response.data;
    } catch (error) {
      console.error('Error updating multiple settings:', error);
      throw error;
    }
  },

  // Reset all settings to defaults
  resetSystemSettings: async () => {
    try {
      const response = await api.post('/admin/settings/reset');
      return response.data;
    } catch (error) {
      console.error('Error resetting system settings:', error);
      throw error;
    }
  },

  // Export settings configuration
  exportSettings: async () => {
    try {
      const response = await api.get('/admin/settings/export');
      return response.data;
    } catch (error) {
      console.error('Error exporting settings:', error);
      throw error;
    }
  },

  // Import settings configuration
  importSettings: async (configData) => {
    try {
      const response = await api.post('/admin/settings/import', { configData });
      return response.data;
    } catch (error) {
      console.error('Error importing settings:', error);
      throw error;
    }
  },

  // Get settings change history
  getSettingsHistory: async (page = 1, limit = 20) => {
    try {
      const response = await api.get('/admin/settings/history', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching settings history:', error);
      throw error;
    }
  }
};

export default settingsApi;
