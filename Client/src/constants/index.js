/**
 * Application Constants
 */

export const NOTIFICATION_TYPES = {
  INVITE_RECEIVED: 'project_invite',
  INVITE_ACCEPTED: 'invite_accepted',
  PROJECT_ADDED: 'project_added',
  TASK_ASSIGNED: 'task_assigned',
  TASK_COMPLETED: 'task_completed',
  TASK_COMMENT: 'comment_added',
  TASK_STATUS_CHANGED: 'status_changed',
};

export const NOTIFICATION_TABS = {
  DIRECT: 'direct',
  WATCHING: 'watching',
};

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  IN_REVIEW: 'in-review',
  DONE: 'done',
};

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const PROJECT_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer',
};
