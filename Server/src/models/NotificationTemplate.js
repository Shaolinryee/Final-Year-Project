const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NotificationTemplate = sequelize.define(
  'NotificationTemplate',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM('system_alerts', 'user_management', 'security_events', 'admin_actions', 'system_health', 'global'),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Template content
    subject: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    inAppTemplate: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    emailTemplate: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    smsTemplate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Variables that can be used in templates
    variables: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    // Status
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // Localization
    language: {
      type: DataTypes.STRING,
      defaultValue: 'en',
    },
    // Metadata
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    tableName: 'notification_templates',
    timestamps: true,
    indexes: [
      {
        fields: ['type', 'category'],
      },
      {
        fields: ['isActive'],
      },
      {
        fields: ['language'],
      },
    ],
  }
);

module.exports = NotificationTemplate;
