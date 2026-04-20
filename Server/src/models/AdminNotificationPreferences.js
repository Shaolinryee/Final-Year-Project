const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AdminNotificationPreferences = sequelize.define(
  'AdminNotificationPreferences',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    // Category preferences
    systemAlerts: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    userManagement: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    securityEvents: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    adminActions: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    systemHealth: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // Priority preferences
    minPriorityLevel: {
      type: DataTypes.ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW'),
      defaultValue: 'MEDIUM',
    },
    // Delivery preferences
    inAppNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    emailNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    smsNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // Quiet hours
    quietHoursEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    quietHoursStart: {
      type: DataTypes.STRING, // HH:mm format
      allowNull: true,
    },
    quietHoursEnd: {
      type: DataTypes.STRING, // HH:mm format
      allowNull: true,
    },
    // Batch preferences
    batchFrequency: {
      type: DataTypes.ENUM('realtime', 'daily', 'weekly'),
      defaultValue: 'realtime',
    },
    batchCategories: {
      type: DataTypes.JSON, // Array of categories to batch
      defaultValue: [],
    },
  },
  {
    tableName: 'admin_notification_preferences',
    timestamps: true,
  }
);

module.exports = AdminNotificationPreferences;
