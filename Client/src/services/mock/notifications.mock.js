/**
 * Mock Notifications Data Store
 * Stores in-app notifications for users
 * 
 * NOTIFICATION RULES:
 * - Never notify users about their own actions
 * - Project created → NO notification (activity only)
 * - Invitation sent → Notify invited user
 * - Invitation accepted → Notify project owner/admins
 * - Task assigned → Notify assignee (except self-assign)
 * - Comment added → Notify task assignee (except self-comment)
 * - Task status changed → Notify assignee
 */

// Notification types
export const NOTIFICATION_TYPES = {
  INVITE_RECEIVED: 'invite_received',
  INVITE_ACCEPTED: 'invite_accepted',
  TASK_ASSIGNED: 'task_assigned',
  TASK_COMMENT: 'task_comment',
  TASK_STATUS_CHANGED: 'task_status_changed',
};

// Notification categories (tabs)
export const NOTIFICATION_TABS = {
  DIRECT: 'direct',    // Personal notifications
  WATCHING: 'watching', // Subscribed/watching notifications
};

// Generate many seed notifications for testing infinite scroll
const generateSeedNotifications = () => {
  const notifications = [];
  const userId = 'user-3'; // Alice Brown - current test user
  
  const templates = [
    { type: NOTIFICATION_TYPES.INVITE_RECEIVED, title: 'Project Invitation', messageTemplate: '{user} invited you to join {project}', link: '/invitations' },
    { type: NOTIFICATION_TYPES.INVITE_ACCEPTED, title: 'Invitation Accepted', messageTemplate: '{user} accepted your invitation to {project}', link: '/projects/proj-1/members' },
    { type: NOTIFICATION_TYPES.TASK_ASSIGNED, title: 'Task Assigned', messageTemplate: '{user} assigned you to "{task}" in {project}', link: '/projects/proj-1/tasks/task-1' },
    { type: NOTIFICATION_TYPES.TASK_COMMENT, title: 'New Comment', messageTemplate: '{user} commented on "{task}": "{comment}"', link: '/projects/proj-1/tasks/task-1' },
    { type: NOTIFICATION_TYPES.TASK_STATUS_CHANGED, title: 'Status Changed', messageTemplate: '{user} moved "{task}" to {status}', link: '/projects/proj-1/tasks/task-1' },
  ];
  
  const projects = ['Marketing Campaign', 'Website Redesign', 'Mobile App v2', 'Q1 Planning', 'Bug Fixes Sprint', 'Product Launch', 'Customer Portal', 'API Integration'];
  const users = ['John Doe', 'Jane Smith', 'Bob Wilson', 'Carol Davis', 'Mike Johnson', 'Sarah Connor', 'Alex Kim', 'Emma Watson'];
  const tasks = ['Design homepage mockup', 'Implement login flow', 'Fix navigation bug', 'Update documentation', 'Review pull request', 'Create API endpoints', 'Write unit tests', 'Deploy to staging', 'Setup CI/CD pipeline', 'Configure monitoring', 'Optimize database queries', 'Add caching layer'];
  const statuses = ['In Progress', 'Done', 'In Review', 'Blocked', 'Ready for QA'];
  const comments = ['Looks good!', 'Can you review this?', 'I have some concerns...', 'Great progress!', 'Let\'s discuss in standup', 'Need more details here', 'Fixed!', 'LGTM 👍'];
  
  // Generate 120 notifications spread across today, yesterday, and older
  // Today: ~15 notifications (last 24 hours)
  // Yesterday: ~20 notifications
  // Older: ~85 notifications (past 2 weeks)
  
  const now = Date.now();
  const oneHour = 1000 * 60 * 60;
  const oneDay = oneHour * 24;
  
  // Helper to create notification
  const createNotif = (index, hoursAgo, isToday = false) => {
    const template = templates[index % templates.length];
    const project = projects[index % projects.length];
    const user = users[index % users.length];
    const task = tasks[index % tasks.length];
    const status = statuses[index % statuses.length];
    const comment = comments[index % comments.length];
    
    const message = template.messageTemplate
      .replace('{project}', project)
      .replace('{user}', user)
      .replace('{task}', task)
      .replace('{status}', status)
      .replace('{comment}', comment);
    
    const createdAt = new Date(now - (hoursAgo * oneHour)).toISOString();
    
    return {
      id: `notif-seed-${index + 1}`,
      userId,
      type: template.type,
      title: template.title,
      message,
      link: template.link,
      isRead: index >= 8, // First 8 are unread
      projectId: `proj-${(index % 3) + 1}`,
      taskId: template.type.includes('task') ? `task-${(index % 5) + 1}` : undefined,
      tab: index % 15 === 0 ? NOTIFICATION_TABS.WATCHING : NOTIFICATION_TABS.DIRECT,
      createdAt,
    };
  };
  
  let idx = 0;
  
  // TODAY: 15 notifications (0-23 hours ago)
  for (let i = 0; i < 15; i++) {
    const hoursAgo = i * 1.5 + Math.random();
    notifications.push(createNotif(idx++, hoursAgo, true));
  }
  
  // YESTERDAY: 20 notifications (24-47 hours ago)
  for (let i = 0; i < 20; i++) {
    const hoursAgo = 24 + (i * 1.1) + Math.random();
    notifications.push(createNotif(idx++, hoursAgo));
  }
  
  // OLDER: 85 notifications (48+ hours, spread over 2 weeks)
  for (let i = 0; i < 85; i++) {
    const hoursAgo = 48 + (i * 4) + Math.random() * 3;
    notifications.push(createNotif(idx++, hoursAgo));
  }
  
  // Sort newest first
  notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  return notifications;
};

// Initial mock notifications
export const initialNotifications = generateSeedNotifications();

// In-memory store
let notifications = [...initialNotifications];

// Helper to generate unique IDs
const generateId = (prefix) => 
  `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Get the notifications store
 * @returns {Array} All notifications
 */
export const getNotificationsStore = () => notifications;

/**
 * Set the notifications store
 * @param {Array} newNotifications 
 */
export const setNotificationsStore = (newNotifications) => {
  notifications = newNotifications;
};

/**
 * Reset to initial state
 */
export const resetNotificationsStore = () => {
  notifications = [...initialNotifications];
};

/**
 * Get notifications for a specific user
 * @param {string} userId 
 * @returns {Array} User's notifications (newest first)
 */
export const getNotificationsByUser = (userId) => {
  return notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * Get notifications with pagination and filtering
 * @param {string} userId 
 * @param {Object} options - { limit, offset, unreadOnly, tab }
 * @returns {Object} { data, total, hasMore, nextOffset }
 */
export const getNotificationsPaginated = (userId, options = {}) => {
  const { limit = 20, offset = 0, unreadOnly = false, tab = 'direct' } = options;
  
  // Filter by user
  let filtered = notifications.filter((n) => n.userId === userId);
  
  // Filter by tab (for now, all are 'direct')
  if (tab === 'watching') {
    filtered = filtered.filter((n) => n.tab === 'watching');
  } else {
    filtered = filtered.filter((n) => !n.tab || n.tab === 'direct');
  }
  
  // Filter by unread
  if (unreadOnly) {
    filtered = filtered.filter((n) => !n.isRead);
  }
  
  // Sort by date (newest first)
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const total = filtered.length;
  const data = filtered.slice(offset, offset + limit);
  const hasMore = offset + limit < total;
  const nextOffset = hasMore ? offset + limit : null;
  
  return {
    data: data.map(n => ({ ...n })), // Clone to prevent mutations
    total,
    hasMore,
    nextOffset,
  };
};

/**
 * Get unread count for a user
 * @param {string} userId 
 * @returns {number} Unread notification count
 */
export const getUnreadCount = (userId) => {
  return notifications.filter((n) => n.userId === userId && !n.isRead).length;
};

/**
 * Create a new notification
 * @param {Object} notification - Notification data
 * @returns {Object} Created notification
 */
export const createNotification = (notification) => {
  const newNotification = {
    id: generateId('notif'),
    isRead: false,
    createdAt: new Date().toISOString(),
    ...notification,
  };

  notifications = [newNotification, ...notifications];
  return { ...newNotification };
};

/**
 * Mark a notification as read
 * @param {string} notificationId 
 * @returns {Object|null} Updated notification or null
 */
export const markNotificationAsRead = (notificationId) => {
  const index = notifications.findIndex((n) => n.id === notificationId);
  if (index === -1) return null;

  notifications[index] = { ...notifications[index], isRead: true };
  return { ...notifications[index] };
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId 
 * @returns {number} Number of notifications marked as read
 */
export const markAllNotificationsAsRead = (userId) => {
  let count = 0;
  notifications = notifications.map((n) => {
    if (n.userId === userId && !n.isRead) {
      count++;
      return { ...n, isRead: true };
    }
    return n;
  });
  return count;
};

/**
 * Delete a notification
 * @param {string} notificationId 
 * @returns {boolean} Success
 */
export const deleteNotification = (notificationId) => {
  const initialLength = notifications.length;
  notifications = notifications.filter((n) => n.id !== notificationId);
  return notifications.length < initialLength;
};

/**
 * Delete all notifications for a user
 * @param {string} userId 
 * @returns {number} Number deleted
 */
export const deleteAllNotifications = (userId) => {
  const initialLength = notifications.length;
  notifications = notifications.filter((n) => n.userId !== userId);
  return initialLength - notifications.length;
};
