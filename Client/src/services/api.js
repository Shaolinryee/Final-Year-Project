/**
 * API Service Wrapper
 * Connected to custom Node.js/PostgreSQL backend
 */

import api from "./axiosInstance";

// ==================== PROJECT APIs ====================

export const projectsApi = {
  /**
   * Get all projects
   */
  getAll: async () => {
    try {
      const response = await api.get("/projects");
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to fetch projects" };
    }
  },

  /**
   * Get project by ID
   */
  getById: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to fetch project" };
    }
  },

  /**
   * Create a new project
   */
  create: async (payload) => {
    try {
      const response = await api.post("/projects", payload);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to create project" };
    }
  },

  /**
   * Update a project
   */
  update: async (projectId, payload) => {
    try {
      const response = await api.put(`/projects/${projectId}`, payload);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to update project" };
    }
  },

  /**
   * Delete a project
   */
  delete: async (projectId) => {
    try {
      await api.delete(`/projects/${projectId}`);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to delete project" };
    }
  },

  /**
   * Get project analytics
   */
  getAnalytics: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/analytics`);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to fetch analytics" };
    }
  },
};

// ==================== TASK APIs ====================

export const tasksApi = {
  /**
   * Get all tasks for a project
   */
  getByProject: async (projectId) => {
    try {
      const response = await api.get(`/tasks/project/${projectId}`);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to fetch tasks" };
    }
  },

  /**
   * Get task by ID
   */
  getById: async (taskId) => {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to fetch task" };
    }
  },

  /**
   * Create a new task
   */
  create: async (projectId, payload) => {
    try {
      const response = await api.post("/tasks", { ...payload, projectId });
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to create task" };
    }
  },

  /**
   * Update a task
   */
  update: async (taskId, payload) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, payload);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to update task" };
    }
  },

  /**
   * Update task status
   */
  updateStatus: async (taskId, status) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, { status });
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to update task status" };
    }
  },

  /**
   * Delete a task
   */
  delete: async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to delete task" };
    }
  },

  /**
   * Assign a task to a user
   */
  assign: async (taskId, userId) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, { assigneeId: userId });
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to assign task" };
    }
  },

  /**
   * Search and filter tasks
   */
  search: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await api.get(`/tasks/search/query?${query}`);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: [], error: error.response?.data?.message || "Failed to search tasks" };
    }
  },
};

// ==================== USER APIs ====================

export const usersApi = {
  /**
   * Get current logged-in user
   */
  getCurrent: async () => {
    try {
      const response = await api.get("/users/me");
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to fetch user" };
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (payload) => {
    try {
      const response = await api.put("/users/profile", payload);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to update profile" };
    }
  },

  /**
   * Search users by name or email
   */
  search: async (query) => {
    try {
      const response = await api.get(`/users/search?q=${query}`);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to search users" };
    }
  },
};

// ==================== PROJECT MEMBER APIs ====================

export const membersApi = {
  /**
   * Get project members
   */
  getByProject: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/members`);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to fetch members" };
    }
  },

  /**
   * Add member to project
   */
  add: async (projectId, userId, role = 'member') => {
    try {
      const response = await api.post(`/projects/${projectId}/members`, { userId, role });
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to add member" };
    }
  },

  /**
   * Update member role
   */
  updateRole: async (projectId, userId, role) => {
    try {
      const response = await api.put(`/projects/${projectId}/members/${userId}`, { role });
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to update member role" };
    }
  },

  /**
   * Remove member from project
   */
  remove: async (projectId, userId) => {
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to remove member" };
    }
  },
};

// ==================== ACTIVITY APIs ====================

export const activityApi = {
  /**
   * Get project activity feed
   */
  getByProject: async (projectId) => {
    try {
      const response = await api.get(`/activities/project/${projectId}`);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to fetch project activity" };
    }
  },

  /**
   * Get task activity history
   */
  getByTask: async (taskId) => {
    try {
      const response = await api.get(`/activities/task/${taskId}`);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to fetch task activity" };
    }
  },
};

// ==================== COMMENT APIs ====================

export const commentsApi = {
  /**
   * Get comments for a task
   */
  getByTask: async (taskId) => {
    try {
      const response = await api.get(`/tasks/${taskId}/comments`);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to fetch comments" };
    }
  },

  /**
   * Add a comment to a task
   */
  add: async (taskId, content) => {
    try {
      const response = await api.post(`/tasks/${taskId}/comments`, { text: content });
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to add comment" };
    }
  },

  /**
   * Delete a comment
   */
  delete: async (taskId, commentId) => {
    try {
      await api.delete(`/tasks/${taskId}/comments/${commentId}`);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to delete comment" };
    }
  },
};

// ==================== INVITATION APIs ====================

export const invitationsApi = {
  getByProject: async (projectId, status = "pending") => {
    try {
      const response = await api.get(`/invitations/project/${projectId}?status=${status}`);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to fetch invitations" };
    }
  },
  create: async (projectId, email, role = "member") => {
    try {
      const response = await api.post(`/invitations/project/${projectId}`, { email, role });
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to create invitation" };
    }
  },
  accept: async (invitationId) => {
    try {
      const response = await api.post(`/invitations/${invitationId}/accept`);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to accept invitation" };
    }
  },
  decline: async (invitationId) => {
    try {
      const response = await api.post(`/invitations/${invitationId}/decline`);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to decline invitation" };
    }
  },
  revoke: async (projectId, invitationId) => {
    try {
      await api.post(`/invitations/project/${projectId}/${invitationId}/revoke`);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to revoke invitation" };
    }
  },
  getPendingForUser: async () => {
    try {
      const response = await api.get("/invitations/me");
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to fetch pending invitations" };
    }
  },
};

// ==================== NOTIFICATION APIs ====================

export const notificationsApi = {
  getMyNotifications: async () => {
    try {
      const response = await api.get("/notifications/me");
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to fetch notifications" };
    }
  },
  getNotificationsPaginated: async (options = {}) => {
    try {
      const { limit = 20, offset = 0, unreadOnly = false, tab = "direct" } = options;
      const response = await api.get(`/notifications/paginated?limit=${limit}&offset=${offset}&unreadOnly=${unreadOnly}&tab=${tab}`);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to fetch paginated notifications" };
    }
  },
  getUnreadCount: async () => {
    try {
      const response = await api.get("/notifications/unread/count");
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: 0, error: error.response?.data?.message || "Failed to fetch unread count" };
    }
  },
  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to mark as read" };
    }
  },
  markAllAsRead: async () => {
    try {
      const response = await api.put("/notifications/read-all");
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: 0, error: error.response?.data?.message || "Failed to mark all as read" };
    }
  },
  delete: async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to delete notification" };
    }
  },
};

// ==================== ATTACHMENT APIs ====================

export const attachmentsApi = {
  /**
   * Get attachments for a task
   */
  getByTask: async (taskId) => {
    try {
      const response = await api.get(`/tasks/${taskId}/attachments`);
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to fetch attachments" };
    }
  },

  /**
   * Upload an attachment to a task
   */
  upload: async (taskId, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to upload attachment" };
    }
  },

  /**
   * Delete an attachment
   */
  delete: async (attachmentId) => {
    try {
      await api.delete(`/tasks/attachments/${attachmentId}`);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Failed to delete attachment" };
    }
  },
};

// ==================== AUTH APIs ====================

export const authApi = {
  /**
   * Register a new user
   */
  register: async (payload) => {
    try {
      const response = await api.post("/auth/register", payload);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Registration failed" };
    }
  },

  /**
   * Login user
   */
  login: async (payload) => {
    try {
      const response = await api.post("/auth/login", payload);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Login failed" };
    }
  },

  /**
   * Google Login / Registration
   */
  googleLogin: async (credential) => {
    try {
      const response = await api.post("/auth/google", { credential });
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Google authentication failed" };
    }
  },

  /**
   * Sign up with OTP
   */
  signUpWithOTP: async (email, name) => {
    try {
      const response = await api.post("/auth/signup-otp", { email, name });
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to send OTP" };
    }
  },

  /**
   * Verify OTP
   */
  verifyOTP: async (email, token) => {
    try {
      const response = await api.post("/auth/verify-otp", { email, token });
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "OTP verification failed" };
    }
  },

  /**
   * Reset Password
   */
  resetPassword: async (email) => {
    try {
      const response = await api.post("/auth/reset-password", { email });
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to send reset code" };
    }
  },

  /**
   * Verify Reset OTP
   */
  verifyResetOTP: async (email, token) => {
    try {
      const response = await api.post("/auth/verify-reset-otp", { email, token });
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "OTP verification failed" };
    }
  },

  /**
   * Update Password after reset
   */
  updatePasswordReset: async (email, password) => {
    try {
      const response = await api.post("/auth/update-password-reset", { email, password });
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: error.response?.data?.message || "Failed to update password" };
    }
  },
};

// ==================== UTILS ====================

export const generateProjectKey = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 3);
};
