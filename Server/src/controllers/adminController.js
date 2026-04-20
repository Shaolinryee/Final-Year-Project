const { User, Project, Task, AdminRole, AdminPermission, SystemLog, SystemSetting, ProjectPermission } = require('../models');
const { Op, DataTypes, fn, col } = require('sequelize');
const SystemEventTriggers = require('../utils/systemEventTriggers');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      recentLogs,
      systemSettings
    ] = await Promise.all([
      User.count(),
      Project.count(),
      Project.count({ where: { status: 'active' } }),
      Task.count(),
      Task.count({ where: { status: 'done' } }),
      SystemLog.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }]
      }),
      SystemSetting.count()
    ]);

    // Get user growth data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userGrowth = await User.findAll({
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']]
    });

    // Get project creation data for the last 30 days
    const projectGrowth = await Project.findAll({
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']]
    });

    // Get task completion rates
    const taskStats = await Task.findAll({
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['status']
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalProjects,
          activeProjects,
          totalTasks,
          completedTasks,
          taskCompletionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0,
          systemSettings
        },
        charts: {
          userGrowth: userGrowth.map(item => ({
            date: item.dataValues.date,
            count: parseInt(item.dataValues.count)
          })),
          projectGrowth: projectGrowth.map(item => ({
            date: item.dataValues.date,
            count: parseInt(item.dataValues.count)
          })),
          taskStats: taskStats.map(item => ({
            status: item.status,
            count: parseInt(item.dataValues.count)
          }))
        },
        recentLogs: recentLogs.map(log => ({
          id: log.id,
          action: log.action,
          resource: log.resource,
          severity: log.severity,
          createdAt: log.createdAt,
          user: log.user ? {
            id: log.user.id,
            name: log.user.name,
            email: log.user.email
          } : null
        }))
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get system health information
const getSystemHealth = async (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    // Get database connection status
    let dbStatus = 'connected';
    try {
      const { sequelize } = require('../config/database');
      await sequelize.authenticate();
    } catch (error) {
      dbStatus = 'disconnected';
    }

    // Get recent error logs
    const recentErrors = await SystemLog.findAll({
      where: {
        severity: {
          [Op.in]: ['error', 'critical']
        },
        createdAt: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      limit: 10,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        server: {
          uptime: Math.floor(uptime),
          memory: {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
            external: Math.round(memoryUsage.external / 1024 / 1024) // MB
          },
          nodeVersion: process.version
        },
        database: {
          status: dbStatus,
          dialect: require('../config/database').sequelize.getDialect()
        },
        errors: {
          count: recentErrors.length,
          recent: recentErrors.map(log => ({
            id: log.id,
            action: log.action,
            resource: log.resource,
            severity: log.severity,
            createdAt: log.createdAt
          }))
        }
      }
    });
  } catch (error) {
    console.error('Error getting system health:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get admin users list
const getAdminUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      role: 'admin'
    };

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      include: [{
        model: AdminRole,
        as: 'adminRole',
        attributes: ['id', 'name', 'displayName', 'level']
      }],
      attributes: ['id', 'name', 'email', 'isActive', 'lastLoginAt', 'loginCount', 'createdAt'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting admin users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get system settings
const getSystemSettings = async (req, res) => {
  try {
    const { category } = req.query;
    
    const whereClause = {};
    if (category) {
      whereClause.category = category;
    }

    const settings = await SystemSetting.findAll({
      where: whereClause,
      order: [['category', 'ASC'], ['key', 'ASC']]
    });

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error getting system settings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update system setting
const updateSystemSetting = async (req, res) => {
  try {
    const { key, value, type } = req.body;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Setting key is required'
      });
    }

    const setting = await SystemSetting.findOne({ where: { key } });

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    // Convert value based on type
    let convertedValue = value;
    if (type === 'boolean') {
      convertedValue = value === 'true' || value === true;
    } else if (type === 'number') {
      convertedValue = parseFloat(value);
    } else if (type === 'json') {
      convertedValue = JSON.stringify(value);
    }

    const oldValue = setting.value;
    
    await setting.update({
      value: convertedValue,
      updatedBy: req.user.id
    });

    // Trigger system event for critical settings
    const criticalSettings = ['maintenance_mode', 'registration_enabled', 'email_enabled', 'security_level'];
    if (criticalSettings.includes(key)) {
      await SystemEventTriggers.onSystemSettingChange(key, oldValue, convertedValue, req.user);
    }

    res.json({
      success: true,
      data: setting
    });
  } catch (error) {
    console.error('Error updating system setting:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get system settings schema
const getSettingsSchema = async (req, res) => {
  try {
    // Define settings schema with validation rules
    const schema = {
      general: [
        { key: 'systemName', label: 'System Name', type: 'string', required: true, validation: { minLength: 1, maxLength: 100 } },
        { key: 'systemDescription', label: 'System Description', type: 'text', required: false, validation: { maxLength: 500 } },
        { key: 'adminEmail', label: 'Admin Email', type: 'email', required: true },
        { key: 'timezone', label: 'Timezone', type: 'select', required: true, options: ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'] },
        { key: 'dateFormat', label: 'Date Format', type: 'select', required: true, options: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'] },
        { key: 'maintenanceMode', label: 'Maintenance Mode', type: 'boolean', required: false }
      ],
      users: [
        { key: 'defaultUserRole', label: 'Default User Role', type: 'select', required: true, options: ['user', 'admin'] },
        { key: 'registrationEnabled', label: 'Allow User Registration', type: 'boolean', required: false },
        { key: 'emailVerificationRequired', label: 'Require Email Verification', type: 'boolean', required: false },
        { key: 'passwordMinLength', label: 'Minimum Password Length', type: 'number', required: true, validation: { min: 6, max: 50 } },
        { key: 'sessionTimeout', label: 'Session Timeout (minutes)', type: 'number', required: true, validation: { min: 5, max: 1440 } },
        { key: 'maxLoginAttempts', label: 'Max Login Attempts', type: 'number', required: true, validation: { min: 3, max: 10 } }
      ],
      security: [
        { key: 'twoFactorEnabled', label: 'Two-Factor Authentication', type: 'boolean', required: false },
        { key: 'sessionSecure', label: 'Secure Session Cookies', type: 'boolean', required: false },
        { key: 'apiRateLimit', label: 'API Rate Limit (requests/minute)', type: 'number', required: true, validation: { min: 10, max: 1000 } },
        { key: 'ipWhitelist', label: 'IP Whitelist', type: 'text', required: false, validation: { pattern: /^[\d.,\s]*$/ } },
        { key: 'auditLogRetention', label: 'Audit Log Retention (days)', type: 'number', required: true, validation: { min: 7, max: 365 } },
        { key: 'passwordComplexity', label: 'Password Complexity Required', type: 'boolean', required: false }
      ],
      email: [
        { key: 'smtpServer', label: 'SMTP Server', type: 'text', required: true, validation: { maxLength: 255 } },
        { key: 'smtpPort', label: 'SMTP Port', type: 'number', required: true, validation: { min: 1, max: 65535 } },
        { key: 'smtpUsername', label: 'SMTP Username', type: 'text', required: false },
        { key: 'smtpPassword', label: 'SMTP Password', type: 'password', required: false },
        { key: 'fromEmail', label: 'From Email Address', type: 'email', required: true },
        { key: 'emailTemplates', label: 'Email Templates', type: 'json', required: false }
      ],
      notifications: [
        { key: 'emailNotificationsEnabled', label: 'Email Notifications', type: 'boolean', required: false },
        { key: 'systemNotificationsEnabled', label: 'System Notifications', type: 'boolean', required: false },
        { key: 'notificationTypes', label: 'Notification Types', type: 'array', required: false },
        { key: 'notificationFrequency', label: 'Notification Frequency', type: 'select', required: true, options: ['immediate', 'daily', 'weekly'] },
        { key: 'adminNotifications', label: 'Admin Notifications', type: 'boolean', required: false }
      ],
      backup: [
        { key: 'autoBackup', label: 'Automatic Backup', type: 'boolean', required: false },
        { key: 'backupFrequency', label: 'Backup Frequency', type: 'select', required: true, options: ['daily', 'weekly', 'monthly'] },
        { key: 'backupRetention', label: 'Backup Retention (days)', type: 'number', required: true, validation: { min: 1, max: 365 } },
        { key: 'backupLocation', label: 'Backup Location', type: 'text', required: true },
        { key: 'backupEncryption', label: 'Backup Encryption', type: 'boolean', required: false }
      ],
      performance: [
        { key: 'cacheEnabled', label: 'Enable Caching', type: 'boolean', required: false },
        { key: 'cacheTTL', label: 'Cache TTL (seconds)', type: 'number', required: true, validation: { min: 60, max: 86400 } },
        { key: 'maxFileUploadSize', label: 'Max File Upload Size (MB)', type: 'number', required: true, validation: { min: 1, max: 100 } },
        { key: 'concurrentUsers', label: 'Max Concurrent Users', type: 'number', required: true, validation: { min: 10, max: 1000 } },
        { key: 'dbConnectionPool', label: 'Database Connection Pool', type: 'number', required: true, validation: { min: 1, max: 50 } }
      ],
      integration: [
        { key: 'apiKeys', label: 'API Keys', type: 'json', required: false },
        { key: 'webhookUrls', label: 'Webhook URLs', type: 'json', required: false },
        { key: 'thirdPartyServices', label: 'Third-party Services', type: 'json', required: false },
        { key: 'ssoEnabled', label: 'Single Sign-On', type: 'boolean', required: false },
        { key: 'ldapConfiguration', label: 'LDAP Configuration', type: 'json', required: false }
      ]
    };

    res.json({
      success: true,
      data: schema
    });
  } catch (error) {
    console.error('Error getting settings schema:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update multiple system settings
const updateMultipleSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    if (!Array.isArray(settings) || settings.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Settings array is required'
      });
    }

    const updates = await Promise.all(
      settings.map(async ({ key, value, type }) => {
        const setting = await SystemSetting.findOne({ where: { key } });
        
        if (!setting) {
          // Create new setting if it doesn't exist
          return SystemSetting.create({
            key,
            value: type === 'boolean' ? (value === 'true' || value === true) : 
                   type === 'number' ? parseFloat(value) : 
                   type === 'json' ? JSON.stringify(value) : value,
            type,
            updatedBy: req.user.id
          });
        } else {
          // Update existing setting
          let convertedValue = value;
          if (type === 'boolean') {
            convertedValue = value === 'true' || value === true;
          } else if (type === 'number') {
            convertedValue = parseFloat(value);
          } else if (type === 'json') {
            convertedValue = JSON.stringify(value);
          }

          return setting.update({
            value: convertedValue,
            updatedBy: req.user.id
          });
        }
      })
    );

    res.json({
      success: true,
      data: updates
    });
  } catch (error) {
    console.error('Error updating multiple settings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Reset all settings to defaults
const resetSystemSettings = async (req, res) => {
  try {
    // Delete all existing settings
    await SystemSetting.destroy({ where: {} });

    // Get default settings from schema
    const defaultSettings = {
      general: [
        { key: 'systemName', value: 'Task Management System', type: 'string' },
        { key: 'systemDescription', value: 'A comprehensive task management platform', type: 'text' },
        { key: 'adminEmail', value: 'admin@example.com', type: 'email' },
        { key: 'timezone', value: 'UTC', type: 'select' },
        { key: 'dateFormat', value: 'MM/DD/YYYY', type: 'select' },
        { key: 'maintenanceMode', value: false, type: 'boolean' }
      ],
      users: [
        { key: 'defaultUserRole', value: 'user', type: 'select' },
        { key: 'registrationEnabled', value: true, type: 'boolean' },
        { key: 'emailVerificationRequired', value: true, type: 'boolean' },
        { key: 'passwordMinLength', value: 8, type: 'number' },
        { key: 'sessionTimeout', value: 120, type: 'number' },
        { key: 'maxLoginAttempts', value: 5, type: 'number' }
      ],
      security: [
        { key: 'twoFactorEnabled', value: false, type: 'boolean' },
        { key: 'sessionSecure', value: true, type: 'boolean' },
        { key: 'apiRateLimit', value: 100, type: 'number' },
        { key: 'ipWhitelist', value: '', type: 'text' },
        { key: 'auditLogRetention', value: 90, type: 'number' },
        { key: 'passwordComplexity', value: true, type: 'boolean' }
      ],
      email: [
        { key: 'smtpServer', value: 'smtp.gmail.com', type: 'text' },
        { key: 'smtpPort', value: 587, type: 'number' },
        { key: 'smtpUsername', value: '', type: 'text' },
        { key: 'smtpPassword', value: '', type: 'password' },
        { key: 'fromEmail', value: 'noreply@taskmanagement.com', type: 'email' },
        { key: 'emailTemplates', value: '{}', type: 'json' }
      ],
      notifications: [
        { key: 'emailNotificationsEnabled', value: true, type: 'boolean' },
        { key: 'systemNotificationsEnabled', value: true, type: 'boolean' },
        { key: 'notificationTypes', value: ["user_registration", "system_alerts", "security_events"], type: 'array' },
        { key: 'notificationFrequency', value: 'immediate', type: 'select' },
        { key: 'adminNotifications', value: true, type: 'boolean' }
      ],
      backup: [
        { key: 'autoBackup', value: true, type: 'boolean' },
        { key: 'backupFrequency', value: 'daily', type: 'select' },
        { key: 'backupRetention', value: 30, type: 'number' },
        { key: 'backupLocation', value: '/backups', type: 'text' },
        { key: 'backupEncryption', value: true, type: 'boolean' }
      ],
      performance: [
        { key: 'cacheEnabled', value: true, type: 'boolean' },
        { key: 'cacheTTL', value: 3600, type: 'number' },
        { key: 'maxFileUploadSize', value: 10, type: 'number' },
        { key: 'concurrentUsers', value: 100, type: 'number' },
        { key: 'dbConnectionPool', value: 10, type: 'number' }
      ],
      integration: [
        { key: 'apiKeys', value: '{}', type: 'json' },
        { key: 'webhookUrls', value: '{}', type: 'json' },
        { key: 'thirdPartyServices', value: '{}', type: 'json' },
        { key: 'ssoEnabled', value: false, type: 'boolean' },
        { key: 'ldapConfiguration', value: '{}', type: 'json' }
      ]
    };

    // Create default settings
    await SystemSetting.bulkCreate(
      Object.entries(defaultSettings).flatMap(([category, settings]) =>
        settings.map(setting => ({
          key: setting.key,
          value: setting.value,
          type: setting.type,
          category,
          updatedBy: req.user.id
        }))
      )
    );

    res.json({
      success: true,
      message: 'Settings reset to defaults'
    });
  } catch (error) {
    console.error('Error resetting system settings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Export settings configuration
const exportSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.findAll({
      order: [['category', 'ASC'], ['key', 'ASC']]
    });

    // Convert to JSON format for export
    const exportData = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {};
      }
      acc[setting.category][setting.key] = setting.value;
      return acc;
    }, {});

    res.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    console.error('Error exporting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Import settings configuration
const importSettings = async (req, res) => {
  try {
    const { configData } = req.body;

    if (!configData || typeof configData !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Valid configuration data is required'
      });
    }

    // Clear existing settings
    await SystemSetting.destroy({ where: {} });

    // Import new settings
    const importPromises = Object.entries(configData).flatMap(([category, settings]) =>
      Object.entries(settings).map(([key, value]) =>
        SystemSetting.create({
          key,
          value,
          type: typeof value === 'boolean' ? 'boolean' : 
                 typeof value === 'number' ? 'number' : 
                 typeof value === 'string' ? 'string' : 'json',
          category,
          updatedBy: req.user.id
        })
      )
    );

    await Promise.all(importPromises);

    res.json({
      success: true,
      message: 'Settings imported successfully'
    });
  } catch (error) {
    console.error('Error importing settings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get settings change history
const getSettingsHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const history = await SystemSetting.findAll({
      include: [
        {
          model: User,
          as: 'updatedByUser',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['updatedAt', 'DESC']],
      limit,
      offset
    });

    const total = await SystemSetting.count();

    res.json({
      success: true,
      data: {
        history: history.map(setting => ({
          id: setting.id,
          key: setting.key,
          value: setting.value,
          type: setting.type,
          category: setting.category,
          updatedAt: setting.updatedAt,
          updatedBy: setting.updatedByUser
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting settings history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get activity logs
const getActivityLogs = async (req, res) => {
  try {
    // Handle both array formats: actions[] and actions
    const {
      page = 1,
      limit = 50,
      dateRange,
      customStartDate,
      customEndDate,
      users,
      actions,
      resources,
      severities,
      categories,
      searchTerm
    } = req.query;
    
    // Extract array parameters that might have brackets
    const extractedActions = req.query['actions[]'] || actions;
    const extractedUsers = req.query['users[]'] || users;
    const extractedResources = req.query['resources[]'] || resources;
    const extractedSeverities = req.query['severities[]'] || severities;
    const extractedCategories = req.query['categories[]'] || categories;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Date range filtering
    if (dateRange && dateRange !== 'custom') {
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
        default:
          startDate.setDate(now.getDate() - 7);
      }

      whereClause.createdAt = {
        [Op.gte]: startDate
      };
    } else if (dateRange === 'custom' && customStartDate && customEndDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(customStartDate), new Date(customEndDate)]
      };
    }

    // User filtering
    if (extractedUsers && extractedUsers.length > 0) {
      const userIds = Array.isArray(extractedUsers) ? extractedUsers : [extractedUsers];
      whereClause.userId = {
        [Op.in]: userIds
      };
    }

    // Action filtering
    if (extractedActions && extractedActions.length > 0) {
      const actionList = Array.isArray(extractedActions) ? extractedActions : [extractedActions];
      whereClause.action = {
        [Op.in]: actionList
      };
    }

    // Resource filtering
    if (extractedResources && extractedResources.length > 0) {
      const resourceList = Array.isArray(extractedResources) ? extractedResources : [extractedResources];
      whereClause.resource = {
        [Op.in]: resourceList
      };
    }

    // Severity filtering
    if (extractedSeverities && extractedSeverities.length > 0) {
      const severityList = Array.isArray(extractedSeverities) ? extractedSeverities : [extractedSeverities];
      whereClause.severity = {
        [Op.in]: severityList
      };
    }

    // Category filtering
    if (extractedCategories && extractedCategories.length > 0) {
      const categoryList = Array.isArray(extractedCategories) ? extractedCategories : [extractedCategories];
      whereClause.category = {
        [Op.in]: categoryList
      };
    }

    // Search term filtering
    if (searchTerm) {
      whereClause[Op.or] = [
        { action: { [Op.iLike]: `%${searchTerm}%` } },
        { resource: { [Op.iLike]: `%${searchTerm}%` } },
        { category: { [Op.iLike]: `%${searchTerm}%` } }
      ];
    }

    const { count, rows: logs } = await SystemLog.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get specific log details
const getLogDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await SystemLog.findOne({
      where: { id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role', 'adminRoleId']
        }
      ]
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Log not found'
      });
    }

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Error getting log details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get analytics data for logs
const getLogsAnalytics = async (req, res) => {
  try {
    const { dateRange = '30days' } = req.query;

    // Calculate date range
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
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const whereClause = {
      createdAt: {
        [Op.gte]: startDate
      }
    };

    // Get total logs
    const totalLogs = await SystemLog.count({ where: whereClause });

    // Get active users
    const activeUsers = await SystemLog.count({
      where: whereClause,
      distinct: true,
      col: 'userId'
    });

    // Get critical events
    const criticalEvents = await SystemLog.count({
      where: {
        ...whereClause,
        severity: 'critical'
      }
    });

    // Get error events
    const errorEvents = await SystemLog.count({
      where: {
        ...whereClause,
        severity: {
          [Op.in]: ['error', 'critical']
        }
      }
    });

    // Calculate error rate
    const errorRate = totalLogs > 0 ? ((errorEvents / totalLogs) * 100).toFixed(1) : 0;

    // Get action distribution
    const actionDistribution = await SystemLog.findAll({
      where: whereClause,
      attributes: [
        'action',
        [fn('COUNT', col('action')), 'count']
      ],
      group: ['action'],
      order: [[fn('COUNT', col('action')), 'DESC']],
      limit: 10
    });

    // Get severity distribution
    const severityDistribution = await SystemLog.findAll({
      where: whereClause,
      attributes: [
        'severity',
        [fn('COUNT', col('severity')), 'count']
      ],
      group: ['severity'],
      order: [['severity', 'ASC']]
    });

    // Get top active users
    const topUsers = await SystemLog.findAll({
      where: whereClause,
      attributes: [
        'userId',
        [fn('COUNT', col('userId')), 'count']
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      group: ['userId', 'user.id', 'user.name', 'user.email'],
      order: [[fn('COUNT', col('userId')), 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      data: {
        totalLogs,
        activeUsers,
        criticalEvents,
        errorRate: parseFloat(errorRate),
        actionDistribution: actionDistribution.map(item => ({
          action: item.action,
          count: parseInt(item.dataValues.count)
        })),
        severityDistribution: severityDistribution.map(item => ({
          severity: item.severity,
          count: parseInt(item.dataValues.count)
        })),
        topUsers: topUsers.map(item => ({
          user: item.user,
          count: parseInt(item.dataValues.count)
        }))
      }
    });
  } catch (error) {
    console.error('Error getting logs analytics:', error);
    // Return fallback data instead of error
    res.json({
      success: true,
      data: {
        totalLogs: 0,
        activeUsers: 0,
        criticalEvents: 0,
        errorRate: 0,
        actionDistribution: [],
        severityDistribution: [],
        topUsers: []
      }
    });
  }
};

// Get list of users for filtering
const getLogUsers = async (req, res) => {
  try {
    const users = await SystemLog.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      where: {
        userId: {
          [Op.not]: null
        }
      },
      attributes: ['userId'],
      group: ['userId', 'user.id', 'user.name', 'user.email'],
      order: [['user', 'name', 'ASC']]
    });

    const uniqueUsers = users
      .filter(log => log.user)
      .map(log => ({
        id: log.user.id,
        name: log.user.name,
        email: log.user.email
      }));

    res.json({
      success: true,
      data: uniqueUsers
    });
  } catch (error) {
    console.error('Error getting log users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get list of actions for filtering
const getLogActions = async (req, res) => {
  try {
    const actions = await SystemLog.findAll({
      attributes: [
        'action',
        [fn('COUNT', col('action')), 'count']
      ],
      group: ['action'],
      order: [[fn('COUNT', col('action')), 'DESC']]
    });

    const actionList = actions.map(item => item.action);

    res.json({
      success: true,
      data: actionList
    });
  } catch (error) {
    console.error('Error getting log actions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get list of resources for filtering
const getLogResources = async (req, res) => {
  try {
    const resources = await SystemLog.findAll({
      attributes: [
        'resource',
        [fn('COUNT', col('resource')), 'count']
      ],
      group: ['resource'],
      order: [[fn('COUNT', col('resource')), 'DESC']]
    });

    const resourceList = resources.map(item => item.resource);

    res.json({
      success: true,
      data: resourceList
    });
  } catch (error) {
    console.error('Error getting log resources:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get list of categories for filtering
const getLogCategories = async (req, res) => {
  try {
    const categories = await SystemLog.findAll({
      attributes: [
        'category',
        [fn('COUNT', col('category')), 'count']
      ],
      group: ['category'],
      order: [[fn('COUNT', col('category')), 'DESC']]
    });

    const categoryList = categories.map(item => item.category);

    res.json({
      success: true,
      data: categoryList
    });
  } catch (error) {
    console.error('Error getting log categories:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Export logs data
const exportLogs = async (req, res) => {
  try {
    const { format = 'csv', ...filters } = req.query;

    // Build where clause based on filters (same as getActivityLogs)
    const whereClause = {};
    
    // Apply same filtering logic as getActivityLogs
    if (filters.dateRange && filters.dateRange !== 'custom') {
      const now = new Date();
      let startDate = new Date();

      switch (filters.dateRange) {
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
        default:
          startDate.setDate(now.getDate() - 7);
      }

      whereClause.createdAt = {
        [Op.gte]: startDate
      };
    }

    // Apply other filters...
    if (filters.users && filters.users.length > 0) {
      const userIds = Array.isArray(filters.users) ? filters.users : [filters.users];
      whereClause.userId = { [Op.in]: userIds };
    }

    if (filters.actions && filters.actions.length > 0) {
      const actionList = Array.isArray(filters.actions) ? filters.actions : [filters.actions];
      whereClause.action = { [Op.in]: actionList };
    }

    if (filters.resources && filters.resources.length > 0) {
      const resourceList = Array.isArray(filters.resources) ? filters.resources : [filters.resources];
      whereClause.resource = { [Op.in]: resourceList };
    }

    if (filters.severities && filters.severities.length > 0) {
      const severityList = Array.isArray(filters.severities) ? filters.severities : [filters.severities];
      whereClause.severity = { [Op.in]: severityList };
    }

    if (filters.categories && filters.categories.length > 0) {
      const categoryList = Array.isArray(filters.categories) ? filters.categories : [filters.categories];
      whereClause.category = { [Op.in]: categoryList };
    }

    const logs = await SystemLog.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10000 // Limit export size
    });

    if (format === 'csv') {
      // Convert to CSV
      const csvHeader = 'ID,Action,Resource,Severity,Category,User Name,User Email,IP Address,User Agent,Created At,Details\n';
      const csvData = logs.map(log => {
        const details = log.details ? JSON.stringify(log.details).replace(/"/g, '""') : '';
        return [
          log.id,
          log.action,
          log.resource,
          log.severity,
          log.category,
          log.user?.name || '',
          log.user?.email || '',
          log.ipAddress || '',
          log.userAgent || '',
          log.createdAt.toISOString(),
          `"${details}"`
        ].join(',');
      }).join('\n');

      const csv = csvHeader + csvData;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=activity-logs.csv');
      res.send(csv);
    } else if (format === 'json') {
      // Convert to JSON
      const jsonData = logs.map(log => ({
        id: log.id,
        action: log.action,
        resource: log.resource,
        severity: log.severity,
        category: log.category,
        user: log.user ? {
          id: log.user.id,
          name: log.user.name,
          email: log.user.email
        } : null,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
        details: log.details
      }));

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=activity-logs.json');
      res.json(jsonData);
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid export format'
      });
    }
  } catch (error) {
    console.error('Error exporting logs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all users with admin role
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    // Add search filter
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Add role filter
    if (role) {
      whereClause.role = role;
    }

    // Add status filter
    if (status === 'active') {
      whereClause.isActive = true;
      whereClause.suspendedAt = null;
    } else if (status === 'suspended') {
      whereClause.isActive = false;
      whereClause.suspendedAt = { [Op.not]: null };
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'name', 'email', 'role', 'isActive', 'lastLoginAt', 'loginCount', 'suspendedAt', 'createdAt'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Suspend user
const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent suspending yourself
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot suspend yourself'
      });
    }

    await user.update({
      isActive: false,
      suspendedAt: new Date(),
      suspendedBy: req.user.id,
      suspensionReason: reason
    });

    // Trigger system event
    await SystemEventTriggers.onUserSuspension(user, req.user, reason, true);

    res.json({
      success: true,
      message: 'User suspended successfully',
      data: user
    });
  } catch (error) {
    console.error('Error suspending user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Unsuspend user
const unsuspendUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({
      isActive: true,
      suspendedAt: null,
      suspendedBy: null,
      suspensionReason: null
    });

    // Trigger system event
    await SystemEventTriggers.onUserSuspension(user, req.user, 'User unsuspended', false);

    res.json({
      success: true,
      message: 'User unsuspended successfully',
      data: user
    });
  } catch (error) {
    console.error('Error unsuspending user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Toggle user status (active/inactive)
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent toggling yourself
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own status'
      });
    }

    const newStatus = !user.isActive;
    
    await user.update({
      isActive: newStatus,
      suspendedAt: newStatus ? null : new Date(),
      suspendedBy: newStatus ? null : req.user.id,
      suspensionReason: newStatus ? null : 'Disabled by admin'
    });

    res.json({
      success: true,
      message: `User ${newStatus ? 'enabled' : 'disabled'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Change user role
const assignAdminRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { roleId } = req.body; // Changed from adminRoleId to roleId

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent changing your own role
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    // Validate role
    const validRoles = ['user', 'admin'];
    if (!validRoles.includes(roleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    await user.update({
      role: roleId
    });

    res.json({
      success: true,
      message: `Role changed to ${roleId} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Error changing user role:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all projects for admin management
const getAllProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};

    // Add search filter
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { key: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Add status filter
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const { count, rows: projects } = await Project.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        },
        {
          model: ProjectPermission,
          as: 'permissions',
          attributes: ['role', 'permissionKey', 'isEnabled']
        }
      ],
      attributes: ['id', 'name', 'key', 'description', 'status', 'color', 'createdAt'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get project permissions matrix
const getProjectPermissions = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Get all permission overrides for this project
    const permissionOverrides = await ProjectPermission.findAll({
      where: { projectId: id },
      attributes: ['role', 'permissionKey', 'isEnabled', 'createdAt', 'createdBy'],
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    // Define all available permissions by category
    const permissionCategories = {
      project: [
        { key: 'canManageProject', label: 'Manage Project Settings', description: 'Edit project name, description, key' },
        { key: 'canDeleteProject', label: 'Delete Project', description: 'Delete entire project' },
        { key: 'canArchiveProject', label: 'Archive Project', description: 'Archive/unarchive project' }
      ],
      members: [
        { key: 'canInviteMembers', label: 'Invite Members', description: 'Add new members to project' },
        { key: 'canManageMembers', label: 'Manage Members', description: 'Remove members from project' },
        { key: 'canChangeRoles', label: 'Change Roles', description: 'Modify member roles' }
      ],
      tasks: [
        { key: 'canCreateTask', label: 'Create Tasks', description: 'Create new tasks' },
        { key: 'canEditAnyTask', label: 'Edit Any Task', description: 'Edit any task in project' },
        { key: 'canDeleteTask', label: 'Delete Tasks', description: 'Delete tasks from project' },
        { key: 'canAssignTasks', label: 'Assign Tasks', description: 'Assign tasks to members' }
      ],
      content: [
        { key: 'canAddComments', label: 'Add Comments', description: 'Comment on tasks' },
        { key: 'canAddAttachments', label: 'Add Attachments', description: 'Upload files to tasks' },
        { key: 'canViewActivity', label: 'View Activity', description: 'View project activity feed' }
      ]
    };

    // Build permission matrix
    const roles = ['owner', 'admin', 'member'];
    const permissionMatrix = {};

    Object.entries(permissionCategories).forEach(([category, permissions]) => {
      permissionMatrix[category] = {};
      
      permissions.forEach(permission => {
        permissionMatrix[category][permission.key] = {
          label: permission.label,
          description: permission.description,
          overrides: {}
        };

        roles.forEach(role => {
          const override = permissionOverrides.find(p => 
            p.permissionKey === permission.key && p.role === role
          );
          
          permissionMatrix[category][permission.key].overrides[role] = {
            enabled: override ? override.isEnabled : null, // null = use default
            overridden: !!override,
            createdAt: override?.createdAt,
            createdBy: override?.creator
          };
        });
      });
    });

    res.json({
      success: true,
      data: {
        project,
        permissionMatrix,
        permissionOverrides
      }
    });
  } catch (error) {
    console.error('Error fetching project permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update project permissions
const updateProjectPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body; // Format: { role: { permissionKey: boolean } }

    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Get existing permissions for this project
    const existingPermissions = await ProjectPermission.findAll({
      where: { projectId: id }
    });

    const updatedPermissions = [];
    const deletedPermissions = [];

    // Process each role and permission
    Object.entries(permissions).forEach(([role, rolePermissions]) => {
      Object.entries(rolePermissions).forEach(([permissionKey, isEnabled]) => {
        const existingPermission = existingPermissions.find(p => 
          p.role === role && p.permissionKey === permissionKey
        );

        if (existingPermission) {
          if (isEnabled === null || isEnabled === undefined) {
            // Remove override (use default)
            deletedPermissions.push(existingPermission.id);
          } else {
            // Update existing override
            existingPermission.isEnabled = isEnabled;
            existingPermission.createdBy = req.user.id;
            updatedPermissions.push(existingPermission.save());
          }
        } else if (isEnabled !== null && isEnabled !== undefined) {
          // Create new override
          updatedPermissions.push(ProjectPermission.create({
            projectId: id,
            role,
            permissionKey,
            isEnabled,
            createdBy: req.user.id
          }));
        }
      });
    });

    // Delete removed overrides
    if (deletedPermissions.length > 0) {
      await ProjectPermission.destroy({
        where: { id: deletedPermissions }
      });
    }

    // Wait for all updates to complete
    await Promise.all(updatedPermissions);

    // Log the permission change
    await SystemLog.create({
      action: 'update_project_permissions',
      details: `Updated permissions for project: ${project.name}`,
      userId: req.user.id,
      projectId: id
    });

    res.json({
      success: true,
      message: 'Project permissions updated successfully'
    });
  } catch (error) {
    console.error('Error updating project permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Reset project permissions to defaults
const resetProjectPermissions = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Delete all permission overrides for this project
    const deletedCount = await ProjectPermission.destroy({
      where: { projectId: id }
    });

    // Log the reset
    await SystemLog.create({
      action: 'reset_project_permissions',
      details: `Reset permissions to defaults for project: ${project.name}`,
      userId: req.user.id,
      projectId: id
    });

    res.json({
      success: true,
      message: `Reset ${deletedCount} permission overrides to defaults`
    });
  } catch (error) {
    console.error('Error resetting project permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getDashboardStats,
  getSystemHealth,
  getAdminUsers,
  getAllUsers,
  suspendUser,
  unsuspendUser,
  toggleUserStatus,
  assignAdminRole,
  getSystemSettings,
  updateSystemSetting,
  getSettingsSchema,
  updateMultipleSettings,
  resetSystemSettings,
  exportSettings,
  importSettings,
  getSettingsHistory,
  getActivityLogs,
  getLogDetails,
  getLogsAnalytics,
  getLogUsers,
  getLogActions,
  getLogResources,
  getLogCategories,
  exportLogs,
  getAllProjects,
  getProjectPermissions,
  updateProjectPermissions,
  resetProjectPermissions
};
