const { Activity } = require('../models');

/**
 * Log a user activity
 * @param {Object} data - Data for activity record
 * @param {string} data.userId - ID of user performing action
 * @param {string} data.action - Action performed (enum)
 * @param {string} [data.projectId] - Related project ID
 * @param {string} [data.taskId] - Related task ID
 * @param {string} [data.details] - Additional info
 */
const logActivity = async ({ userId, action, projectId, taskId, details }) => {
  try {
    await Activity.create({
      userId,
      action,
      projectId: projectId || null,
      taskId: taskId || null,
      details: details || ''
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw error to avoid breaking the main request flow
  }
};

module.exports = { logActivity };
