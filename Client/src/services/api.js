/**
 * API Service Wrapper
 * Thin wrapper around mock API functions for future Supabase migration
 */

import * as mockApi from "./mock/api.mock";

// ==================== PROJECT APIs ====================

export const projectsApi = {
  /**
   * Get all projects
   */
  getAll: async () => {
    try {
      const data = await mockApi.getProjects();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message || "Failed to fetch projects" };
    }
  },

  /**
   * Get project by ID
   */
  getById: async (projectId) => {
    try {
      const data = await mockApi.getProjectById(projectId);
      if (!data) {
        return { data: null, error: "Project not found" };
      }
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message || "Failed to fetch project" };
    }
  },

  /**
   * Create a new project
   */
  create: async (payload) => {
    try {
      const data = await mockApi.createProject(payload);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message || "Failed to create project" };
    }
  },

  /**
   * Update a project
   */
  update: async (projectId, payload) => {
    try {
      const data = await mockApi.updateProject(projectId, payload);
      if (!data) {
        return { data: null, error: "Project not found" };
      }
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message || "Failed to update project" };
    }
  },

  /**
   * Delete a project
   */
  delete: async (projectId) => {
    try {
      const success = await mockApi.deleteProject(projectId);
      if (!success) {
        return { success: false, error: "Project not found" };
      }
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message || "Failed to delete project" };
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
      const data = await mockApi.getProjectTasks(projectId);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message || "Failed to fetch tasks" };
    }
  },

  /**
   * Get task by ID
   */
  getById: async (taskId) => {
    try {
      const data = await mockApi.getTaskById(taskId);
      if (!data) {
        return { data: null, error: "Task not found" };
      }
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message || "Failed to fetch task" };
    }
  },

  /**
   * Create a new task
   */
  create: async (projectId, payload) => {
    try {
      const data = await mockApi.createTask(projectId, payload);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message || "Failed to create task" };
    }
  },

  /**
   * Update a task
   */
  update: async (taskId, payload) => {
    try {
      const data = await mockApi.updateTask(taskId, payload);
      if (!data) {
        return { data: null, error: "Task not found" };
      }
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message || "Failed to update task" };
    }
  },

  /**
   * Update task status
   */
  updateStatus: async (taskId, status) => {
    try {
      const data = await mockApi.updateTaskStatus(taskId, status);
      if (!data) {
        return { data: null, error: "Task not found" };
      }
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message || "Failed to update task status" };
    }
  },

  /**
   * Delete a task
   */
  delete: async (taskId) => {
    try {
      const success = await mockApi.deleteTask(taskId);
      if (!success) {
        return { success: false, error: "Task not found" };
      }
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message || "Failed to delete task" };
    }
  },

  /**
   * Assign a task to a user
   */
  assign: async (taskId, userId) => {
    try {
      const data = await mockApi.assignTask(taskId, userId);
      if (!data) {
        return { data: null, error: "Task not found" };
      }
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message || "Failed to assign task" };
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
      const data = await mockApi.getCurrentUser();
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message || "Failed to fetch current user" };
    }
  },

  /**
   * Get user by ID
   */
  getById: async (userId) => {
    try {
      const data = await mockApi.getUserById(userId);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message || "Failed to fetch user" };
    }
  },

  /**
   * Search users by name or email
   */
  search: async (query) => {
    try {
      const data = await mockApi.searchUsers(query);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message || "Failed to search users" };
    }
  },

  /**
   * Get multiple users by IDs
   */
  getByIds: async (userIds) => {
    try {
      const data = await mockApi.getUsersByIds(userIds);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message || "Failed to fetch users" };
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
      const data = await mockApi.getProjectMembers(projectId);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message || "Failed to fetch members" };
    }
  },

  /**
   * Add a member to a project
   */
  add: async (projectId, userId, role = "member") => {
    try {
      const data = await mockApi.addProjectMember(projectId, userId, role);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message || "Failed to add member" };
    }
  },

  /**
   * Update a member's role
   */
  updateRole: async (projectId, userId, role) => {
    try {
      const data = await mockApi.updateProjectMemberRole(projectId, userId, role);
      if (!data) {
        return { data: null, error: "Member not found" };
      }
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message || "Failed to update member role" };
    }
  },

  /**
   * Remove a member from a project
   */
  remove: async (projectId, userId) => {
    try {
      const success = await mockApi.removeProjectMember(projectId, userId);
      if (!success) {
        return { success: false, error: "Member not found" };
      }
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message || "Failed to remove member" };
    }
  },

  /**
   * Check if user is a project owner
   */
  isOwner: async (projectId, userId) => {
    try {
      const isOwner = await mockApi.isUserProjectOwner(projectId, userId);
      return { data: isOwner, error: null };
    } catch (error) {
      return { data: false, error: error.message };
    }
  },
};

// ==================== INVITATION APIs ====================

export const invitationsApi = {
  /**
   * Get project invitations
   */
  getByProject: async (projectId, status) => {
    try {
      const data = await mockApi.getProjectInvitations(projectId, status);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message || "Failed to fetch invitations" };
    }
  },

  /**
   * Create a project invitation
   */
  create: async (projectId, email, role = "member") => {
    try {
      const data = await mockApi.createProjectInvitation(projectId, email, role);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message || "Failed to create invitation" };
    }
  },

  /**
   * Accept an invitation
   */
  accept: async (invitationId) => {
    try {
      const data = await mockApi.acceptInvitation(invitationId);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message || "Failed to accept invitation" };
    }
  },

  /**
   * Decline an invitation
   */
  decline: async (invitationId) => {
    try {
      const data = await mockApi.declineInvitation(invitationId);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message || "Failed to decline invitation" };
    }
  },

  /**
   * Revoke an invitation
   */
  revoke: async (invitationId) => {
    try {
      const success = await mockApi.revokeInvitation(invitationId);
      if (!success) {
        return { success: false, error: "Invitation not found" };
      }
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error.message || "Failed to revoke invitation" };
    }
  },

  /**
   * Get pending invitations for current user
   */
  getPendingForUser: async (email) => {
    try {
      const data = await mockApi.getUserPendingInvitations(email);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message || "Failed to fetch invitations" };
    }
  },
};

// ==================== ACTIVITY APIs ====================

export const activityApi = {
  /**
   * Get project activity feed
   */
  getByProject: async (projectId, options = {}) => {
    try {
      const data = await mockApi.getProjectActivity(projectId, options);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message || "Failed to fetch activity" };
    }
  },

  /**
   * Log a new activity
   */
  log: async (projectId, actorUserId, type, meta = {}) => {
    try {
      const data = await mockApi.logActivity(projectId, actorUserId, type, meta);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message || "Failed to log activity" };
    }
  },
};

// Export utilities
export { generateProjectKey } from "./mock/api.mock";
