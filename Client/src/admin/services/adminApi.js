import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance for admin API
const adminApi = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header to all requests
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Forbidden - show permission error
      console.error('Access denied: insufficient permissions');
    }
    return Promise.reject(error);
  }
);

// Dashboard API
export const dashboardApi = {
  getStats: () => adminApi.get('/dashboard/stats'),
  getHealth: () => adminApi.get('/dashboard/health'),
};

// User Management API
export const userManagementApi = {
  getUsers: (params = {}) => adminApi.get('/users', { params }),
  getUserById: (id) => adminApi.get(`/users/${id}`),
  updateUser: (id, data) => adminApi.put(`/users/${id}`, data),
  suspendUser: (id, reason) => adminApi.post(`/users/${id}/suspend`, { reason }),
  unsuspendUser: (id) => adminApi.post(`/users/${id}/unsuspend`),
  toggleUserStatus: (id) => adminApi.patch(`/users/${id}/status`),
  deleteUser: (id) => adminApi.delete(`/users/${id}`),
  assignRole: (id, roleId) => adminApi.post(`/users/${id}/role`, { roleId }),
};

// Project Management API
export const projectManagementApi = {
  getProjects: (params = {}) => adminApi.get('/projects', { params }),
  getProjectPermissions: (projectId) => adminApi.get(`/projects/${projectId}/permissions`),
  updateProjectPermissions: (projectId, permissions) => adminApi.put(`/projects/${projectId}/permissions`, { permissions }),
  resetProjectPermissions: (projectId) => adminApi.post(`/projects/${projectId}/reset-permissions`),
};

// System Settings API
export const systemSettingsApi = {
  getSettings: (params = {}) => adminApi.get('/settings', { params }),
  updateSetting: (key, value, type) => adminApi.put('/settings', { key, value, type }),
  getSettingByKey: (key) => adminApi.get(`/settings/${key}`),
};

// Analytics API
export const analyticsApi = {
  getUserAnalytics: (params = {}) => adminApi.get('/analytics/users', { params }),
  getProjectAnalytics: (params = {}) => adminApi.get('/analytics/projects', { params }),
  getTaskAnalytics: (params = {}) => adminApi.get('/analytics/tasks', { params }),
  getCustomReport: (reportConfig) => adminApi.post('/analytics/reports', reportConfig),
  exportReport: (reportId, format) => adminApi.get(`/analytics/reports/${reportId}/export`, { 
    params: { format },
    responseType: 'blob'
  }),
};

// Activity Logs API
export const activityLogsApi = {
  getLogs: (params = {}) => adminApi.get('/logs', { params }),
  getLogById: (id) => adminApi.get(`/logs/${id}`),
  exportLogs: (params = {}) => adminApi.get('/logs/export', { 
    params,
    responseType: 'blob'
  }),
};

// Notifications API
export const notificationsApi = {
  getNotifications: (params = {}) => adminApi.get('/notifications', { params }),
  sendGlobalNotification: (data) => adminApi.post('/notifications/global', data),
  getEmailTemplates: () => adminApi.get('/notifications/templates'),
  updateEmailTemplate: (id, data) => adminApi.put(`/notifications/templates/${id}`, data),
  getDeliveryStats: () => adminApi.get('/notifications/stats'),
};

// Storage Management API
export const storageApi = {
  getStorageStats: () => adminApi.get('/storage/stats'),
  getFiles: (params = {}) => adminApi.get('/storage/files', { params }),
  deleteFile: (id) => adminApi.delete(`/storage/files/${id}`),
  compressFiles: (fileIds) => adminApi.post('/storage/compress', { fileIds }),
  cleanupStorage: () => adminApi.post('/storage/cleanup'),
};

// Admin Roles & Permissions API
export const rolesApi = {
  getRoles: () => adminApi.get('/roles'),
  getRoleById: (id) => adminApi.get(`/roles/${id}`),
  createRole: (data) => adminApi.post('/roles', data),
  updateRole: (id, data) => adminApi.put(`/roles/${id}`, data),
  deleteRole: (id) => adminApi.delete(`/roles/${id}`),
  getPermissions: () => adminApi.get('/permissions'),
  assignPermissions: (roleId, permissionIds) => adminApi.post(`/roles/${roleId}/permissions`, { permissionIds }),
};

// Admin Profile API
export const profileApi = {
  getProfile: () => adminApi.get('/profile/me'),
  updateProfile: (data) => adminApi.put('/profile/update', data),
  changePassword: (data) => adminApi.put('/profile/change-password', data),
  uploadProfilePhoto: (formData) => adminApi.post('/profile/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getLoginHistory: (params) => adminApi.get('/profile/login-history', { params }),
  getActiveSessions: () => adminApi.get('/profile/sessions'),
  revokeSession: (sessionId) => adminApi.delete(`/profile/sessions/${sessionId}`),
  enable2FA: () => adminApi.post('/profile/2fa/enable'),
  verify2FASetup: (data) => adminApi.post('/profile/2fa/verify', data),
};

export default adminApi;
