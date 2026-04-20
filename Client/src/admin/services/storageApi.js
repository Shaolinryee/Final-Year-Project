import api from '../../services/axiosInstance';

const storageApi = {
  // Analytics
  getAnalytics: async () => {
    try {
      const response = await api.get('/admin/storage/analytics');
      return response.data;
    } catch (error) {
      console.error('Storage API error:', error);
      return { success: false, message: error.message };
    }
  },

  // Files
  getFiles: async (params = {}) => {
    try {
      const response = await api.get('/admin/storage/files', { params });
      return response.data;
    } catch (error) {
      console.error('Storage API error:', error);
      return { success: false, message: error.message };
    }
  },

  getFile: async (id) => {
    try {
      const response = await api.get(`/admin/storage/files/${id}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  downloadFile: async (id) => {
    try {
      const response = await api.get(`/admin/storage/files/${id}/download`);
      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteFile: async (id) => {
    try {
      const response = await api.delete(`/admin/storage/files/${id}`);
      return response.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  bulkDeleteFiles: async (fileIds) => {
    try {
      const response = await api.post('/admin/storage/files/bulk-delete', { fileIds });
      return response.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

export default storageApi;
