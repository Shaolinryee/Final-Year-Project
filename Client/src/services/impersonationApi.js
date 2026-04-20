import api from './axiosInstance';

export const impersonationApi = {
  // Start impersonating a user
  startImpersonation: async (userId, reason) => {
    const response = await api.post('/admin/impersonate', { userId, reason });
    return response.data;
  },

  // End current impersonation session
  endImpersonation: async (impersonationId) => {
    const response = await api.post('/admin/end-impersonation', { impersonationId });
    return response.data;
  },

  // Get impersonation logs
  getImpersonationLogs: async (page = 1, limit = 20) => {
    const response = await api.get(`/admin/impersonation-logs?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get current impersonation info
  getCurrentImpersonation: async (impersonationId) => {
    const response = await api.get(`/admin/current-impersonation?impersonationId=${impersonationId}`);
    return response.data;
  }
};
