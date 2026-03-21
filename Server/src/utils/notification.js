const { Notification } = require('../models');
const { emitToUser } = require('../socket');

/**
 * Send an in-app notification to a user
 * @param {Object} data - Notification data
 * @param {string} data.userId - Recipient user ID
 * @param {string} data.type - Type of notification (assigned_task, project_invite, etc.)
 * @param {string} data.title - Notification title
 * @param {string} data.message - Notification message
 * @param {string} [data.projectId] - Related project ID
 * @param {string} [data.taskId] - Related task ID
 * @param {string} [data.link] - Deep link for the notification
 * @param {string} [data.tab] - Tab it belongs to (direct, watching)
 */
const sendNotification = async ({ userId, type, title, message, projectId, taskId, link, tab = 'direct' }) => {
  try {
    if (!userId) return;

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      projectId: projectId || null,
      taskId: taskId || null,
      link: link || null,
      tab
    });
    
    // Emit via Socket.io for instant delivery
    emitToUser(userId, 'new_notification', notification);
    
    console.log(`Notification sent and emitted to User ${userId}: ${title}`);
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};

module.exports = { sendNotification };
