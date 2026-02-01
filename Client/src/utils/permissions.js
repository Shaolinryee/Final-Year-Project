/**
 * Role-Based Permissions Utility
 * 
 * Centralized permission checking for the CollabWeb application.
 * 
 * ROLES:
 * - Owner: Full project control, manage members & roles, delete/archive project
 * - Admin: Create & edit tasks, invite members, manage assignments, view activity
 * - Member: View project & tasks, update assigned tasks only, add comments
 */

// Role hierarchy (higher index = more permissions)
export const ROLES = {
  MEMBER: "member",
  ADMIN: "admin",
  OWNER: "owner",
};

// Role hierarchy for comparison
const ROLE_HIERARCHY = {
  member: 1,
  admin: 2,
  owner: 3,
};

/**
 * Get the numeric level of a role for comparison
 */
export const getRoleLevel = (role) => {
  return ROLE_HIERARCHY[role?.toLowerCase()] || 0;
};

/**
 * Check if user has at least the required role level
 */
export const hasMinimumRole = (userRole, requiredRole) => {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
};

// ==================== PROJECT PERMISSIONS ====================

/**
 * Can manage project settings (edit name, description, key)
 * Owner + Admin
 */
export const canManageProject = (role) => {
  return hasMinimumRole(role, ROLES.ADMIN);
};

/**
 * Can view project settings page
 * Owner only
 */
export const canViewSettings = (role) => {
  return role?.toLowerCase() === ROLES.OWNER;
};

/**
 * Can delete the project
 * Owner only
 */
export const canDeleteProject = (role) => {
  return role?.toLowerCase() === ROLES.OWNER;
};

/**
 * Can archive the project
 * Owner only
 */
export const canArchiveProject = (role) => {
  return role?.toLowerCase() === ROLES.OWNER;
};

// ==================== MEMBER PERMISSIONS ====================

/**
 * Can invite new members to the project
 * Owner + Admin
 */
export const canInviteMembers = (role) => {
  return hasMinimumRole(role, ROLES.ADMIN);
};

/**
 * Can manage members (remove, change roles)
 * Owner + Admin (with restrictions)
 */
export const canManageMembers = (role) => {
  return hasMinimumRole(role, ROLES.ADMIN);
};

/**
 * Can change member roles
 * Owner only (Admin cannot change roles)
 */
export const canChangeRoles = (role) => {
  return role?.toLowerCase() === ROLES.OWNER;
};

/**
 * Can remove a specific member based on current user's role and target member's role
 * Owner: Can remove Admin + Member
 * Admin: Can remove Member only
 * Member: Cannot remove anyone
 */
export const canRemoveMember = (currentUserRole, targetMemberRole) => {
  const currentLevel = getRoleLevel(currentUserRole);
  const targetLevel = getRoleLevel(targetMemberRole);
  
  // Cannot remove yourself (handled separately)
  // Cannot remove someone with equal or higher role
  if (currentLevel <= targetLevel) return false;
  
  // Owner can remove anyone below them
  if (currentUserRole?.toLowerCase() === ROLES.OWNER) return true;
  
  // Admin can only remove members
  if (currentUserRole?.toLowerCase() === ROLES.ADMIN) {
    return targetMemberRole?.toLowerCase() === ROLES.MEMBER;
  }
  
  return false;
};

// ==================== TASK PERMISSIONS ====================

/**
 * Can create new tasks
 * Owner + Admin
 */
export const canCreateTask = (role) => {
  return hasMinimumRole(role, ROLES.ADMIN);
};

/**
 * Can edit any task (title, description, due date, priority)
 * Owner + Admin
 */
export const canEditAnyTask = (role) => {
  return hasMinimumRole(role, ROLES.ADMIN);
};

/**
 * Can delete any task
 * Owner + Admin
 */
export const canDeleteTask = (role) => {
  return hasMinimumRole(role, ROLES.ADMIN);
};

/**
 * Can assign/reassign tasks
 * Owner + Admin
 */
export const canAssignTasks = (role) => {
  return hasMinimumRole(role, ROLES.ADMIN);
};

/**
 * Can edit a specific task
 * Owner + Admin can edit any task
 * Member can only edit their own assigned tasks
 */
export const canEditTask = (role, task, currentUserId) => {
  // Owner and Admin can edit any task
  if (hasMinimumRole(role, ROLES.ADMIN)) return true;
  
  // Member can only edit tasks assigned to them
  if (role?.toLowerCase() === ROLES.MEMBER) {
    return task?.assignedToUserId === currentUserId;
  }
  
  return false;
};

/**
 * Can update task status
 * Owner + Admin can update any task
 * Member can only update their assigned tasks
 */
export const canUpdateTaskStatus = (role, task, currentUserId) => {
  // Owner and Admin can update any task
  if (hasMinimumRole(role, ROLES.ADMIN)) return true;
  
  // Member can only update tasks assigned to them
  if (role?.toLowerCase() === ROLES.MEMBER) {
    return task?.assignedToUserId === currentUserId;
  }
  
  return false;
};

// ==================== COMMENT & ATTACHMENT PERMISSIONS ====================

/**
 * Can add comments to tasks
 * All roles
 */
export const canAddComments = (role) => {
  return hasMinimumRole(role, ROLES.MEMBER);
};

/**
 * Can add attachments to tasks
 * All roles
 */
export const canAddAttachments = (role) => {
  return hasMinimumRole(role, ROLES.MEMBER);
};

/**
 * Can delete own comments
 * All roles (for their own comments)
 */
export const canDeleteOwnComment = (role, comment, currentUserId) => {
  return comment?.authorUserId === currentUserId;
};

// ==================== ACTIVITY PERMISSIONS ====================

/**
 * Can view activity feed
 * All roles
 */
export const canViewActivity = (role) => {
  return hasMinimumRole(role, ROLES.MEMBER);
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get user's role in a project from members list
 */
export const getUserRole = (members, userId) => {
  const membership = members?.find((m) => m.userId === userId);
  return membership?.role?.toLowerCase() || null;
};

/**
 * Check if user is the project owner
 */
export const isOwner = (role) => {
  return role?.toLowerCase() === ROLES.OWNER;
};

/**
 * Check if user is an admin
 */
export const isAdmin = (role) => {
  return role?.toLowerCase() === ROLES.ADMIN;
};

/**
 * Check if user is a member (basic role)
 */
export const isMember = (role) => {
  return role?.toLowerCase() === ROLES.MEMBER;
};

/**
 * Get a human-readable role label
 */
export const getRoleLabel = (role) => {
  const labels = {
    owner: "Owner",
    admin: "Admin",
    member: "Member",
  };
  return labels[role?.toLowerCase()] || "Unknown";
};

/**
 * Get all permissions for a role (useful for debugging or displaying)
 */
export const getRolePermissions = (role) => {
  return {
    // Project
    canViewSettings: canViewSettings(role),
    canManageProject: canManageProject(role),
    canDeleteProject: canDeleteProject(role),
    canArchiveProject: canArchiveProject(role),
    
    // Members
    canInviteMembers: canInviteMembers(role),
    canManageMembers: canManageMembers(role),
    canChangeRoles: canChangeRoles(role),
    
    // Tasks
    canCreateTask: canCreateTask(role),
    canEditAnyTask: canEditAnyTask(role),
    canDeleteTask: canDeleteTask(role),
    canAssignTasks: canAssignTasks(role),
    
    // Comments & Attachments
    canAddComments: canAddComments(role),
    canAddAttachments: canAddAttachments(role),
    
    // Activity
    canViewActivity: canViewActivity(role),
  };
};

export default {
  ROLES,
  getRoleLevel,
  hasMinimumRole,
  canManageProject,
  canViewSettings,
  canDeleteProject,
  canArchiveProject,
  canInviteMembers,
  canManageMembers,
  canChangeRoles,
  canRemoveMember,
  canCreateTask,
  canEditAnyTask,
  canDeleteTask,
  canAssignTasks,
  canEditTask,
  canUpdateTaskStatus,
  canAddComments,
  canAddAttachments,
  canDeleteOwnComment,
  canViewActivity,
  getUserRole,
  isOwner,
  isAdmin,
  isMember,
  getRoleLabel,
  getRolePermissions,
};
