const { Notification } = require('../models');
const { emitToUser } = require('../socket');

const sendNotification = async ({ userId, type, title, message, projectId, taskId, link }) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      projectId,
      taskId,
      link
    });

    // Emit the notification real-time via socket
    emitToUser(userId, 'new_notification', notification);

    return notification;
  } catch (error) {
    console.error('Error in sendNotification:', error);
    // Do not throw error so it does not interrupt the main operation
    return null;
  }
};

module.exports = {
  sendNotification
};
