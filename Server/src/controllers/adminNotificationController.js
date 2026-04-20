const { 
  SystemNotification, 
  AdminNotificationPreferences, 
  NotificationTemplate, 
  NotificationDeliveryLog,
  User,
  sequelize 
} = require('../models');
const { sendGlobalNotification } = require('../utils/adminNotification');
const { emitToAdmin } = require('../socket');
const { Op } = require('sequelize');

/**
 * Get admin notifications with filtering and pagination
 */
const getAdminNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      priority,
      type,
      unreadOnly = false,
      dateRange = '30days'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Filter by current admin
    whereClause[Op.or] = [
      { targetAllAdmins: true },
      { targetAdminIds: { [Op.contains]: [req.user.id] } }
    ];

    // Category filter
    if (category) {
      whereClause.category = category;
    }

    // Priority filter
    if (priority) {
      whereClause.priority = priority;
    }

    // Type filter
    if (type) {
      whereClause.type = type;
    }

    // Unread filter - simplified for now
    // TODO: Implement proper JSONB unread filter
    if (unreadOnly === 'true') {
      // Skip unread filter for now
    }

    // Date range filter
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();

      switch (dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case '7days':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(now.getDate() - 90);
          break;
      }

      whereClause.createdAt = { [Op.gte]: startDate };
    }

    // Exclude expired notifications
    whereClause[Op.or] = [
      { expiresAt: null },
      { expiresAt: { [Op.gt]: new Date() } }
    ];

    const { count, rows: notifications } = await SystemNotification.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    // Mark notifications as read if requested - simplified for now
    const markAsRead = req.query.markAsRead === 'true';
    // TODO: Implement proper mark as read functionality
    if (markAsRead && notifications.length > 0) {
      console.log('Mark as read functionality to be implemented');
    }

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting admin notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get notification categories and counts
 */
const getNotificationCategories = async (req, res) => {
  try {
    const whereClause = {
      [Op.or]: [
        { targetAllAdmins: true },
        { targetAdminIds: { [Op.contains]: [req.user.id] } }
      ]
    };

    // Exclude expired notifications
    whereClause[Op.or] = [
      { expiresAt: null },
      { expiresAt: { [Op.gt]: new Date() } }
    ];

    const categories = await SystemNotification.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [
          sequelize.literal('0'), // Simplified unread count for now
          'unread'
        ]
      ],
      where: whereClause,
      group: ['category'],
      order: [['category', 'ASC']]
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error getting notification categories:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get notification statistics
 */
const getNotificationStats = async (req, res) => {
  try {
    const whereClause = {
      [Op.or]: [
        { targetAllAdmins: true },
        { targetAdminIds: { [Op.contains]: [req.user.id] } }
      ]
    };

    // Exclude expired notifications
    whereClause[Op.or] = [
      { expiresAt: null },
      { expiresAt: { [Op.gt]: new Date() } }
    ];

    // Total and unread counts
    const totalCount = await SystemNotification.count({ where: whereClause });
    
    // Unread count - for now, use total count as all notifications are unread
    // TODO: Fix proper JSONB query for readBy array
    const unreadCount = totalCount;

    // Priority distribution
    const priorityStats = await SystemNotification.findAll({
      attributes: [
        'priority',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: whereClause,
      group: ['priority'],
      order: [['priority', 'ASC']]
    });

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentCount = await SystemNotification.count({
      where: {
        ...whereClause,
        createdAt: { [Op.gte]: sevenDaysAgo }
      }
    });

    res.json({
      success: true,
      data: {
        total: totalCount,
        unread: unreadCount,
        priorityDistribution: priorityStats,
        recentActivity: recentCount
      }
    });
  } catch (error) {
    console.error('Error getting notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get admin notification preferences
 */
const getNotificationPreferences = async (req, res) => {
  try {
    let preferences = await AdminNotificationPreferences.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await AdminNotificationPreferences.create({
        userId: req.user.id
      });
      
      // Reload with user association
      preferences = await AdminNotificationPreferences.findOne({
        where: { userId: req.user.id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email']
          }
        ]
      });
    }

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update notification preferences
 */
const updateNotificationPreferences = async (req, res) => {
  try {
    const {
      systemAlerts,
      userManagement,
      securityEvents,
      adminActions,
      systemHealth,
      minPriorityLevel,
      inAppNotifications,
      emailNotifications,
      smsNotifications,
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd,
      batchFrequency,
      batchCategories
    } = req.body;

    const preferences = await AdminNotificationPreferences.findOne({
      where: { userId: req.user.id }
    });

    if (!preferences) {
      return res.status(404).json({
        success: false,
        message: 'Notification preferences not found'
      });
    }

    await preferences.update({
      systemAlerts,
      userManagement,
      securityEvents,
      adminActions,
      systemHealth,
      minPriorityLevel,
      inAppNotifications,
      emailNotifications,
      smsNotifications,
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd,
      batchFrequency,
      batchCategories
    });

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Send global notification
 */
const sendGlobalNotificationController = async (req, res) => {
  try {
    const {
      title,
      message,
      priority = 'MEDIUM',
      details = {},
      actionLink = null,
      expiresAt = null
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    const notification = await sendGlobalNotification({
      title,
      message,
      priority,
      details,
      actionLink,
      createdBy: req.user.id,
      expiresAt
    });

    // Emit real-time notification to all admin users
    try {
      const adminUsers = await User.findAll({
        where: {
          email: {
            [Op.like]: '%admin%'
          }
        },
        attributes: ['id']
      });

      adminUsers.forEach(admin => {
        emitToAdmin(admin.id, 'admin_notification', {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          category: notification.category,
          createdAt: notification.createdAt,
          details: notification.details,
          actionLink: notification.actionLink
        });
      });
    } catch (socketError) {
      console.error('Socket emission error:', socketError);
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error sending global notification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Mark notification as read
 */
const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await SystemNotification.findOne({
      where: { 
        id,
        [Op.or]: [
          { targetAllAdmins: true },
          sequelize.literal(`"targetAdminIds"::jsonb ? '${req.user.id}'`)
        ]
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Add admin to readBy array if not already there
    if (!notification.readBy || !notification.readBy.includes(req.user.id)) {
      await notification.update({
        readBy: [...notification.readBy, req.user.id]
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Mark all notifications as read
 */
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { category, priority, type } = req.query;

    const whereClause = {
      [Op.or]: [
        { targetAllAdmins: true },
        { targetAdminIds: { [Op.contains]: [req.user.id] } }
      ],
      [Op.not]: sequelize.literal(`"readBy" @> ARRAY['${req.user.id}']`)
    };

    // Apply filters if provided
    if (category) whereClause.category = category;
    if (priority) whereClause.priority = priority;
    if (type) whereClause.type = type;

    const [updatedCount] = await SystemNotification.update(
      {
        readBy: sequelize.literal(`array_append("readBy", '${req.user.id}')`)
      },
      { where: whereClause }
    );

    res.json({
      success: true,
      data: { updatedCount }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Delete notification
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await SystemNotification.findOne({
      where: { 
        id,
        [Op.or]: [
          { targetAllAdmins: true },
          { targetAdminIds: { [Op.contains]: [req.user.id] } }
        ]
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.destroy();

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get notification templates
 */
const getNotificationTemplates = async (req, res) => {
  try {
    const { category, type } = req.query;

    const whereClause = { isActive: true };
    if (category) whereClause.category = category;
    if (type) whereClause.type = type;

    const templates = await NotificationTemplate.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name']
        }
      ],
      order: [['category', 'ASC'], ['type', 'ASC']]
    });

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error getting notification templates:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get delivery statistics
 */
const getDeliveryStats = async (req, res) => {
  try {
    const { dateRange = '30days' } = req.query;

    const whereClause = {};
    
    // Date range filter
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();

      switch (dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case '7days':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(now.getDate() - 90);
          break;
      }

      whereClause.sentAt = { [Op.gte]: startDate };
    }

    const deliveryStats = await NotificationDeliveryLog.findAll({
      attributes: [
        'deliveryMethod',
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: whereClause,
      group: ['deliveryMethod', 'status'],
      order: [['deliveryMethod', 'ASC'], ['status', 'ASC']]
    });

    res.json({
      success: true,
      data: deliveryStats
    });
  } catch (error) {
    console.error('Error getting delivery stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAdminNotifications,
  getNotificationCategories,
  getNotificationStats,
  getNotificationPreferences,
  updateNotificationPreferences,
  sendGlobalNotificationController,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationTemplates,
  getDeliveryStats
};
