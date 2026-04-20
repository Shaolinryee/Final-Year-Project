const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SystemNotification = sequelize.define(
  'SystemNotification',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM(
        // System Alerts
        'server_high_cpu',
        'server_high_memory',
        'storage_warning',
        'database_error',
        'service_down',
        // User Management
        'user_registration',
        'user_suspension',
        'mass_user_import',
        'role_change',
        'suspicious_activity',
        // Security Events
        'failed_login_attempt',
        'permission_change',
        'data_export',
        'admin_impersonation',
        'security_breach',
        // Admin Actions
        'system_setting_change',
        'user_deletion',
        'backup_operation',
        'maintenance_mode',
        'admin_role_assignment',
        // System Health
        'backup_failure',
        'database_optimization',
        'email_service_issues',
        'api_rate_limit',
        'performance_degradation',
        // Global Notifications
        'global_announcement',
        'maintenance_notification',
        'emergency_alert',
        'feature_update',
        'policy_change'
      ),
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM('system_alerts', 'user_management', 'security_events', 'admin_actions', 'system_health', 'global'),
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW'),
      allowNull: false,
      defaultValue: 'MEDIUM',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    // Targeting
    targetAllAdmins: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    targetAdminIds: {
      type: DataTypes.JSON, // Array of admin UUIDs
      allowNull: true,
    },
    // Status
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    readBy: {
      type: DataTypes.JSONB, // Array of admin UUIDs who read it
      defaultValue: [],
    },
    // Delivery tracking
    deliveryMethods: {
      type: DataTypes.JSON, // ['in_app', 'email', 'sms']
      defaultValue: ['in_app'],
    },
    deliveryStatus: {
      type: DataTypes.JSON, // { in_app: 'delivered', email: 'sent', sms: 'failed' }
      defaultValue: {},
    },
    // Scheduling
    scheduledFor: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Metadata
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING, // Source system/component
      allowNull: true,
    },
    actionLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'system_notifications',
    timestamps: true,
    indexes: [
      {
        fields: ['type', 'createdAt'],
      },
      {
        fields: ['category', 'priority'],
      },
      {
        fields: ['targetAllAdmins'],
      },
      {
        fields: ['scheduledFor'],
      },
    ],
  }
);

module.exports = SystemNotification;
