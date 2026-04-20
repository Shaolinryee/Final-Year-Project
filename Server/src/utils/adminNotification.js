const { 
  AdminNotificationPreferences, 
  SystemNotification, 
  NotificationTemplate, 
  NotificationDeliveryLog, 
  User 
} = require('../models');
const { emitToUser } = require('../socket');
const { sendEmail } = require('../utils/email');

// Priority levels for filtering
const PRIORITY_LEVELS = {
  'CRITICAL': 0,
  'HIGH': 1,
  'MEDIUM': 2,
  'LOW': 3
};

/**
 * Send admin notification with intelligent routing
 */
const sendAdminNotification = async ({
  type,
  category,
  priority = 'MEDIUM',
  title,
  message,
  details = {},
  targetAdminIds = null, // null = all admins
  actionLink = null,
  createdBy = null,
  source = 'system'
}) => {
  try {
    // Get all admin users
    const admins = await User.findAll({
      where: { role: 'admin', isActive: true },
      attributes: ['id', 'email', 'name']
    });

    if (admins.length === 0) {
      console.log('No active admins found for notification');
      return;
    }

    // Filter target admins if specified
    const targetAdmins = targetAdminIds 
      ? admins.filter(admin => targetAdminIds.includes(admin.id))
      : admins;

    // Create system notification
    const systemNotification = await SystemNotification.create({
      type,
      category,
      priority,
      title,
      message,
      details,
      targetAllAdmins: !targetAdminIds,
      targetAdminIds: targetAdminIds || null,
      createdBy,
      source,
      actionLink
    });

    // Get notification template
    const template = await getNotificationTemplate(type, category);

    // Process each admin
    for (const admin of targetAdmins) {
      const preferences = await getAdminPreferences(admin.id);
      
      // Check if admin should receive this notification
      if (!shouldReceiveNotification(preferences, category, priority)) {
        continue;
      }

      // Check quiet hours
      if (isQuietHours(preferences) && priority !== 'CRITICAL') {
        continue;
      }

      // Determine delivery methods
      const deliveryMethods = getDeliveryMethods(preferences, priority);

      // Prepare notification data
      const notificationData = prepareNotificationData({
        admin,
        systemNotification,
        template,
        details,
        actionLink
      });

      // Send via each delivery method
      for (const method of deliveryMethods) {
        await deliverNotification(method, notificationData);
      }
    }

    return systemNotification;
  } catch (error) {
    console.error('Error in sendAdminNotification:', error);
    return null;
  }
};

/**
 * Get notification template for type and category
 */
const getNotificationTemplate = async (type, category) => {
  try {
    const template = await NotificationTemplate.findOne({
      where: { 
        type, 
        category, 
        isActive: true,
        language: 'en' // TODO: support multiple languages
      }
    });

    return template;
  } catch (error) {
    console.error('Error getting notification template:', error);
    return null;
  }
};

/**
 * Get admin notification preferences
 */
const getAdminPreferences = async (adminId) => {
  try {
    let preferences = await AdminNotificationPreferences.findOne({
      where: { userId: adminId }
    });

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await AdminNotificationPreferences.create({
        userId: adminId
      });
    }

    return preferences;
  } catch (error) {
    console.error('Error getting admin preferences:', error);
    // Return default preferences
    return {
      systemAlerts: true,
      userManagement: true,
      securityEvents: true,
      adminActions: true,
      systemHealth: true,
      minPriorityLevel: 'MEDIUM',
      inAppNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      quietHoursEnabled: false,
      batchFrequency: 'realtime'
    };
  }
};

/**
 * Check if admin should receive notification based on preferences
 */
const shouldReceiveNotification = (preferences, category, priority) => {
  // Check category preference
  const categoryMap = {
    'system_alerts': preferences.systemAlerts,
    'user_management': preferences.userManagement,
    'security_events': preferences.securityEvents,
    'admin_actions': preferences.adminActions,
    'system_health': preferences.systemHealth,
    'global': true // Global notifications always enabled
  };

  if (!categoryMap[category]) {
    return false;
  }

  // Check priority preference
  const adminPriorityLevel = PRIORITY_LEVELS[preferences.minPriorityLevel] || 2;
  const notificationPriorityLevel = PRIORITY_LEVELS[priority] || 2;

  return notificationPriorityLevel <= adminPriorityLevel;
};

/**
 * Check if current time is within quiet hours
 */
const isQuietHours = (preferences) => {
  if (!preferences.quietHoursEnabled) {
    return false;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  if (!preferences.quietHoursStart || !preferences.quietHoursEnd) {
    return false;
  }

  const [startHour, startMin] = preferences.quietHoursStart.split(':').map(Number);
  const [endHour, endMin] = preferences.quietHoursEnd.split(':').map(Number);
  
  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;

  if (startTime <= endTime) {
    // Same day
    return currentTime >= startTime && currentTime <= endTime;
  } else {
    // Overnight (e.g., 22:00 to 06:00)
    return currentTime >= startTime || currentTime <= endTime;
  }
};

/**
 * Get delivery methods based on preferences and priority
 */
const getDeliveryMethods = (preferences, priority) => {
  const methods = [];

  // In-app notifications
  if (preferences.inAppNotifications) {
    methods.push('in_app');
  }

  // Email notifications for medium+ priority
  if (preferences.emailNotifications && PRIORITY_LEVELS[priority] <= 2) {
    methods.push('email');
  }

  // SMS notifications for critical priority
  if (preferences.smsNotifications && priority === 'CRITICAL') {
    methods.push('sms');
  }

  return methods;
};

/**
 * Prepare notification data with template variables
 */
const prepareNotificationData = ({ admin, systemNotification, template, details, actionLink }) => {
  const variables = {
    adminName: admin.name,
    adminEmail: admin.email,
    title: systemNotification.title,
    message: systemNotification.message,
    details: details,
    actionLink: actionLink,
    createdAt: systemNotification.createdAt,
    priority: systemNotification.priority,
    category: systemNotification.category,
    ...details
  };

  let title = systemNotification.title;
  let message = systemNotification.message;
  let emailSubject = systemNotification.title;
  let emailBody = systemNotification.message;
  let smsMessage = systemNotification.title;

  if (template) {
    title = replaceTemplateVariables(template.inAppTemplate || template.name, variables);
    message = replaceTemplateVariables(template.inAppTemplate || template.name, variables);
    emailSubject = replaceTemplateVariables(template.subject || title, variables);
    emailBody = replaceTemplateVariables(template.emailTemplate || message, variables);
    smsMessage = replaceTemplateVariables(template.smsTemplate || title, variables);
  }

  return {
    admin,
    systemNotification,
    title,
    message,
    emailSubject,
    emailBody,
    smsMessage,
    variables
  };
};

/**
 * Replace template variables in string
 */
const replaceTemplateVariables = (template, variables) => {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), value);
  }

  return result;
};

/**
 * Deliver notification via specified method
 */
const deliverNotification = async (method, data) => {
  try {
    const { admin, systemNotification, title, message, emailSubject, emailBody, smsMessage } = data;

    // Create delivery log
    const deliveryLog = await NotificationDeliveryLog.create({
      notificationId: systemNotification.id,
      adminId: admin.id,
      deliveryMethod: method,
      status: 'pending'
    });

    let success = false;
    let errorMessage = null;

    switch (method) {
      case 'in_app':
        success = await deliverInAppNotification(admin, systemNotification, title, message);
        break;
      case 'email':
        success = await deliverEmailNotification(admin, emailSubject, emailBody, systemNotification.actionLink);
        break;
      case 'sms':
        success = await deliverSmsNotification(admin, smsMessage);
        break;
      default:
        throw new Error(`Unknown delivery method: ${method}`);
    }

    // Update delivery log
    await deliveryLog.update({
      status: success ? 'sent' : 'failed',
      sentAt: new Date(),
      errorMessage: errorMessage
    });

    return success;
  } catch (error) {
    console.error(`Error delivering ${method} notification:`, error);
    return false;
  }
};

/**
 * Deliver in-app notification
 */
const deliverInAppNotification = async (admin, systemNotification, title, message) => {
  try {
    // Create regular notification for admin
    const { Notification } = require('../models');
    const notification = await Notification.create({
      userId: admin.id,
      type: 'admin_notification',
      title,
      message,
      link: systemNotification.actionLink || `/admin/notifications/${systemNotification.id}`,
      tab: 'direct'
    });

    // Real-time delivery via socket
    emitToUser(admin.id, 'new_notification', notification);

    return true;
  } catch (error) {
    console.error('Error delivering in-app notification:', error);
    return false;
  }
};

/**
 * Deliver email notification
 */
const deliverEmailNotification = async (admin, subject, body, actionLink) => {
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin-bottom: 16px;">${subject}</h2>
          <div style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            ${body}
          </div>
          ${actionLink ? `
            <div style="text-align: center; margin-top: 24px;">
              <a href="${actionLink}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Details
              </a>
            </div>
          ` : ''}
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          This is an automated notification from the Task Management System.
        </div>
      </div>
    `;

    await sendEmail({
      to: admin.email,
      subject: `[Admin Alert] ${subject}`,
      html: emailHtml
    });

    return true;
  } catch (error) {
    console.error('Error delivering email notification:', error);
    return false;
  }
};

/**
 * Deliver SMS notification (placeholder)
 */
const deliverSmsNotification = async (admin, message) => {
  try {
    // TODO: Implement SMS delivery using a service like Twilio
    console.log(`SMS to ${admin.phone || 'N/A'}: ${message}`);
    return true;
  } catch (error) {
    console.error('Error delivering SMS notification:', error);
    return false;
  }
};

/**
 * Send global system notification
 */
const sendGlobalNotification = async ({
  title,
  message,
  priority = 'MEDIUM',
  details = {},
  actionLink = null,
  createdBy = null,
  expiresAt = null
}) => {
  return sendAdminNotification({
    type: 'global_announcement',
    category: 'global',
    priority,
    title,
    message,
    details,
    targetAdminIds: null, // All admins
    actionLink,
    createdBy,
    source: 'admin_panel',
    expiresAt
  });
};

module.exports = {
  sendAdminNotification,
  sendGlobalNotification,
  PRIORITY_LEVELS
};
